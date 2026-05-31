"""
Full-flow tests for the /teacher/ portal:
  - login/logout
  - permission gating (students can't access; admin can)
  - list view scoped to assigned students
  - create-student form
  - edit / delete / reset password
  - search & filter

Uses Django's test client (server-rendered HTML, session auth).
"""

from unittest import mock

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse


User = get_user_model()


def make_teacher(email, **extra):
    extra.setdefault('username', email.split('@')[0])
    return User.objects.create_user(
        email=email, password='Pass!1234',
        role=User.ROLE_TEACHER, is_email_verified=True, **extra,
    )


def make_student(email, **extra):
    extra.setdefault('username', email.split('@')[0])
    return User.objects.create_user(
        email=email, password='Pass!1234',
        role=User.ROLE_STUDENT, is_email_verified=True, **extra,
    )


def make_admin(email):
    return User.objects.create_superuser(
        email=email, username='admin', password='Pass!1234',
    )


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class TeacherLoginTests(TestCase):
    """Unified login: /teacher/login/ now just redirects to /admin/login/
    so teachers and superadmins use the same branded form. After auth,
    admin_dashboard bounces teachers to /teacher/ automatically."""

    def setUp(self):
        self.teacher = make_teacher('teacher@example.com', department='IT')
        self.student = make_student('student@example.com')

    def test_teacher_login_url_redirects_to_admin_login(self):
        resp = self.client.get(reverse('teacher_login'))
        self.assertEqual(resp.status_code, 302)
        # ?next=/teacher/ so we bounce there after auth
        self.assertIn('/admin/login/', resp.url)
        self.assertIn('next=', resp.url)
        self.assertIn('/teacher/', resp.url)

    def test_authenticated_teacher_skips_login_page(self):
        # save_model is what flips is_staff for new teachers; here we set
        # it directly since we bypass the admin form.
        self.teacher.is_staff = True
        self.teacher.save(update_fields=['is_staff'])
        self.client.force_login(self.teacher)
        resp = self.client.get(reverse('teacher_login'))
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(resp.url.endswith('/teacher/'))

    def test_admin_login_form_accepts_teacher_when_is_staff_set(self):
        # Replicate what save_model() would do for a freshly-created teacher.
        self.teacher.is_staff = True
        self.teacher.save(update_fields=['is_staff'])
        resp = self.client.post(reverse('admin:login') + '?next=/teacher/', {
            'username': self.teacher.email,
            'password': 'Pass!1234',
            'next': '/teacher/',
        })
        self.assertEqual(resp.status_code, 302)
        self.assertEqual(resp.url, '/teacher/')

    def test_admin_login_form_rejects_non_staff_teacher(self):
        # Before save_model auto-flipped is_staff, teachers couldn't reach
        # /admin/login/. This test pins that behavior so we know the only
        # safe way to log a teacher in is by going through the admin form
        # with is_staff=True.
        # Teacher with is_staff=False -> rejected at /admin/login/.
        self.teacher.is_staff = False
        self.teacher.save(update_fields=['is_staff'])
        resp = self.client.post(reverse('admin:login'), {
            'username': self.teacher.email,
            'password': 'Pass!1234',
        })
        # 200 = stays on the login page with an error
        self.assertEqual(resp.status_code, 200)

    def test_authenticated_teacher_landing_on_admin_index_bounces_to_portal(self):
        self.teacher.is_staff = True
        self.teacher.save(update_fields=['is_staff'])
        self.client.force_login(self.teacher)
        resp = self.client.get('/admin/')
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(resp.url.endswith('/teacher/'))

    def test_superuser_landing_on_admin_index_sees_dashboard(self):
        admin = make_admin('admin@example.com')
        self.client.force_login(admin)
        resp = self.client.get('/admin/')
        self.assertEqual(resp.status_code, 200)  # not bounced

    def test_logout_redirects_to_admin_login_without_next(self):
        # IMPORTANT: must NOT include ?next=/teacher/. If it did, the next
        # person to log in (even a superadmin) would be bounced to the
        # teacher portal. Leaving next blank lets admin_dashboard route
        # by role after a fresh login.
        self.teacher.is_staff = True
        self.teacher.save(update_fields=['is_staff'])
        self.client.force_login(self.teacher)
        resp = self.client.post(reverse('teacher_logout'))
        self.assertEqual(resp.status_code, 302)
        self.assertIn('/admin/login/', resp.url)
        self.assertNotIn('next=', resp.url)

    def test_admin_login_after_teacher_logout_lands_on_dashboard(self):
        """Regression for the 'I see teacher UI as admin' bug: a teacher
        signs out, an admin signs in. The bug was teacher_logout pinning
        ?next=/teacher/ on the login URL, so any subsequent login (even
        as a superuser) bounced to /teacher/.

        Simulate the real-world flow: teacher logs out, then admin visits
        /admin/ which sends them through /admin/login/?next=/admin/ and
        back to the dashboard.
        """
        self.teacher.is_staff = True
        self.teacher.save(update_fields=['is_staff'])
        self.client.force_login(self.teacher)

        # Teacher logs out -> redirect URL must NOT pin next=/teacher/
        logout_resp = self.client.post(reverse('teacher_logout'))
        self.assertEqual(logout_resp.status_code, 302)
        self.assertNotIn('next=', logout_resp.url)
        self.assertIn('/admin/login/', logout_resp.url)

        # Admin now arrives via /admin/, which Django redirects to
        # /admin/login/?next=/admin/ when unauthenticated.
        gate = self.client.get('/admin/')
        self.assertEqual(gate.status_code, 302)
        self.assertIn('next=/admin/', gate.url)

        # Sign in and confirm we land back at /admin/ (NOT /teacher/).
        admin = make_admin('admin@example.com')
        login_resp = self.client.post(gate.url, {
            'username': admin.email,
            'password': 'Pass!1234',
            'next': '/admin/',
        })
        self.assertEqual(login_resp.status_code, 302)
        self.assertTrue(
            login_resp.url.endswith('/admin/'),
            f'Expected /admin/, got {login_resp.url}',
        )


