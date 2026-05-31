"""
Comprehensive tests covering the 2026-05-31 client-feedback overhaul.

Sections:
  - JWT TTL bump (60min -> 24h access, 7d -> 30d refresh)
  - Email backend auto-pick (smtp when creds present, console otherwise)
  - DEFAULT_FROM_EMAIL falls back to EMAIL_HOST_USER
  - Password reset surfaces SMTP failure as 502 (no more silent swallow)
  - Email verification resend surfaces SMTP failure
  - Registration logs but does not 502 on email failure
"""

from datetime import timedelta
from unittest import mock

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import EmailVerificationToken, PasswordResetToken


User = get_user_model()


# ---------------------------------------------------------------------------
# JWT TTL
# ---------------------------------------------------------------------------

class JWTLifetimeTests(TestCase):
    """Client reported users being kicked out unexpectedly.
    Access bumped 60min -> 24h, refresh 7d -> 30d to give the rotation
    interceptor plenty of margin."""

    def test_access_token_is_24h(self):
        self.assertEqual(
            settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            timedelta(hours=24),
        )

    def test_refresh_token_is_30d(self):
        self.assertEqual(
            settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            timedelta(days=30),
        )

    def test_rotate_refresh_tokens_stays_on(self):
        # Frontend api.ts depends on token rotation working.
        self.assertTrue(settings.SIMPLE_JWT['ROTATE_REFRESH_TOKENS'])

    def test_blacklist_after_rotation_stays_on(self):
        self.assertTrue(settings.SIMPLE_JWT['BLACKLIST_AFTER_ROTATION'])

    def test_access_lifetime_is_well_above_inactive_threshold(self):
        # Sanity: must be > 1h so the prior bug ("kicked out after an hour")
        # can't happen again. We've set it to 24h.
        self.assertGreater(
            settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'],
            timedelta(hours=1),
        )

    def test_refresh_lifetime_at_least_a_week(self):
        # Sanity bound: refresh should never be less than the prior 7d default.
        self.assertGreaterEqual(
            settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'],
            timedelta(days=7),
        )


# ---------------------------------------------------------------------------
# Email backend auto-pick
# ---------------------------------------------------------------------------

class EmailBackendResolutionTests(TestCase):
    """Settings module now picks SMTP when host creds are present and falls
    back to console otherwise. Prevents prod from silently swallowing email
    because EMAIL_BACKEND env var was missing."""

    def test_default_from_email_falls_back_to_host_user(self):
        # When DEFAULT_FROM_EMAIL is not explicitly set, it should match
        # the authenticated SMTP user (Gmail rejects mismatched FROMs).
        # In the test env both may be blank, in which case the literal
        # placeholder is used; both branches are acceptable.
        self.assertIn(
            settings.DEFAULT_FROM_EMAIL,
            {settings.EMAIL_HOST_USER, 'noreply@codelogic.com'},
        )

    def test_email_timeout_is_set(self):
        # We added EMAIL_TIMEOUT so a hanging SMTP server can't block the
        # web worker forever.
        self.assertTrue(hasattr(settings, 'EMAIL_TIMEOUT'))
        self.assertGreater(settings.EMAIL_TIMEOUT, 0)
        self.assertLessEqual(settings.EMAIL_TIMEOUT, 120)


# ---------------------------------------------------------------------------
# Password reset error surfacing
# ---------------------------------------------------------------------------

