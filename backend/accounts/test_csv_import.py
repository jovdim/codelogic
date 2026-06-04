"""Tests for the admin CSV bulk-user import.

Locks:
  - Superuser can upload; staff non-superuser is blocked
  - Headers are case-insensitive
  - Missing required fields skip the row, don't crash
  - Existing email/username are skipped, not overwritten
  - Teacher role auto-flips is_staff = True
  - Year level validation (1-4 only)
  - Created users are email-verified (admin-vouched)
  - Counts in the report match
"""

import io

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse


User = get_user_model()


def make_superuser():
    return User.objects.create_superuser(
        email='su@example.com', username='su', password='Tr0ub4dor&3pix',
    )


def _csv(rows, header='email,username,password,role,year_level,section,department,display_name'):
    """Build a CSV upload payload for the test client."""
    body = header + '\n' + '\n'.join(rows)
    return io.BytesIO(body.encode('utf-8'))


class CsvImportPermissionTests(TestCase):

    def test_anon_redirected_to_admin_login(self):
        url = reverse('admin:accounts_user_import_csv')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 302)
        self.assertIn('login', resp.url)

    def test_staff_non_superuser_cannot_post(self):
        teacher = User.objects.create_user(
            email='t@example.com', username='t', password='Tr0ub4dor&3pix',
            is_staff=True, role=User.ROLE_TEACHER,
        )
        self.client.force_login(teacher)
        url = reverse('admin:accounts_user_import_csv')
        f = _csv(['noob@example.com,noob,Tr0ub4dor&3pix,student,1,A,IT,Noob'])
        resp = self.client.post(url, {'csv_file': f})
        # The view bounces them back to the user changelist
        self.assertEqual(resp.status_code, 302)
        self.assertFalse(User.objects.filter(email='noob@example.com').exists())

    def test_superuser_can_get_form(self):
        self.client.force_login(make_superuser())
        url = reverse('admin:accounts_user_import_csv')
        resp = self.client.get(url)
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'Bulk import users')


class CsvImportHappyPathTests(TestCase):

    def setUp(self):
        self.client.force_login(make_superuser())
        self.url = reverse('admin:accounts_user_import_csv')

    def test_creates_users_from_a_simple_csv(self):
        rows = [
            'alice@example.com,alice,Tr0ub4dor&3pix,student,1,A,IT,Alice',
            'bob@example.com,bob,Tr0ub4dor&3pix,student,2,B,CE,Bob',
        ]
        f = _csv(rows)
        resp = self.client.post(self.url, {'csv_file': f})
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(User.objects.filter(email='alice@example.com').exists())
        self.assertTrue(User.objects.filter(email='bob@example.com').exists())

    def test_created_users_are_email_verified(self):
        f = _csv(['c@example.com,c,Tr0ub4dor&3pix,student,1,A,IT,C'])
        self.client.post(self.url, {'csv_file': f})
        u = User.objects.get(email='c@example.com')
        self.assertTrue(u.is_email_verified)

    def test_teacher_role_sets_is_staff_true(self):
        f = _csv(['mt@example.com,mt,Tr0ub4dor&3pix,teacher,,,IT,Ms Teacher'])
        self.client.post(self.url, {'csv_file': f})
        u = User.objects.get(email='mt@example.com')
        self.assertEqual(u.role, User.ROLE_TEACHER)
        self.assertTrue(u.is_staff)

    def test_student_role_does_not_set_is_staff(self):
        f = _csv(['s@example.com,s,Tr0ub4dor&3pix,student,1,A,IT,S'])
        self.client.post(self.url, {'csv_file': f})
        u = User.objects.get(email='s@example.com')
        self.assertEqual(u.role, User.ROLE_STUDENT)
        self.assertFalse(u.is_staff)

    def test_password_is_set_correctly(self):
        f = _csv(['p@example.com,p,Tr0ub4dor&3pix,student,1,A,IT,P'])
        self.client.post(self.url, {'csv_file': f})
        u = User.objects.get(email='p@example.com')
        self.assertTrue(u.check_password('Tr0ub4dor&3pix'))

    def test_email_normalized_to_lowercase(self):
        f = _csv(['UPPER@EXAMPLE.COM,upper,Tr0ub4dor&3pix,student,1,A,IT,U'])
        self.client.post(self.url, {'csv_file': f})
        self.assertTrue(User.objects.filter(email='upper@example.com').exists())

    def test_case_insensitive_headers(self):
        body = 'Email,USERNAME,Password,Role\nh@example.com,h,Tr0ub4dor&3pix,student'
        f = io.BytesIO(body.encode('utf-8'))
        self.client.post(self.url, {'csv_file': f})
        self.assertTrue(User.objects.filter(email='h@example.com').exists())

    def test_optional_columns_can_be_missing(self):
        body = 'email,username,password\nm@example.com,m,Tr0ub4dor&3pix'
        f = io.BytesIO(body.encode('utf-8'))
        self.client.post(self.url, {'csv_file': f})
        u = User.objects.get(email='m@example.com')
        self.assertEqual(u.role, User.ROLE_STUDENT)  # default
        self.assertIsNone(u.year_level)
        self.assertEqual(u.section, '')