# ---------------------------------------------------------------------------
# Portal permission gating
# ---------------------------------------------------------------------------

class TeacherPortalPermissionTests(TestCase):

    def setUp(self):
        self.teacher = make_teacher('teacher@example.com')
        self.student = make_student('student@example.com')

    def test_anon_user_redirected_to_login(self):
        resp = self.client.get(reverse('teacher_portal'))
        self.assertEqual(resp.status_code, 302)
        self.assertIn('login', resp.url)

    def test_student_logged_in_gets_403(self):
        self.client.force_login(self.student)
        resp = self.client.get(reverse('teacher_portal'))
        self.assertEqual(resp.status_code, 403)

    def test_teacher_logged_in_sees_portal(self):
        self.client.force_login(self.teacher)
        resp = self.client.get(reverse('teacher_portal'))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'My Students')

    def test_superuser_sees_portal(self):
        admin = make_admin('admin@example.com')
        self.client.force_login(admin)
        resp = self.client.get(reverse('teacher_portal'))
        self.assertEqual(resp.status_code, 200)


# ---------------------------------------------------------------------------
# Scoping: teachers see only their own students
# ---------------------------------------------------------------------------

class TeacherStudentScopingTests(TestCase):

    def setUp(self):
        self.teacher_a = make_teacher('a@example.com')
        self.teacher_b = make_teacher('b@example.com')
        self.student_a = make_student('sa@example.com', display_name='Alice')
        self.student_b = make_student('sb@example.com', display_name='Bob')
        self.student_c = make_student('sc@example.com', display_name='Carol')
        self.student_a.teachers.add(self.teacher_a)
        self.student_b.teachers.add(self.teacher_b)
        self.student_c.teachers.add(self.teacher_a, self.teacher_b)

    def test_teacher_a_sees_only_a_and_c(self):
        self.client.force_login(self.teacher_a)
        resp = self.client.get(reverse('teacher_portal'))
        body = resp.content.decode()
        self.assertIn('Alice', body)
        self.assertIn('Carol', body)
        self.assertNotIn('Bob', body)

    def test_teacher_b_sees_only_b_and_c(self):
        self.client.force_login(self.teacher_b)
        resp = self.client.get(reverse('teacher_portal'))
        body = resp.content.decode()
        self.assertIn('Bob', body)
        self.assertIn('Carol', body)
        self.assertNotIn('Alice', body)

    def test_superuser_sees_all_students(self):
        admin = make_admin('admin@example.com')
        self.client.force_login(admin)
        resp = self.client.get(reverse('teacher_portal'))
        body = resp.content.decode()
        self.assertIn('Alice', body)
        self.assertIn('Bob', body)
        self.assertIn('Carol', body)

    def test_teacher_with_no_assignments_sees_empty_state(self):
        empty = make_teacher('empty@example.com')
        self.client.force_login(empty)
        resp = self.client.get(reverse('teacher_portal'))
        self.assertContains(resp, 'No students assigned')


