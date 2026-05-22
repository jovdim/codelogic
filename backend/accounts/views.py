"""
Views for user authentication and profile management.
"""

from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from django.utils import timezone

from .models import EmailVerificationToken, PasswordResetToken, LoginFaceSnapshot
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer,
    ResendVerificationSerializer,
    DeleteAccountSerializer,
)

User = get_user_model()


def send_verification_email(user, token):
    """Send email verification link to user."""
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token.token}"
    
    subject = 'Verify your CodeLogic account'
    
    # Plain text version (keep it short to avoid line wrapping issues)
    text_content = f"""Welcome to CodeLogic!

Verify your email: {verification_url}

This link expires in 24 hours.

- The CodeLogic Team"""
    
    # HTML version
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to CodeLogic!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <p style="margin: 20px 0;">
            <a href="{verification_url}" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
                Verify Email
            </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #7c3aed;">{verification_url}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <p>- The CodeLogic Team</p>
    </body>
    </html>
    """
    
    msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)


def send_account_lockout_email(user, token):
    """Sent when a user is auto-locked after too many failed login attempts.
    Reuses the existing email-verification token; clicking the link flips
    is_email_verified back to True and reactivates the account."""
    activate_url = f"{settings.FRONTEND_URL}/verify-email?token={token.token}"

    subject = 'Your CodeLogic account has been locked'

    text_content = f"""Account Locked

Your CodeLogic account ({user.email}) was locked because of too many
failed sign-in attempts.

Reactivate your account: {activate_url}

This link expires in 24 hours.

If this wasn't you, someone may be trying to access your account. Consider
resetting your password after you reactivate.

- The CodeLogic Team"""

    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Account Locked</h2>
        <p>Your CodeLogic account (<strong>{user.email}</strong>) was locked
           because of too many failed sign-in attempts.</p>
        <p style="margin: 20px 0;">
            <a href="{activate_url}"
               style="background-color: #7c3aed; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 4px; display: inline-block;">
                Reactivate Account
            </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #7c3aed;">{activate_url}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If this wasn't you, someone may be trying to access your account.
           Consider resetting your password after you reactivate.</p>
        <p>- The CodeLogic Team</p>
    </body>
    </html>
    """

    msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)


def send_password_reset_email(user, token):
    """Send password reset link to user."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token.token}"
    
    subject = 'Reset your CodeLogic password'
    
    # Plain text version
    text_content = f"""Password Reset Request

Reset your password: {reset_url}

This link expires in 1 hour.

If you did not request this, please ignore this email.

- The CodeLogic Team"""
    
    # HTML version
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <p style="margin: 20px 0;">
            <a href="{reset_url}" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
            </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #7c3aed;">{reset_url}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        <p>- The CodeLogic Team</p>
    </body>
    </html>
    """
    
    msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)


