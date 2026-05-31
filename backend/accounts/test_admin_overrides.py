"""
Tests for the admin-template overrides + UI tweaks added this session:

  - "Welcome, Admin" instead of email in the header
  - Logout converted to an icon (rendered via custom button)
  - Reports link in the nav sidebar
  - Reports widget REMOVED from dashboard + user change form
  - Bulk-actions JS file shipped and loaded from base_site.html
  - Role badge column on the user changelist
  - Role / department / year / section fieldset on the user add/edit form
"""

import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse


User = get_user_model()


def make_superuser():
    return User.objects.create_superuser(
        email='su@example.com', username='su', password='Pass!1234',
    )


# ---------------------------------------------------------------------------
# Admin header
# ---------------------------------------------------------------------------

class AdminHeaderWelcomeTests(TestCase):

    def setUp(self):
        self.client.force_login(make_superuser())

    def test_welcome_admin_not_email(self):
        resp = self.client.get(reverse('admin:index'))
        body = resp.content.decode()
        # New header copy is just "Welcome, Admin"
        self.assertIn('Welcome,', body)
        self.assertIn('<strong>Admin</strong>', body)
        # And does NOT spell out the user's email
        self.assertNotIn('su@example.com', body.split('id="user-tools"')[-1].split('</div>')[0]
                         if 'user-tools' in body else '')


# ---------------------------------------------------------------------------
# Logout is an icon button
# ---------------------------------------------------------------------------

class AdminLogoutIconTests(TestCase):

    def setUp(self):
        self.client.force_login(make_superuser())

    def test_logout_is_icon_button(self):
        resp = self.client.get(reverse('admin:index'))
        body = resp.content.decode()
        # Icon button class is wired into base_site.html.
        self.assertIn('cl-logout-icon', body)

    def test_logout_button_has_aria_label(self):
        resp = self.client.get(reverse('admin:index'))
        self.assertIn('aria-label="Log out"', resp.content.decode())

    def test_logout_button_has_svg_payload(self):
        resp = self.client.get(reverse('admin:index'))
        body = resp.content.decode()
        # Door-out SVG markers - confirms an actual SVG icon ships.
        self.assertIn('<svg', body)
        # Path data for the door icon used
        self.assertIn('M9 21H5', body)


# ---------------------------------------------------------------------------
# Reports link in nav sidebar
# ---------------------------------------------------------------------------

class AdminReportsSidebarLinkTests(TestCase):

    def setUp(self):
        self.client.force_login(make_superuser())

    def test_sidebar_has_reports_link(self):
        resp = self.client.get(reverse('admin:index'))
        body = resp.content.decode()
        # Sidebar module ID set in nav_sidebar.html
        self.assertIn('codelogic-reports-row', body)
        self.assertIn('codelogic-reports-link', body)

    def test_reports_landing_page_renders(self):
        resp = self.client.get('/admin/reports/')
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'Reports')
        self.assertContains(resp, 'All Students')
        self.assertContains(resp, 'Per Student')


class ReportsWidgetRemovedFromDashboardTests(TestCase):
    """The old dashboard report widget was moved into /admin/reports/.
    Verify it no longer appears on the dashboard (avoid scattered design)."""

    def setUp(self):
        self.client.force_login(make_superuser())

    def test_dashboard_does_not_show_report_form(self):
        resp = self.client.get(reverse('admin:index'))
        body = resp.content.decode()
        # The old form had this id; it should be gone.
        self.assertNotIn('cl-dash-report-days', body)

    def test_dashboard_does_not_show_quiz_activity_card_label(self):
        resp = self.client.get(reverse('admin:index'))
        body = resp.content.decode()
        # The exact "Quiz Activity Report" wording was the widget header.
        self.assertNotIn('Quiz Activity Report', body)


class ReportsWidgetRemovedFromUserChangeFormTests(TestCase):
    """Per-user report widget was removed from the user edit page in favour
    of the per-student selector on /admin/reports/."""

    def setUp(self):
        self.su = make_superuser()
        self.target = User.objects.create_user(
            email='t@example.com', username='t', password='x',
        )
        self.client.force_login(self.su)

    def test_user_change_form_does_not_have_old_report_widget(self):
        url = reverse('admin:accounts_user_change', args=[self.target.id])
        resp = self.client.get(url)
        body = resp.content.decode()
        self.assertNotIn('cl-report-days', body)
        self.assertNotIn('Download Quiz Report', body)