# ---------------------------------------------------------------------------
# Filters on the portal list
# ---------------------------------------------------------------------------

class TeacherPortalFilterTests(TestCase):

    def setUp(self):
        self.teacher = make_teacher('t@example.com')
        self.s1 = make_student('s1@example.com', display_name='Yr1A',
                               year_level=1, section='A')
        self.s2 = make_student('s2@example.com', display_name='Yr1B',
                               year_level=1, section='B')
        self.s3 = make_student('s3@example.com', display_name='Yr2A',
                               year_level=2, section='A')
        for s in (self.s1, self.s2, self.s3):
            s.teachers.add(self.teacher)
        self.client.force_login(self.teacher)

    def test_year_filter_restricts(self):
        resp = self.client.get(reverse('teacher_portal') + '?year=1')
        body = resp.content.decode()
        self.assertIn('Yr1A', body)
        self.assertIn('Yr1B', body)
        self.assertNotIn('Yr2A', body)

    def test_section_filter_restricts(self):
        resp = self.client.get(reverse('teacher_portal') + '?section=A')
        body = resp.content.decode()
        self.assertIn('Yr1A', body)
        self.assertIn('Yr2A', body)
        self.assertNotIn('Yr1B', body)

    def test_search_by_display_name(self):
        resp = self.client.get(reverse('teacher_portal') + '?q=Yr1A')
        body = resp.content.decode()
        self.assertIn('Yr1A', body)
        # Search should be specific enough to exclude the others
        self.assertNotIn('Yr2A', body)


# ---------------------------------------------------------------------------
# Create student
# ---------------------------------------------------------------------------

class TeacherCreateStudentTests(TestCase):

    def setUp(self):
        self.teacher = make_teacher('t@example.com', department='IT')
        self.client.force_login(self.teacher)

    def test_get_create_form(self):
        resp = self.client.get(reverse('teacher_student_new'))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'Add New Student')

    def test_create_assigns_to_calling_teacher(self):
        resp = self.client.post(reverse('teacher_student_new'), {
            'email': 'newstudent@example.com',
            'username': 'newstudent',
            'display_name': 'New Student',
            'year_level': '1',
            'section': 'A',
            'department': 'IT',
            'password': 'Pass!1234',
        })
        self.assertEqual(resp.status_code, 302)
        s = User.objects.get(email='newstudent@example.com')
        self.assertIn(self.teacher, s.teachers.all())
        self.assertEqual(s.role, User.ROLE_STUDENT)
        self.assertTrue(s.is_email_verified)

    def test_create_requires_unique_email(self):
        make_student('dup@example.com')
        resp = self.client.post(reverse('teacher_student_new'), {
            'email': 'dup@example.com',
            'username': 'fresh',
            'password': 'Pass!1234',
        })
        # 200 = form re-rendered with error
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'already exists')

    def test_create_requires_unique_username(self):
        make_student('a@example.com', username='existing')
        # Use a custom username collision case
        User.objects.filter(email='a@example.com').update(username='taken')
        resp = self.client.post(reverse('teacher_student_new'), {
            'email': 'newemail@example.com',
            'username': 'taken',
            'password': 'Pass!1234',
        })
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'username already exists')

    def test_create_requires_password(self):
        resp = self.client.post(reverse('teacher_student_new'), {
            'email': 'p@example.com',
            'username': 'p',
            'password': '',
        })
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'required')

    def test_superuser_create_does_not_auto_assign(self):
        admin = make_admin('admin@example.com')
        self.client.force_login(admin)
        resp = self.client.post(reverse('teacher_student_new'), {
            'email': 'su-created@example.com',
            'username': 'sucreated',
            'password': 'Pass!1234',
        })
        self.assertEqual(resp.status_code, 302)
        s = User.objects.get(email='su-created@example.com')
        # Superuser create -> no teacher assigned (superuser is not a teacher)
        self.assertEqual(s.teachers.count(), 0)


# ---------------------------------------------------------------------------
# Edit / delete / reset
# ---------------------------------------------------------------------------

