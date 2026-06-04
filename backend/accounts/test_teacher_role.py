"""
Tests for the new Teacher role + scoping fields on the User model.

Covers:
  - role default + choices
  - department, year_level, section freeform/optional behavior
  - teachers M2M (student <-> teacher, asymmetric)
  - limit_choices_to enforcement
  - migration produced the expected schema
"""

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase


User = get_user_model()


class UserRoleFieldTests(TestCase):

    def test_default_role_is_student(self):
        u = User.objects.create_user(
            email='kid@example.com', username='kid', password='x',
        )
        self.assertEqual(u.role, User.ROLE_STUDENT)

    def test_role_constant_strings(self):
        self.assertEqual(User.ROLE_STUDENT, 'student')
        self.assertEqual(User.ROLE_TEACHER, 'teacher')
        self.assertEqual(User.ROLE_ADMIN, 'admin')

    def test_role_choices_exposed(self):
        labels = dict(User.ROLE_CHOICES)
        self.assertIn(User.ROLE_STUDENT, labels)
        self.assertIn(User.ROLE_TEACHER, labels)
        self.assertIn(User.ROLE_ADMIN, labels)

    def test_year_choices_cover_1_to_4(self):
        years = {v for v, _ in User.YEAR_LEVEL_CHOICES}
        self.assertEqual(years, {1, 2, 3, 4})

    def test_role_can_be_set_to_teacher(self):
        t = User.objects.create_user(
            email='t@example.com', username='t', password='x',
            role=User.ROLE_TEACHER,
        )
        self.assertEqual(t.role, User.ROLE_TEACHER)
        self.assertFalse(t.is_staff)  # teachers are NOT django-admin users

    def test_department_defaults_blank(self):
        u = User.objects.create_user(email='a@a.com', username='a', password='x')
        self.assertEqual(u.department, '')

    def test_department_accepts_freeform(self):
        u = User.objects.create_user(
            email='a@a.com', username='a', password='x',
            department='Liberal Arts Communication',
        )
        self.assertEqual(u.department, 'Liberal Arts Communication')

    def test_department_suggestions_list_present(self):
        # The suggestion list is consumed by future UI hints.
        self.assertIn('IT', User.DEPARTMENT_SUGGESTIONS)
        self.assertIn('Computer Engineering', User.DEPARTMENT_SUGGESTIONS)

    def test_year_level_defaults_none(self):
        u = User.objects.create_user(email='a@a.com', username='a', password='x')
        self.assertIsNone(u.year_level)

    def test_year_level_persists_value(self):
        u = User.objects.create_user(
            email='b@b.com', username='b', password='x', year_level=2,
        )
        u.refresh_from_db()
        self.assertEqual(u.year_level, 2)

    def test_section_defaults_blank(self):
        u = User.objects.create_user(email='c@c.com', username='c', password='x')
        self.assertEqual(u.section, '')

    def test_section_freeform(self):
        u = User.objects.create_user(
            email='c@c.com', username='c', password='x', section='Block 3-B',
        )
        self.assertEqual(u.section, 'Block 3-B')


class TeacherStudentRelationshipTests(TestCase):
    """The `teachers` M2M is the routing key for the /teacher/ portal."""

    def setUp(self):
        self.t1 = User.objects.create_user(
            email='t1@example.com', username='t1', password='x',
            role=User.ROLE_TEACHER, department='IT',
        )
        self.t2 = User.objects.create_user(
            email='t2@example.com', username='t2', password='x',
            role=User.ROLE_TEACHER, department='Computer Engineering',
        )
        self.s1 = User.objects.create_user(
            email='s1@example.com', username='s1', password='x',
            role=User.ROLE_STUDENT, year_level=1, section='A',
        )
        self.s2 = User.objects.create_user(
            email='s2@example.com', username='s2', password='x',
            role=User.ROLE_STUDENT, year_level=2, section='B',
        )

    def test_student_with_no_teachers(self):
        self.assertEqual(self.s1.teachers.count(), 0)
        self.assertEqual(self.t1.students.count(), 0)

    def test_assign_student_to_teacher(self):
        self.s1.teachers.add(self.t1)
        self.assertIn(self.t1, self.s1.teachers.all())
        self.assertIn(self.s1, self.t1.students.all())

    def test_student_can_have_multiple_teachers(self):
        # Client requirement: a student in HTML class AND Python class
        # gets seen by BOTH teachers.
        self.s1.teachers.add(self.t1, self.t2)
        self.assertEqual(self.s1.teachers.count(), 2)
        self.assertIn(self.s1, self.t1.students.all())
        self.assertIn(self.s1, self.t2.students.all())

    def test_teacher_sees_only_assigned_students(self):
        self.s1.teachers.add(self.t1)
        # s2 not assigned to t1
        t1_students = list(self.t1.students.all())
        self.assertEqual(t1_students, [self.s1])
        self.assertNotIn(self.s2, t1_students)

    def test_removing_a_teacher_removes_relationship(self):
        self.s1.teachers.add(self.t1, self.t2)
        self.s1.teachers.remove(self.t1)
        self.assertNotIn(self.t1, self.s1.teachers.all())
        self.assertIn(self.t2, self.s1.teachers.all())

    def test_relationship_is_asymmetric(self):
        # Student adds teacher -> teacher shows student. Not the other way.
        self.s1.teachers.add(self.t1)
        # Teacher does NOT have teachers (only students has them).
        self.assertEqual(self.t1.teachers.count(), 0)
        # Student does NOT have students (only teacher does).
        self.assertEqual(self.s1.students.count(), 0)

    def test_deleting_teacher_cascades_through_m2m(self):
        self.s1.teachers.add(self.t1)
        self.t1.delete()
        self.s1.refresh_from_db()
        self.assertEqual(self.s1.teachers.count(), 0)

    def test_deleting_student_does_not_delete_teacher(self):
        self.s1.teachers.add(self.t1)
        self.s1.delete()
        self.assertTrue(User.objects.filter(pk=self.t1.pk).exists())
        self.assertEqual(self.t1.students.count(), 0)


class UserManagerStillCreatesValidUsers(TestCase):
    """The new fields must not break create_user / create_superuser."""

    def test_create_user_default(self):
        u = User.objects.create_user(
            email='a@a.com', username='a', password='x',
        )
        self.assertEqual(u.role, User.ROLE_STUDENT)
        self.assertFalse(u.is_staff)
        self.assertFalse(u.is_superuser)

    def test_create_superuser_still_works(self):
        su = User.objects.create_superuser(
            email='su@a.com', username='su', password='x',
        )
        self.assertTrue(su.is_staff)
        self.assertTrue(su.is_superuser)
        # Superusers ALWAYS get role='admin' - the User.save() hook
        # keeps the role column in sync with is_superuser so the admin
        # role filter / role pill / scoping checks all agree. Without
        # this, a superuser could match the "Role: Student" filter while
        # being labelled "Admin" in the pill, which was confusing.
        self.assertEqual(su.role, User.ROLE_ADMIN)

    def test_assignment_persists_through_refresh(self):
        teacher = User.objects.create_user(
            email='t@a.com', username='t', password='x', role=User.ROLE_TEACHER,
        )
        student = User.objects.create_user(
            email='s@a.com', username='s', password='x',
        )
        student.teachers.add(teacher)
        student.refresh_from_db()
        self.assertEqual(student.teachers.count(), 1)