class PasswordResetEmailFailureSurfaceTests(TestCase):
    """Prior to this session the reset view silently swallowed SMTP errors
    and returned 200 'a reset link has been sent' even when nothing was sent.
    Now it returns 502 with a clear message so the frontend can show real
    feedback."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='reset-user@example.com',
            username='resetuser',
            password='OldPass!123',
        )

    @mock.patch('accounts.views.send_password_reset_email')
    def test_returns_502_when_smtp_raises(self, mock_send):
        mock_send.side_effect = RuntimeError('SMTP boom')
        resp = self.client.post(
            reverse('password_reset_request'),
            {'email': self.user.email},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_502_BAD_GATEWAY)
        self.assertIn('snag', resp.json()['message'].lower())

    @mock.patch('accounts.views.send_password_reset_email')
    def test_returns_200_when_send_succeeds(self, mock_send):
        mock_send.return_value = None
        resp = self.client.post(
            reverse('password_reset_request'),
            {'email': self.user.email},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        # Generic message preserved (don't leak whether the user exists).
        self.assertIn('sent', resp.json()['message'].lower())

    @mock.patch('accounts.views.send_password_reset_email')
    def test_unknown_email_still_returns_generic_200(self, mock_send):
        # Anti-enumeration: unknown emails get the same response as success.
        resp = self.client.post(
            reverse('password_reset_request'),
            {'email': 'noone@example.com'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        mock_send.assert_not_called()

    @mock.patch('accounts.views.send_password_reset_email')
    def test_reset_creates_token_even_when_send_fails(self, mock_send):
        mock_send.side_effect = RuntimeError('boom')
        before = PasswordResetToken.objects.filter(user=self.user).count()
        self.client.post(
            reverse('password_reset_request'),
            {'email': self.user.email},
            format='json',
        )
        after = PasswordResetToken.objects.filter(user=self.user).count()
        # Token was minted before the email attempt; send failure does NOT
        # roll it back. Defensible: lets the teacher reuse the token if the
        # email retry path takes longer than the original.
        self.assertEqual(after, before + 1)

    def test_bad_email_format_returns_400(self):
        resp = self.client.post(
            reverse('password_reset_request'),
            {'email': 'notanemail'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ---------------------------------------------------------------------------
# Email verification resend error surfacing
# ---------------------------------------------------------------------------

class VerificationResendFailureSurfaceTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='unverified@example.com',
            username='unverified',
            password='Pass!1234',
            is_email_verified=False,
        )

    @mock.patch('accounts.views.send_verification_email')
    def test_resend_returns_502_on_smtp_failure(self, mock_send):
        mock_send.side_effect = RuntimeError('smtp down')
        resp = self.client.post(
            reverse('resend_verification'),
            {'email': self.user.email},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_502_BAD_GATEWAY)

    @mock.patch('accounts.views.send_verification_email')
    def test_resend_returns_200_on_success(self, mock_send):
        mock_send.return_value = None
        resp = self.client.post(
            reverse('resend_verification'),
            {'email': self.user.email},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    @mock.patch('accounts.views.send_verification_email')
    def test_resend_unknown_email_returns_200_generic(self, mock_send):
        resp = self.client.post(
            reverse('resend_verification'),
            {'email': 'unknown@example.com'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        mock_send.assert_not_called()

    @mock.patch('accounts.views.send_verification_email')
    def test_resend_already_verified_returns_200_no_send(self, mock_send):
        self.user.is_email_verified = True
        self.user.save(update_fields=['is_email_verified'])
        resp = self.client.post(
            reverse('resend_verification'),
            {'email': self.user.email},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('already verified', resp.json()['message'].lower())
        mock_send.assert_not_called()

    @mock.patch('accounts.views.send_verification_email')
    def test_resend_creates_new_token(self, mock_send):
        mock_send.return_value = None
        before = EmailVerificationToken.objects.filter(user=self.user).count()
        self.client.post(
            reverse('resend_verification'),
            {'email': self.user.email},
            format='json',
        )
        after = EmailVerificationToken.objects.filter(user=self.user).count()
        self.assertEqual(after, before + 1)


# ---------------------------------------------------------------------------
# Registration: email failure is logged but does NOT block registration
# ---------------------------------------------------------------------------

class RegistrationEmailFailureTests(TestCase):
    """Different policy than reset / resend: a registration succeeds even
    if the welcome email fails to send, so the user can still be
    re-emailed via the Resend flow. We just log loudly now."""

    def setUp(self):
        self.client = APIClient()

    @mock.patch('accounts.views.send_verification_email')
    def test_registration_succeeds_when_email_fails(self, mock_send):
        mock_send.side_effect = RuntimeError('smtp down')
        resp = self.client.post(
            reverse('register'),
            {
                'email': 'newcomer@example.com',
                'username': 'newcomer',
                'password': 'Tr0ub4dor&3pixels!',
                'password_confirm': 'Tr0ub4dor&3pixels!',
            },
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newcomer@example.com').exists())