class CsvImportSkipAndErrorTests(TestCase):

    def setUp(self):
        self.client.force_login(make_superuser())
        self.url = reverse('admin:accounts_user_import_csv')

    def test_skips_duplicate_email(self):
        User.objects.create_user(email='dup@example.com', username='dup1', password='Tr0ub4dor&3pix')
        f = _csv(['dup@example.com,brand-new-username,Tr0ub4dor&3pix,student,1,A,IT,X'])
        self.client.post(self.url, {'csv_file': f})
        # Only one user with that email exists
        self.assertEqual(User.objects.filter(email='dup@example.com').count(), 1)

    def test_skips_duplicate_username(self):
        User.objects.create_user(email='already@example.com', username='taken', password='Tr0ub4dor&3pix')
        f = _csv(['fresh@example.com,taken,Tr0ub4dor&3pix,student,1,A,IT,X'])
        self.client.post(self.url, {'csv_file': f})
        self.assertFalse(User.objects.filter(email='fresh@example.com').exists())

    def test_rejects_invalid_role(self):
        f = _csv(['bad@example.com,bad,Tr0ub4dor&3pix,supremoadmin,1,A,IT,B'])
        self.client.post(self.url, {'csv_file': f})
        self.assertFalse(User.objects.filter(email='bad@example.com').exists())

    def test_rejects_year_level_out_of_range(self):
        f = _csv(['oor@example.com,oor,Tr0ub4dor&3pix,student,5,A,IT,X'])
        self.client.post(self.url, {'csv_file': f})
        self.assertFalse(User.objects.filter(email='oor@example.com').exists())

    def test_rejects_non_numeric_year_level(self):
        f = _csv(['oof@example.com,oof,Tr0ub4dor&3pix,student,Beginner,A,IT,X'])
        self.client.post(self.url, {'csv_file': f})
        self.assertFalse(User.objects.filter(email='oof@example.com').exists())

    def test_missing_email_skips_row(self):
        body = 'email,username,password\n,nobody,Tr0ub4dor&3pix'
        f = io.BytesIO(body.encode('utf-8'))
        self.client.post(self.url, {'csv_file': f})
        self.assertFalse(User.objects.filter(username='nobody').exists())

    def test_missing_password_skips_row(self):
        body = 'email,username,password\nz@example.com,z,'
        f = io.BytesIO(body.encode('utf-8'))
        self.client.post(self.url, {'csv_file': f})
        self.assertFalse(User.objects.filter(email='z@example.com').exists())

    def test_mixed_good_bad_rows_report_both(self):
        rows = [
            'good@example.com,good,Tr0ub4dor&3pix,student,1,A,IT,Good',  # ok
            'bad@example.com,bad,Tr0ub4dor&3pix,demigod,1,A,IT,Bad',     # invalid role
            ',missing,Tr0ub4dor&3pix,student,1,A,IT,Missing',            # no email
        ]
        f = _csv(rows)
        resp = self.client.post(self.url, {'csv_file': f})
        body = resp.content.decode()
        self.assertIn('Imported 1', body)  # success flash message echoed
        self.assertTrue(User.objects.filter(email='good@example.com').exists())
        self.assertFalse(User.objects.filter(email='bad@example.com').exists())

    def test_empty_csv_does_not_crash(self):
        f = io.BytesIO(b'')
        resp = self.client.post(self.url, {'csv_file': f})
        # 302 because the view redirects with an error flash message
        self.assertEqual(resp.status_code, 302)

    def test_csv_with_only_headers_is_a_noop(self):
        body = 'email,username,password\n'
        f = io.BytesIO(body.encode('utf-8'))
        resp = self.client.post(self.url, {'csv_file': f})
        self.assertEqual(resp.status_code, 200)
        # Nothing created
        self.assertEqual(User.objects.exclude(email='su@example.com').count(), 0)


class CsvImportUrlRoutingTests(TestCase):

    def test_url_resolves_to_expected_path(self):
        url = reverse('admin:accounts_user_import_csv')
        self.assertEqual(url, '/admin/accounts/user/import-csv/')

    def test_changelist_has_link_to_import(self):
        self.client.force_login(make_superuser())
        resp = self.client.get(reverse('admin:accounts_user_changelist'))
        self.assertContains(resp, 'Import CSV')
        self.assertContains(resp, reverse('admin:accounts_user_import_csv'))