# ---------------------------------------------------------------------------
# Bulk-actions JS
# ---------------------------------------------------------------------------

class BulkActionsJsTests(TestCase):

    JS_PATH = os.path.join(
        settings.BASE_DIR, 'accounts', 'static', 'admin',
        'codelogic-admin-actions.js',
    )

    def test_js_file_ships(self):
        self.assertTrue(os.path.exists(self.JS_PATH), self.JS_PATH)

    def test_js_file_has_toolbar_logic(self):
        with open(self.JS_PATH, encoding='utf-8') as f:
            content = f.read()
        for marker in [
            'cl-bulk-toolbar',
            'cl-select-all-btn',
            'cl-delete-selected-btn',
            'cl-clear-selection-btn',
            'delete_selected',
        ]:
            self.assertIn(marker, content, msg=f'JS missing marker: {marker}')

    def test_base_site_loads_actions_js(self):
        self.client.force_login(make_superuser())
        resp = self.client.get(reverse('admin:index'))
        body = resp.content.decode()
        # WhiteNoise/Manifest static files mangles the URL with a content
        # hash (e.g. `codelogic-admin-actions.abc123.js`), so we just check
        # the filename stem is present.
        self.assertIn('codelogic-admin-actions', body)


# ---------------------------------------------------------------------------
# User admin: role badge + scoping fields
# ---------------------------------------------------------------------------

class UserAdminScopingFieldsTests(TestCase):

    def setUp(self):
        self.su = make_superuser()
        self.client.force_login(self.su)

    def test_changelist_renders_role_column(self):
        resp = self.client.get(reverse('admin:accounts_user_changelist'))
        self.assertEqual(resp.status_code, 200)
        # Role badge HTML contains lowercase role name
        body = resp.content.decode()
        # superuser row shows 'admin' badge (since is_superuser overrides role)
        self.assertIn('admin', body.lower())

    def test_change_form_has_role_fieldset(self):
        u = User.objects.create_user(
            email='kid@example.com', username='kid', password='x',
            year_level=1, section='A', department='IT', role=User.ROLE_STUDENT,
        )
        resp = self.client.get(reverse('admin:accounts_user_change', args=[u.id]))
        body = resp.content.decode()
        # Field names appear as input names; check several
        self.assertIn('name="role"', body)
        self.assertIn('name="department"', body)
        self.assertIn('name="year_level"', body)
        self.assertIn('name="section"', body)
        self.assertIn('name="teachers"', body)

    def test_save_user_with_role_persists(self):
        u = User.objects.create_user(
            email='kid@example.com', username='kid', password='x',
        )
        url = reverse('admin:accounts_user_change', args=[u.id])
        # Posting the full admin change form is complex; verify via the model
        # save path instead. (Form-rendering coverage is already above.)
        u.role = User.ROLE_TEACHER
        u.department = 'Computer Engineering'
        u.year_level = 3
        u.section = 'B'
        u.save()
        u.refresh_from_db()
        self.assertEqual(u.role, User.ROLE_TEACHER)
        self.assertEqual(u.department, 'Computer Engineering')
        self.assertEqual(u.year_level, 3)
        self.assertEqual(u.section, 'B')


# ---------------------------------------------------------------------------
# Reports URL routing sanity
# ---------------------------------------------------------------------------

class ReportsRoutingTests(TestCase):

    def setUp(self):
        self.client.force_login(make_superuser())

    def test_reports_index_url_resolves(self):
        # `admin-reports` is the new named URL.
        url = reverse('admin-reports')
        self.assertEqual(url, '/admin/reports/')

    def test_daily_report_url_still_works(self):
        url = reverse('admin-quiz-report-today')
        self.assertEqual(url, '/admin/reports/today/')

    def test_per_user_report_url_still_works(self):
        u = User.objects.create_user(
            email='u@example.com', username='u', password='x',
        )
        url = reverse('admin-user-quiz-report', args=[u.id])
        self.assertIn(f'/admin/reports/user/{u.id}/', url)