class RegisterView(APIView):
    """Handle user registration with email verification."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create and send verification token
            token = EmailVerificationToken.create_token(user)
            try:
                send_verification_email(user, token)
            except Exception as e:
                # Log the error but don't fail registration
                print(f"Failed to send verification email: {e}")
            
            return Response({
                'message': 'Registration successful. Please check your email to verify your account.',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'username': user.username,
                    'avatar': user.avatar,
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    """Verify user email with token."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Debug: Print the received data
        print(f"DEBUG: Received data: {request.data}")
        
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            token_string = serializer.validated_data['token']
            
            # Debug: Print the token
            print(f"DEBUG: Token received: '{token_string}'")
            print(f"DEBUG: Token length: {len(token_string)}")
            
            # List all tokens in database for debugging
            all_tokens = EmailVerificationToken.objects.filter(is_used=False)
            for t in all_tokens:
                print(f"DEBUG: DB token: '{t.token}' (length: {len(t.token)})")
            
            try:
                token = EmailVerificationToken.objects.get(token=token_string)
            except EmailVerificationToken.DoesNotExist:
                print(f"DEBUG: Token not found in database!")
                return Response({
                    'error': 'Invalid verification token.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not token.is_valid():
                return Response({
                    'error': 'Verification token has expired or already been used.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify the user's email + reset the failed-login counter so
            # an account that was locked via 3 wrong attempts is fully
            # reactivated. (For a fresh signup verification this is a no-op
            # since the counter is already 0.)
            user = token.user
            user.is_email_verified = True
            user.failed_login_attempts = 0
            user.save(update_fields=['is_email_verified', 'failed_login_attempts'])

            # Mark token as used
            token.is_used = True
            token.save()
            
            return Response({
                'message': 'Email verified successfully. You can now log in.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationView(APIView):
    """Resend email verification link."""
    permission_classes = [AllowAny]
    # Rate-limited so a bad actor can't flood arbitrary inboxes.
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'verify_resend'

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Don't reveal if user exists
                return Response({
                    'message': 'If an account with this email exists, a verification link has been sent.'
                }, status=status.HTTP_200_OK)

            if user.is_email_verified:
                return Response({
                    'message': 'This email is already verified.'
                }, status=status.HTTP_200_OK)

            # Create new token and send email
            token = EmailVerificationToken.create_token(user)
            try:
                send_verification_email(user, token)
            except Exception as e:
                print(f"Failed to send verification email: {e}")

            return Response({
                'message': 'If an account with this email exists, a verification link has been sent.'
            }, status=status.HTTP_200_OK)


class RequestUnlockView(APIView):
    """
    Send the account-reactivation email after a user's account was locked
    by too many failed login attempts. Triggered manually by the user
    clicking "Send reactivation email" on the login page.

    Rate-limited per IP via ScopedRateThrottle('unlock_request') - see
    DEFAULT_THROTTLE_RATES in settings - so a bad actor can't repeatedly
    trigger emails to someone else's address.

    For privacy we don't reveal whether the email is registered or whether
    the account is actually locked - the response is the same in all cases.
    """
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'unlock_request'

    GENERIC_RESPONSE = {
        'message': 'If a locked account with this email exists, a reactivation link has been sent.'
    }

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)  # same shape: {email}
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(self.GENERIC_RESPONSE, status=status.HTTP_200_OK)

        # Only locked accounts get the unlock email; verified accounts get
        # the same generic response so we don't reveal account state.
        if user.is_email_verified:
            return Response(self.GENERIC_RESPONSE, status=status.HTTP_200_OK)

        token = EmailVerificationToken.create_token(user)
        try:
            send_account_lockout_email(user, token)
        except Exception as e:  # noqa: BLE001 - log + keep going
            print(f'Failed to send account-lockout email to {user.email}: {e}')

        return Response(self.GENERIC_RESPONSE, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Handle user login and return JWT tokens."""
    permission_classes = [AllowAny]

    # Wrong-password attempts allowed before the account auto-locks. Mirror
    # this constant in the frontend message so the UX matches the rule.
    FAILED_LOGIN_THRESHOLD = 3

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid email or password.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Already locked from previous attempts? Short-circuit before any
        # password work so the UI offers the "Send reactivation email"
        # button instead of pretending this is another wrong-password
        # attempt. We KEEP failed_login_attempts at the threshold while
        # locked - VerifyEmailView resets it back to 0 when the user
        # clicks the reactivation link.
        if (user.failed_login_attempts or 0) >= self.FAILED_LOGIN_THRESHOLD:
            return Response({
                'error': (
                    'Your account is locked due to too many failed sign-in attempts. '
                    'Use "Send reactivation email" below to unlock it.'
                ),
                'code': 'ACCOUNT_LOCKED',
            }, status=status.HTTP_403_FORBIDDEN)

        # Wrong password: increment counter, lock at threshold.
        if not user.check_password(password):
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1

            # Hit the threshold this attempt? Lock by clearing email-verified
            # (the same flag the verify-email link flips back). The reactivation
            # email is NOT sent automatically - the user has to click "Send
            # reactivation email" on the login page (rate-limited 5/hour) so
            # a bad actor can't spam someone else's inbox.
            if user.failed_login_attempts >= self.FAILED_LOGIN_THRESHOLD:
                user.is_email_verified = False
                user.save(update_fields=['failed_login_attempts', 'is_email_verified'])

                return Response({
                    'error': (
                        f'Account locked after {self.FAILED_LOGIN_THRESHOLD} failed '
                        'sign-in attempts. Use "Send reactivation email" below to '
                        'unlock it.'
                    ),
                    'code': 'ACCOUNT_LOCKED',
                }, status=status.HTTP_403_FORBIDDEN)

            user.save(update_fields=['failed_login_attempts'])
            attempts_left = max(
                0, self.FAILED_LOGIN_THRESHOLD - user.failed_login_attempts,
            )
            return Response({
                'error': 'Invalid email or password.',
                'attempts_left': attempts_left,
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Password correct from here on.
        if not user.is_active:
            return Response({
                'error': 'This account has been deactivated.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_email_verified:
            # Lockout case is already handled above, so this branch only
            # fires for never-verified signup accounts.
            return Response({
                'error': 'Please verify your email before logging in.',
                'code': 'EMAIL_NOT_VERIFIED'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Successful login - clear the failure counter.
        if user.failed_login_attempts:
            user.failed_login_attempts = 0
            user.save(update_fields=['failed_login_attempts'])

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Login successful.',
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            'user': UserProfileSerializer(user).data
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """Handle user logout by blacklisting refresh token."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'message': 'Logout successful.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Invalid token.'
            }, status=status.HTTP_400_BAD_REQUEST)


HEART_REGEN_MINUTES = 2  # Same as game/views.py


class ProfileView(APIView):
    """Get and update user profile."""
    permission_classes = [IsAuthenticated]
    
    def _regenerate_hearts(self, user):
        """Regenerate hearts based on time passed."""
        if user.current_hearts >= user.max_hearts:
            return
        now = timezone.now()
        time_diff = now - user.last_heart_update
        minutes_passed = time_diff.total_seconds() / 60
        hearts_to_add = int(minutes_passed // HEART_REGEN_MINUTES)
        if hearts_to_add > 0:
            user.current_hearts = min(user.max_hearts, user.current_hearts + hearts_to_add)
            user.last_heart_update = now
            user.save()
    
    def get(self, request):
        # Regenerate hearts before returning profile
        self._regenerate_hearts(request.user)
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request):
        # Check if trying to change display_name
        new_display_name = request.data.get('display_name')
        if new_display_name is not None and new_display_name != request.user.display_name:
            can_change, next_allowed = request.user.can_change_display_name()
            if not can_change:
                return Response({
                    'error': 'You can only change your display name once every 3 days.',
                    'next_change_allowed': next_allowed.isoformat() if next_allowed else None
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            # Update last_display_name_change if display name was changed
            if new_display_name is not None and new_display_name != request.user.display_name:
                request.user.last_display_name_change = timezone.now()
            serializer.save()
            return Response({
                'message': 'Profile updated successfully.',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change user password."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            if not user.check_password(serializer.validated_data['current_password']):
                return Response({
                    'error': 'Current password is incorrect.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': 'Password changed successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """Request password reset email."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                token = PasswordResetToken.create_token(user)
                try:
                    send_password_reset_email(user, token)
                except Exception as e:
                    print(f"Failed to send password reset email: {e}")
            except User.DoesNotExist:
                pass  # Don't reveal if user exists
            
            return Response({
                'message': 'If an account with this email exists, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token_string = serializer.validated_data['token']
            
            try:
                token = PasswordResetToken.objects.get(token=token_string)
            except PasswordResetToken.DoesNotExist:
                return Response({
                    'error': 'Invalid or expired reset token.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not token.is_valid():
                return Response({
                    'error': 'Invalid or expired reset token.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset the password
            user = token.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Mark token as used
            token.is_used = True
            token.save()
            
            return Response({
                'message': 'Password has been reset successfully. You can now log in with your new password.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ValidateResetTokenView(APIView):
    """Validate if a reset token is still valid."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        token_string = request.query_params.get('token')
        
        if not token_string:
            return Response({
                'valid': False,
                'error': 'Token is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = PasswordResetToken.objects.get(token=token_string)
            if token.is_valid():
                return Response({
                    'valid': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'valid': False,
                    'error': 'Token has expired or already been used.'
                }, status=status.HTTP_200_OK)
        except PasswordResetToken.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Invalid token.'
            }, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """Delete user account."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = DeleteAccountSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            if not user.check_password(serializer.validated_data['password']):
                return Response({
                    'error': 'Password is incorrect.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Soft delete - deactivate account
            user.is_active = False
            user.save()
            
            # Or hard delete:
            # user.delete()
            
            return Response({
                'message': 'Account has been deleted successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CheckUsernameView(APIView):
    """Check if username is available."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        username = request.query_params.get('username', '')
        
        if len(username) < 3:
            return Response({
                'available': False,
                'message': 'Username must be at least 3 characters.'
            })
        
        exists = User.objects.filter(username__iexact=username).exists()
        
        return Response({
            'available': not exists,
            'message': 'Username is available.' if not exists else 'Username is already taken.'
        })


class CheckEmailView(APIView):
    """Check if email is available."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        email = request.query_params.get('email', '').lower()
        
        if not email or '@' not in email:
            return Response({
                'available': False,
                'message': 'Please enter a valid email address.'
            })
        
        exists = User.objects.filter(email__iexact=email).exists()
        
        return Response({
            'available': not exists,
            'message': 'Email is available.' if not exists else 'Email is already registered.'
        })


class UpdateAvatarView(APIView):
    """Update user avatar."""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        avatar = request.data.get('avatar')
        
        if avatar is None:
            return Response({
                'error': 'Avatar is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            avatar = int(avatar)
        except (TypeError, ValueError):
            return Response({
                'error': 'Avatar must be a number between 1 and 5.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if avatar < 1 or avatar > 5:
            return Response({
                'error': 'Avatar must be between 1 and 5.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        request.user.avatar = avatar
        request.user.save(update_fields=['avatar'])

        return Response({
            'message': 'Avatar updated successfully.',
            'avatar': avatar
        }, status=status.HTTP_200_OK)


# Max bytes accepted for the post-login face snapshot. The browser sends
# ~640px JPEG at q=0.85 which is typically 30-80 KB, so 500 KB is a
# comfortable ceiling that still rejects obvious abuse.
LOGIN_FACE_PHOTO_MAX_BYTES = 500 * 1024


class LoginFaceVerifyView(APIView):
    """Receive and store the post-login face-verification snapshot.

    The frontend captures a single JPEG from the camera the moment the
    user passes the live face check. We **append** a new row to
    LoginFaceSnapshot every time so admins can review the full login
    history (impersonation / dispute investigations).

    Also still writes the latest snapshot to the legacy User fields so
    any older read paths keep working without a code change.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        photo = request.FILES.get('photo')
        if not photo:
            return Response(
                {'error': 'photo file is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if photo.size > LOGIN_FACE_PHOTO_MAX_BYTES:
            return Response(
                {'error': 'Photo is too large.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = photo.read()
        user = request.user
        # Append a new history row — this is the new source of truth.
        LoginFaceSnapshot.objects.create(user=user, photo=data)
        # Mirror to the legacy "latest" fields for backward compatibility.
        user.last_login_face_photo = data
        user.last_login_face_captured_at = timezone.now()
        user.save(update_fields=[
            'last_login_face_photo',
            'last_login_face_captured_at',
        ])
        return Response({'message': 'Face verification recorded.'},
                        status=status.HTTP_200_OK)
