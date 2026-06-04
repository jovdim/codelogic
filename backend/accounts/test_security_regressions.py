"""
Regression tests for the BLOCKER + SERIOUS findings surfaced by the
2026-06-01 ship-readiness audit. Each test is named for the bug it
guards against; if any of these fail in CI it means a code change
has reopened a known security hole.

NOTE: Face-matching biometric login was removed after the audit (per
client request - replaced with a teacher-uploaded reference photo for
visual verification only). The NaN-injection + anti-enumeration test
classes that lived here have been removed with it.
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from game.models import Category, Topic, Question


User = get_user_model()


# ---------------------------------------------------------------------------
# BLOCKER #2 / #3 / SERIOUS #7: admin reports are SUPERUSER-only
# ---------------------------------------------------------------------------

class AdminReportsSuperuserOnlyTests(TestCase):

    def setUp(self):
        self.client.login = self.client.force_login  # alias for clarity
        self.superuser = User.objects.create_superuser(
            email='su@example.com', username='su', password='Tr0ub4dor&3pix',
        )
        self.teacher = User.objects.create_user(
            email='t@example.com', username='t', password='Tr0ub4dor&3pix',
            role=User.ROLE_TEACHER, is_staff=True, is_email_verified=True,
        )
        self.student = User.objects.create_user(
            email='s@example.com', username='s', password='Tr0ub4dor&3pix',
            is_email_verified=True,
        )

    def test_reports_index_blocks_staff_teacher(self):
        self.client.force_login(self.teacher)
        resp = self.client.get(reverse('admin-reports'))
        self.assertEqual(resp.status_code, 403)

    def test_reports_index_allows_superuser(self):
        self.client.force_login(self.superuser)
        resp = self.client.get(reverse('admin-reports'))
        self.assertEqual(resp.status_code, 200)

    def test_daily_pdf_blocks_staff_teacher(self):
        self.client.force_login(self.teacher)
        resp = self.client.get(reverse('admin-quiz-report-today'))
        self.assertEqual(resp.status_code, 403)

    def test_per_user_pdf_blocks_staff_teacher(self):
        self.client.force_login(self.teacher)
        resp = self.client.get(
            reverse('admin-user-quiz-report', args=[self.student.id])
        )
        self.assertEqual(resp.status_code, 403)


# ---------------------------------------------------------------------------
# BLOCKER #4 / #5: year-level scoping cannot be bypassed by direct URL
# ---------------------------------------------------------------------------

class YearScopingDirectUrlBypassTests(TestCase):

    def setUp(self):
        self.client = APIClient()
        cat = Category.objects.create(name='Adv', slug='adv')
        self.year3_topic = Topic.objects.create(
            category=cat, name='Year3Only', slug='y3o',
            target_year_levels=[3],
        )
        Question.objects.create(
            topic=self.year3_topic, level=1, question_type='multiple-choice',
            question_text='Q', options=['a', 'b', 'c', 'd'],
            correct_answer=0, xp_reward=10,
        )

    def test_year1_student_cannot_get_topic_detail(self):
        student = User.objects.create_user(
            email='y1@example.com', username='y1', password='Tr0ub4dor&3pix',
            year_level=1, is_email_verified=True, role=User.ROLE_STUDENT,
        )
        self.client.force_authenticate(student)
        resp = self.client.get(
            f'/api/game/topics/adv/{self.year3_topic.slug}/'
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_year1_student_cannot_start_quiz(self):
        student = User.objects.create_user(
            email='y1@example.com', username='y1', password='Tr0ub4dor&3pix',
            year_level=1, is_email_verified=True, role=User.ROLE_STUDENT,
        )
        self.client.force_authenticate(student)
        resp = self.client.get(
            f'/api/game/quiz/adv/{self.year3_topic.slug}/1/'
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_year3_student_can_get_topic(self):
        student = User.objects.create_user(
            email='y3@example.com', username='y3', password='Tr0ub4dor&3pix',
            year_level=3, is_email_verified=True, role=User.ROLE_STUDENT,
        )
        self.client.force_authenticate(student)
        resp = self.client.get(
            f'/api/game/topics/adv/{self.year3_topic.slug}/'
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# SERIOUS #8: scoping_year_level returns None for non-students
# ---------------------------------------------------------------------------

class ScopingYearLevelHelperTests(TestCase):

    def test_student_returns_year_level(self):
        s = User(role=User.ROLE_STUDENT, year_level=2)
        self.assertEqual(s.scoping_year_level, 2)

    def test_teacher_always_returns_none(self):
        t = User(role=User.ROLE_TEACHER, year_level=2, is_staff=True)
        self.assertIsNone(t.scoping_year_level)

    def test_superuser_always_returns_none(self):
        su = User(role=User.ROLE_STUDENT, year_level=2, is_superuser=True)
        self.assertIsNone(su.scoping_year_level)

    def test_staff_always_returns_none(self):
        u = User(role=User.ROLE_STUDENT, year_level=2, is_staff=True)
        self.assertIsNone(u.scoping_year_level)


# ---------------------------------------------------------------------------
# SERIOUS #9: malformed target_year_levels never silently disables scoping
# ---------------------------------------------------------------------------

class MalformedTargetYearLevelsTests(TestCase):

    def setUp(self):
        cat = Category.objects.create(name='X', slug='x')
        self.topic = Topic.objects.create(
            category=cat, name='M', slug='m',
            target_year_levels=['1', 'two', '3'],
        )

    def test_valid_entries_still_filter(self):
        self.assertTrue(self.topic.is_visible_to_year_level(1))
        self.assertTrue(self.topic.is_visible_to_year_level(3))
        self.assertFalse(self.topic.is_visible_to_year_level(2))
        self.assertFalse(self.topic.is_visible_to_year_level(4))

    def test_all_malformed_falls_back_to_visible_to_all(self):
        cat = self.topic.category
        t2 = Topic.objects.create(
            category=cat, name='allbad', slug='allbad',
            target_year_levels=['oops', 'nope'],
        )
        for y in [1, 2, 3, 4]:
            self.assertTrue(t2.is_visible_to_year_level(y))


# ---------------------------------------------------------------------------
# SERIOUS #15: teacher year_level POST is clamped to 1..4
# ---------------------------------------------------------------------------

class TeacherEditYearLevelClampTests(TestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(
            email='t@example.com', username='t',
            password='Tr0ub4dor&3pix',
            role=User.ROLE_TEACHER, is_staff=True, is_email_verified=True,
        )
        self.student = User.objects.create_user(
            email='s@example.com', username='s',
            password='Tr0ub4dor&3pix',
            role=User.ROLE_STUDENT, is_email_verified=True,
            year_level=1, max_hearts=10,
        )
        self.student.teachers.add(self.teacher)
        self.client.force_login(self.teacher)

    def _payload(self, **over):
        base = {
            'display_name': '', 'bio': '',
            'department': '', 'section': '', 'year_level': '',
            'xp': '0', 'current_hearts': '5', 'max_hearts': '10',
            'current_streak': '0', 'longest_streak': '0',
            'is_active': 'on', 'is_email_verified': 'on',
        }
        base.update(over)
        return base

    def test_year_level_99_is_rejected_resets_to_none(self):
        self.client.post(
            reverse('teacher_student_edit', args=[self.student.id]),
            self._payload(year_level='99'),
        )
        self.student.refresh_from_db()
        self.assertIsNone(self.student.year_level)

    def test_year_level_0_is_rejected(self):
        self.client.post(
            reverse('teacher_student_edit', args=[self.student.id]),
            self._payload(year_level='0'),
        )
        self.student.refresh_from_db()
        self.assertIsNone(self.student.year_level)

    def test_year_level_4_is_kept(self):
        self.client.post(
            reverse('teacher_student_edit', args=[self.student.id]),
            self._payload(year_level='4'),
        )
        self.student.refresh_from_db()
        self.assertEqual(self.student.year_level, 4)

    def test_alpha_year_level_resets(self):
        self.client.post(
            reverse('teacher_student_edit', args=[self.student.id]),
            self._payload(year_level='abc'),
        )
        self.student.refresh_from_db()
        self.assertIsNone(self.student.year_level)


# ---------------------------------------------------------------------------
# SERIOUS #16: weak passwords blocked at teacher portal create
# ---------------------------------------------------------------------------

class TeacherCreateWeakPasswordRejectionTests(TestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(
            email='t@example.com', username='t',
            password='Tr0ub4dor&3pix',
            role=User.ROLE_TEACHER, is_staff=True, is_email_verified=True,
        )
        self.client.force_login(self.teacher)

    def _post(self, **extra):
        # All teacher_student_new POSTs need a base photo now too.
        # We send a tiny 1x1 PNG via the dataurl path so the test
        # doesn't depend on PIL or a real upload.
        tiny_png_dataurl = (
            'data:image/png;base64,'
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAIAAAUAAeImBZsAAAAASUVORK5CYII='
        )
        body = {
            'email': 'kid@example.com',
            'username': 'kid',
            'password': 'a',
            'base_face_photo_dataurl': tiny_png_dataurl,
        }
        body.update(extra)
        return self.client.post(reverse('teacher_student_new'), body)

    def test_one_letter_password_rejected(self):
        resp = self._post(password='a')
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(User.objects.filter(email='kid@example.com').exists())

    def test_common_password_rejected(self):
        resp = self._post(password='password')
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(User.objects.filter(email='kid@example.com').exists())


# ---------------------------------------------------------------------------
# SERIOUS: teacher_logout no longer accepts GET (forced-logout via <img>)
# ---------------------------------------------------------------------------

class TeacherLogoutPostOnlyTests(TestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(
            email='t@example.com', username='t',
            password='Tr0ub4dor&3pix',
            role=User.ROLE_TEACHER, is_staff=True, is_email_verified=True,
        )
        self.client.force_login(self.teacher)

    def test_get_logout_is_405(self):
        resp = self.client.get(reverse('teacher_logout'))
        self.assertEqual(resp.status_code, 405)

    def test_post_logout_works(self):
        resp = self.client.post(reverse('teacher_logout'))
        self.assertEqual(resp.status_code, 302)


# ---------------------------------------------------------------------------
# NEW: base reference photo is REQUIRED at student-create time
# ---------------------------------------------------------------------------

TINY_PNG_DATAURL = (
    'data:image/png;base64,'
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAIAAAUAAeImBZsAAAAASUVORK5CYII='
)


class TeacherCreateRequiresBasePhotoTests(TestCase):

    def setUp(self):
        self.teacher = User.objects.create_user(
            email='t@example.com', username='t',
            password='Tr0ub4dor&3pix',
            role=User.ROLE_TEACHER, is_staff=True, is_email_verified=True,
        )
        self.client.force_login(self.teacher)

    def _form(self, **extra):
        body = {
            'email': 'kid@example.com',
            'username': 'kid',
            'password': 'Tr0ub4dor&3pix',
        }
        body.update(extra)
        return body

    def test_missing_photo_blocks_creation(self):
        resp = self.client.post(reverse('teacher_student_new'), self._form())
        self.assertEqual(resp.status_code, 200)  # form re-rendered
        self.assertContains(resp, 'reference photo is required')
        self.assertFalse(User.objects.filter(email='kid@example.com').exists())

    def test_dataurl_photo_path_creates_student(self):
        resp = self.client.post(
            reverse('teacher_student_new'),
            self._form(base_face_photo_dataurl=TINY_PNG_DATAURL),
        )
        self.assertEqual(resp.status_code, 302)
        u = User.objects.get(email='kid@example.com')
        self.assertTrue(bool(u.base_face_photo))
        self.assertIsNotNone(u.base_face_photo_at)

    def test_malformed_dataurl_blocks_creation(self):
        resp = self.client.post(
            reverse('teacher_student_new'),
            self._form(base_face_photo_dataurl='data:image/jpeg;base64,@@@not-base64@@@'),
        )
        self.assertEqual(resp.status_code, 200)
        self.assertFalse(User.objects.filter(email='kid@example.com').exists())