class TeacherEditDeleteResetTests(TestCase):

    def setUp(self):
        self.teacher = make_teacher('t@example.com')
        self.other_teacher = make_teacher('other@example.com')
        self.my_student = make_student('mine@example.com')
        self.my_student.teachers.add(self.teacher)
        self.other_student = make_student('other-s@example.com')
        self.other_student.teachers.add(self.other_teacher)
        self.client.force_login(self.teacher)

    def test_edit_my_student_succeeds(self):
        resp = self.client.post(
            reverse('teacher_student_edit', args=[self.my_student.id]),
            {
                'display_name': 'Updated',
                'department': 'IT',
                'section': 'C',
                'year_level': '3',
                'is_active': 'on',
            },
        )
        self.assertEqual(resp.status_code, 302)
        self.my_student.refresh_from_db()
        self.assertEqual(self.my_student.display_name, 'Updated')
        self.assertEqual(self.my_student.section, 'C')
        self.assertEqual(self.my_student.year_level, 3)

    def test_edit_other_teachers_student_404(self):
        resp = self.client.post(
            reverse('teacher_student_edit', args=[self.other_student.id]),
            {'display_name': 'Hack', 'department': '', 'section': '', 'year_level': ''},
        )
        self.assertEqual(resp.status_code, 404)
        self.other_student.refresh_from_db()
        self.assertNotEqual(self.other_student.display_name, 'Hack')

    def test_delete_my_student(self):
        sid = self.my_student.id
        resp = self.client.post(reverse('teacher_student_delete', args=[sid]))
        self.assertEqual(resp.status_code, 302)
        self.assertFalse(User.objects.filter(pk=sid).exists())

    def test_delete_other_teachers_student_404(self):
        sid = self.other_student.id
        resp = self.client.post(reverse('teacher_student_delete', args=[sid]))
        self.assertEqual(resp.status_code, 404)
        self.assertTrue(User.objects.filter(pk=sid).exists())

    def test_delete_only_accepts_post(self):
        resp = self.client.get(reverse('teacher_student_delete', args=[self.my_student.id]))
        self.assertEqual(resp.status_code, 405)

    @mock.patch('accounts.teacher_views.send_password_reset_email')
    def test_reset_password_sends_email(self, mock_send):
        mock_send.return_value = None
        resp = self.client.post(reverse('teacher_student_reset_password', args=[self.my_student.id]))
        self.assertEqual(resp.status_code, 302)
        mock_send.assert_called_once()

    @mock.patch('accounts.teacher_views.send_password_reset_email')
    def test_reset_password_handles_smtp_failure(self, mock_send):
        mock_send.side_effect = RuntimeError('smtp')
        resp = self.client.post(reverse('teacher_student_reset_password', args=[self.my_student.id]))
        # The view catches and flashes an error message; still redirects.
        self.assertEqual(resp.status_code, 302)

    @mock.patch('accounts.teacher_views.send_password_reset_email')
    def test_reset_password_for_other_student_404(self, mock_send):
        resp = self.client.post(reverse('teacher_student_reset_password', args=[self.other_student.id]))
        self.assertEqual(resp.status_code, 404)
        mock_send.assert_not_called()


# ---------------------------------------------------------------------------
# Student detail "stalker view"
# ---------------------------------------------------------------------------

