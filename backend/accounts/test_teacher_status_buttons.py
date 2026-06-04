"""Tests for the teacher status action buttons (issue #5).

The teacher portal used to put `is_active` and `is_email_verified` as
checkboxes in a Status card on the edit form. We aligned to the admin
pattern: dedicated POST endpoints that flip the flag and redirect back
to the detail page with a flash message.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse


User = get_user_model()


def make_teacher(email, **extra):
    extra.setdefault('username', email.split('@')[0])
    extra.setdefault('is_email_verified', True)
    extra.setdefault('role', User.ROLE_TEACHER)
    return User.objects.create_user(
        email=email, password='Tr0ub4dor&3pix', **extra,
    )


def make_student(email, **extra):
    extra.setdefault('username', email.split('@')[0])
    extra.setdefault('is_email_verified', True)
    extra.setdefault('role', User.ROLE_STUDENT)
    return User.objects.create_user(
        email=email, password='Tr0ub4dor&3pix', **extra,
    )


class TeacherToggleActiveTests(TestCase):

    def setUp(self):
        self.teacher = make_teacher('t@example.com')
        self.student = make_student('s@example.com', is_active=True)
        self.student.teachers.add(self.teacher)
        self.client.force_login(self.teacher)

    def test_toggle_active_disables(self):
        url = reverse('teacher_student_toggle_active', args=[self.student.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 302)
        self.student.refresh_from_db()
        self.assertFalse(self.student.is_active)

    def test_toggle_active_re_enables(self):
        self.student.is_active = False
        self.student.save(update_fields=['is_active'])
        url = reverse('teacher_student_toggle_active', args=[self.student.id])
        self.client.post(url)
        self.student.refresh_from_db()
        self.assertTrue(self.student.is_active)

    def test_toggle_redirects_to_detail_page(self):
        url = reverse('teacher_student_toggle_active', args=[self.student.id])
        resp = self.client.post(url)
        self.assertTrue(resp.url.endswith(f'/student/{self.student.id}/'))

    def test_get_request_is_405(self):
        url = reverse('teacher_student_toggle_active', args=[self.student.id])
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 405)
        # State unchanged
        self.student.refresh_from_db()
        self.assertTrue(self.student.is_active)

    def test_other_teachers_student_404(self):
        other_teacher = make_teacher('o@example.com')
        other_student = make_student('os@example.com')
        other_student.teachers.add(other_teacher)
        url = reverse('teacher_student_toggle_active', args=[other_student.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 404)
        other_student.refresh_from_db()
        self.assertTrue(other_student.is_active)


class TeacherToggleVerifiedTests(TestCase):

    def setUp(self):
        self.teacher = make_teacher('t@example.com')
        self.student = make_student('s@example.com', is_email_verified=True)
        self.student.teachers.add(self.teacher)
        self.client.force_login(self.teacher)

    def test_toggle_unverifies(self):
        url = reverse('teacher_student_toggle_verified', args=[self.student.id])
        self.client.post(url)
        self.student.refresh_from_db()
        self.assertFalse(self.student.is_email_verified)

    def test_toggle_reverifies(self):
        self.student.is_email_verified = False
        self.student.save(update_fields=['is_email_verified'])
        url = reverse('teacher_student_toggle_verified', args=[self.student.id])
        self.client.post(url)
        self.student.refresh_from_db()
        self.assertTrue(self.student.is_email_verified)

    def test_other_teachers_student_404(self):
        other_teacher = make_teacher('o@example.com')
        other_student = make_student('os@example.com')
        other_student.teachers.add(other_teacher)
        url = reverse('teacher_student_toggle_verified', args=[other_student.id])
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, 404)


class TeacherEditFormNoLongerHasStatusCheckboxesTests(TestCase):
    """The edit form should not render visible status checkboxes - those
    moved to action buttons on the detail page. Hidden inputs preserve
    the current values so saving the form doesn't blow them away."""

    def setUp(self):
        self.teacher = make_teacher('t@example.com')
        self.student = make_student('s@example.com')
        self.student.teachers.add(self.teacher)
        self.client.force_login(self.teacher)

    def test_status_section_header_gone(self):
        resp = self.client.get(reverse('teacher_student_edit', args=[self.student.id]))
        body = resp.content.decode()
        # Old "STATUS" heading inside the form is gone
        self.assertNotIn('Account active', body)
        self.assertNotIn('unchecking forces re-verification', body)

    def test_hidden_inputs_preserve_status(self):
        resp = self.client.get(reverse('teacher_student_edit', args=[self.student.id]))
        body = resp.content.decode()
        self.assertIn('type="hidden" name="is_active"', body)
        self.assertIn('type="hidden" name="is_email_verified"', body)

    def test_saving_form_keeps_status_unchanged(self):
        # Submit the form (status sent via hidden inputs); student's
        # is_active stays as it was.
        original_active = self.student.is_active
        original_verified = self.student.is_email_verified
        resp = self.client.post(
            reverse('teacher_student_edit', args=[self.student.id]),
            {
                'display_name': 'Updated',
                'bio': '',
                'department': '',
                'section': '',
                'year_level': '',
                'xp': str(self.student.xp),
                'current_hearts': str(self.student.current_hearts),
                'max_hearts': str(self.student.max_hearts),
                'current_streak': str(self.student.current_streak),
                'longest_streak': str(self.student.longest_streak),
                'is_active': 'on' if original_active else '',
                'is_email_verified': 'on' if original_verified else '',
            },
        )
        self.assertEqual(resp.status_code, 302)
        self.student.refresh_from_db()
        self.assertEqual(self.student.is_active, original_active)
        self.assertEqual(self.student.is_email_verified, original_verified)


class TeacherDetailPageHasActionButtonsTests(TestCase):

    def setUp(self):
        self.teacher = make_teacher('t@example.com')
        self.student = make_student('s@example.com')
        self.student.teachers.add(self.teacher)
        self.client.force_login(self.teacher)

    def test_detail_page_has_enable_disable_button(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.student.id]))
        body = resp.content.decode()
        self.assertIn(reverse('teacher_student_toggle_active', args=[self.student.id]), body)
        self.assertIn('Disable user', body)  # student starts active

    def test_detail_shows_enable_when_disabled(self):
        self.student.is_active = False
        self.student.save(update_fields=['is_active'])
        resp = self.client.get(reverse('teacher_student_detail', args=[self.student.id]))
        body = resp.content.decode()
        self.assertIn('Enable user', body)

    def test_detail_page_has_verify_unverify_button(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.student.id]))
        body = resp.content.decode()
        self.assertIn(reverse('teacher_student_toggle_verified', args=[self.student.id]), body)
        # Student is verified by default in the helper
        self.assertIn('Unverify', body)