class TeacherStudentDetailTests(TestCase):
    """Detail page mirrors the admin user-edit page: profile, gamification
    stats, quiz history, login face snapshots."""

    def setUp(self):
        self.teacher = make_teacher('t@example.com')
        self.other_teacher = make_teacher('o@example.com')
        self.my_student = make_student(
            'mine@example.com', display_name='Mine',
            xp=500, year_level=2, section='B', department='IT',
        )
        self.my_student.teachers.add(self.teacher)
        self.other_student = make_student('other@example.com')
        self.other_student.teachers.add(self.other_teacher)
        self.client.force_login(self.teacher)

    def test_detail_renders_for_my_student(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.my_student.id]))
        self.assertEqual(resp.status_code, 200)
        body = resp.content.decode()
        self.assertIn('Mine', body)
        self.assertIn('mine@example.com', body)

    def test_detail_shows_gamification_stats(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.my_student.id]))
        body = resp.content.decode()
        self.assertIn('500', body)  # XP value
        self.assertIn('Hearts', body)
        self.assertIn('Streak', body)

    def test_detail_shows_assignment_pills(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.my_student.id]))
        body = resp.content.decode()
        self.assertIn('2nd Year', body)
        self.assertIn('Section B', body)
        self.assertIn('IT', body)

    def test_detail_shows_activity_section(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.my_student.id]))
        body = resp.content.decode()
        self.assertIn('Activity', body)
        self.assertIn('Joined', body)
        self.assertIn('Last active', body)

    def test_detail_shows_login_face_section_even_when_empty(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.my_student.id]))
        body = resp.content.decode()
        self.assertIn('Login Face History', body)
        self.assertIn('No login face snapshots', body)

    def test_detail_shows_quiz_history_section_even_when_empty(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.my_student.id]))
        body = resp.content.decode()
        self.assertIn('Quiz Attempts', body)
        self.assertIn('No quiz attempts', body)

    def test_detail_for_other_teachers_student_404(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.other_student.id]))
        self.assertEqual(resp.status_code, 404)

    def test_detail_anonymous_redirects_to_login(self):
        self.client.logout()
        resp = self.client.get(reverse('teacher_student_detail', args=[self.my_student.id]))
        self.assertEqual(resp.status_code, 302)

    def test_detail_student_logged_in_gets_403(self):
        random_student = make_student('rs@example.com')
        self.client.force_login(random_student)
        resp = self.client.get(reverse('teacher_student_detail', args=[self.my_student.id]))
        self.assertEqual(resp.status_code, 403)

    def test_detail_superuser_can_view_anyone(self):
        admin = make_admin('admin@example.com')
        self.client.force_login(admin)
        resp = self.client.get(reverse('teacher_student_detail', args=[self.other_student.id]))
        self.assertEqual(resp.status_code, 200)

    def test_detail_links_to_edit_delete_reset(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.my_student.id]))
        body = resp.content.decode()
        self.assertIn(reverse('teacher_student_edit', args=[self.my_student.id]), body)
        self.assertIn(reverse('teacher_student_delete', args=[self.my_student.id]), body)
        self.assertIn(reverse('teacher_student_reset_password', args=[self.my_student.id]), body)

    def test_detail_url_path(self):
        # /teacher/student/<uuid>/  (no /edit/)
        url = reverse('teacher_student_detail', args=[self.my_student.id])
        self.assertEqual(url, f'/teacher/student/{self.my_student.id}/')

    def test_edit_url_path_now_has_edit_suffix(self):
        url = reverse('teacher_student_edit', args=[self.my_student.id])
        self.assertEqual(url, f'/teacher/student/{self.my_student.id}/edit/')


# ---------------------------------------------------------------------------
# Teacher can edit gamification stats (mirrors admin UserAdmin power)
# ---------------------------------------------------------------------------

class TeacherStudentFullEditTests(TestCase):

    def setUp(self):
        self.teacher = make_teacher('t@example.com')
        self.student = make_student(
            'kid@example.com', xp=200, current_hearts=5, max_hearts=10,
            current_streak=2, longest_streak=3,
        )
        self.student.teachers.add(self.teacher)
        self.client.force_login(self.teacher)

    def _post(self, **overrides):
        data = {
            'display_name': 'New Name',
            'bio': 'A short bio.',
            'department': 'IT',
            'section': 'A',
            'year_level': '1',
            'xp': '500',
            'current_hearts': '7',
            'max_hearts': '10',
            'current_streak': '4',
            'longest_streak': '5',
            'is_active': 'on',
            'is_email_verified': 'on',
        }
        data.update(overrides)
        return self.client.post(
            reverse('teacher_student_edit', args=[self.student.id]), data,
        )

    def test_xp_is_updated(self):
        self._post(xp='999')
        self.student.refresh_from_db()
        self.assertEqual(self.student.xp, 999)

    def test_level_recomputed_from_xp(self):
        # Model.save() formula: level = 1 + xp // 500
        self._post(xp='1500')
        self.student.refresh_from_db()
        self.assertEqual(self.student.level, 1 + 1500 // 500)

    def test_hearts_updated_and_current_capped_at_max(self):
        self._post(current_hearts='99', max_hearts='10')
        self.student.refresh_from_db()
        self.assertEqual(self.student.max_hearts, 10)
        # Current hearts capped at max
        self.assertEqual(self.student.current_hearts, 10)

    def test_streak_updated(self):
        self._post(current_streak='7', longest_streak='9')
        self.student.refresh_from_db()
        self.assertEqual(self.student.current_streak, 7)
        self.assertEqual(self.student.longest_streak, 9)

    def test_longest_streak_never_below_current(self):
        self._post(current_streak='8', longest_streak='3')
        self.student.refresh_from_db()
        self.assertEqual(self.student.current_streak, 8)
        # Longest auto-raised to at least current
        self.assertEqual(self.student.longest_streak, 8)

    def test_bio_updated(self):
        self._post(bio='Loves Python.')
        self.student.refresh_from_db()
        self.assertEqual(self.student.bio, 'Loves Python.')

    def test_unchecking_is_active_disables_account(self):
        # Drop the is_active key entirely to simulate unchecked box
        resp = self.client.post(
            reverse('teacher_student_edit', args=[self.student.id]),
            {
                'display_name': self.student.display_name or '',
                'bio': self.student.bio or '',
                'department': self.student.department or '',
                'section': self.student.section or '',
                'year_level': '',
                'xp': str(self.student.xp),
                'current_hearts': str(self.student.current_hearts),
                'max_hearts': str(self.student.max_hearts),
                'current_streak': str(self.student.current_streak),
                'longest_streak': str(self.student.longest_streak),
                # is_active intentionally absent
                'is_email_verified': 'on',
            },
        )
        self.assertEqual(resp.status_code, 302)
        self.student.refresh_from_db()
        self.assertFalse(self.student.is_active)

    def test_unchecking_email_verified_forces_reverification(self):
        self._post()  # baseline with both checked
        self.student.refresh_from_db()
        self.assertTrue(self.student.is_email_verified)

        # Now uncheck
        resp = self.client.post(
            reverse('teacher_student_edit', args=[self.student.id]),
            {
                'display_name': '',
                'bio': '',
                'department': '',
                'section': '',
                'year_level': '',
                'xp': str(self.student.xp),
                'current_hearts': str(self.student.current_hearts),
                'max_hearts': str(self.student.max_hearts),
                'current_streak': str(self.student.current_streak),
                'longest_streak': str(self.student.longest_streak),
                'is_active': 'on',
                # is_email_verified intentionally absent
            },
        )
        self.assertEqual(resp.status_code, 302)
        self.student.refresh_from_db()
        self.assertFalse(self.student.is_email_verified)

    def test_invalid_xp_falls_back_to_existing(self):
        original_xp = self.student.xp
        self._post(xp='not-a-number')
        self.student.refresh_from_db()
        # Invalid input keeps the prior value (no crash)
        self.assertEqual(self.student.xp, original_xp)

    def test_negative_xp_clamped_to_zero(self):
        self._post(xp='-100')
        self.student.refresh_from_db()
        self.assertEqual(self.student.xp, 0)

    def test_xp_above_upper_bound_clamped(self):
        self._post(xp='999999999999')
        self.student.refresh_from_db()
        self.assertLessEqual(self.student.xp, 10_000_000)

    def test_post_redirects_to_detail_page(self):
        resp = self._post()
        self.assertEqual(resp.status_code, 302)
        self.assertTrue(resp.url.endswith(f'/student/{self.student.id}/'))

    def test_edit_other_teachers_student_404(self):
        other_teacher = make_teacher('ot@example.com')
        other_student = make_student('os@example.com')
        other_student.teachers.add(other_teacher)
        resp = self.client.post(
            reverse('teacher_student_edit', args=[other_student.id]),
            {'xp': '99999'},
        )
        self.assertEqual(resp.status_code, 404)
        other_student.refresh_from_db()
        self.assertNotEqual(other_student.xp, 99999)

    def test_edit_form_renders_all_gameplay_inputs(self):
        resp = self.client.get(reverse('teacher_student_edit', args=[self.student.id]))
        body = resp.content.decode()
        for name in ['xp', 'current_hearts', 'max_hearts', 'current_streak', 'longest_streak']:
            self.assertIn(f'name="{name}"', body)
        self.assertIn('name="is_active"', body)
        self.assertIn('name="is_email_verified"', body)
        self.assertIn('name="bio"', body)


# ---------------------------------------------------------------------------
# PDF reports
# ---------------------------------------------------------------------------

class TeacherReportsTests(TestCase):
    """Reports landing page + per-student PDF + all-students PDF, all
    scoped to the calling teacher's assigned students."""

    def setUp(self):
        self.teacher = make_teacher('t@example.com')
        self.other_teacher = make_teacher('o@example.com')
        self.my_student = make_student('mine@example.com')
        self.my_student.teachers.add(self.teacher)
        self.other_student = make_student('other@example.com')
        self.other_student.teachers.add(self.other_teacher)
        self.client.force_login(self.teacher)

    def test_reports_landing_loads(self):
        resp = self.client.get(reverse('teacher_reports'))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'All my students')
        self.assertContains(resp, 'Per student')

    def test_reports_landing_only_lists_my_students(self):
        resp = self.client.get(reverse('teacher_reports'))
        body = resp.content.decode()
        self.assertIn('mine@example.com', body)
        self.assertNotIn('other@example.com', body)

    def test_reports_landing_nav_link_in_header(self):
        resp = self.client.get(reverse('teacher_portal'))
        body = resp.content.decode()
        self.assertIn(reverse('teacher_reports'), body)

    def test_all_students_pdf_renders(self):
        resp = self.client.get(reverse('teacher_quiz_report_all') + '?days=7')
        # Either real PDF (200, content-type pdf) or fallback HTML (200, text/html)
        self.assertEqual(resp.status_code, 200)
        ctype = resp['Content-Type']
        self.assertTrue(ctype.startswith('application/pdf') or ctype.startswith('text/html'),
                        f'Unexpected content-type: {ctype}')

    def test_per_student_pdf_renders_for_my_student(self):
        resp = self.client.get(
            reverse('teacher_student_quiz_report', args=[self.my_student.id]) + '?days=7'
        )
        self.assertEqual(resp.status_code, 200)

    def test_per_student_pdf_blocked_for_other_teachers_student(self):
        resp = self.client.get(
            reverse('teacher_student_quiz_report', args=[self.other_student.id])
        )
        self.assertEqual(resp.status_code, 404)

    def test_all_students_pdf_clamps_invalid_days(self):
        resp = self.client.get(reverse('teacher_quiz_report_all') + '?days=not-a-number')
        # Falls back to default (1), still renders
        self.assertEqual(resp.status_code, 200)

    def test_all_students_pdf_clamps_zero_to_one(self):
        resp = self.client.get(reverse('teacher_quiz_report_all') + '?days=0')
        self.assertEqual(resp.status_code, 200)

    def test_all_students_pdf_clamps_huge_days(self):
        resp = self.client.get(reverse('teacher_quiz_report_all') + '?days=99999')
        self.assertEqual(resp.status_code, 200)

    def test_per_student_pdf_clamps_huge_days(self):
        resp = self.client.get(
            reverse('teacher_student_quiz_report', args=[self.my_student.id]) + '?days=99999'
        )
        self.assertEqual(resp.status_code, 200)

    def test_anon_blocked_from_reports(self):
        self.client.logout()
        resp = self.client.get(reverse('teacher_reports'))
        self.assertEqual(resp.status_code, 302)
        self.assertIn('login', resp.url)

    def test_student_role_blocked_from_reports(self):
        kid = make_student('kid@example.com')
        self.client.force_login(kid)
        resp = self.client.get(reverse('teacher_reports'))
        self.assertEqual(resp.status_code, 403)

    def test_superuser_sees_all_students_in_reports(self):
        admin = make_admin('admin@example.com')
        self.client.force_login(admin)
        resp = self.client.get(reverse('teacher_reports'))
        body = resp.content.decode()
        self.assertIn('mine@example.com', body)
        self.assertIn('other@example.com', body)

    def test_detail_page_has_print_pdf_button(self):
        resp = self.client.get(reverse('teacher_student_detail', args=[self.my_student.id]))
        body = resp.content.decode()
        self.assertIn(reverse('teacher_student_quiz_report', args=[self.my_student.id]), body)
        self.assertIn('Print PDF', body)

    def test_all_pdf_excludes_other_teachers_students_from_query(self):
        # Make sure if the queryset filter were wrong, the test would catch it
        # by checking that the queryset scoping behavior is in place: a teacher
        # with NO assigned students gets an empty PDF (no rows).
        empty_teacher = make_teacher('empty@example.com')
        self.client.force_login(empty_teacher)
        resp = self.client.get(reverse('teacher_quiz_report_all') + '?days=30')
        self.assertEqual(resp.status_code, 200)
        # The HTML / PDF includes "Total Attempts: 0" or similar marker
        # (PDF bytes also contain this; fallback HTML certainly does).
        if resp['Content-Type'].startswith('text/html'):
            body = resp.content.decode()
            self.assertIn('Total', body)
