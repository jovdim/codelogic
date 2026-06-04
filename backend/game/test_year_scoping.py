"""Tests for Topic.target_year_levels scoping.

Locks the rule:
  - target_year_levels = []  -> visible to ALL year levels (default)
  - target_year_levels = [1] -> only 1st-year students see it
  - User without a year_level (anon / teacher / admin) -> sees everything
"""

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Topic


User = get_user_model()


class TopicVisibilityHelperTests(TestCase):

    def setUp(self):
        cat = Category.objects.create(name='Web', slug='web')
        self.html = Topic.objects.create(
            category=cat, name='HTML', slug='html',
            target_year_levels=[],
        )
        self.html5 = Topic.objects.create(
            category=cat, name='HTML5', slug='html5',
            target_year_levels=[1],
        )
        self.advanced = Topic.objects.create(
            category=cat, name='Advanced JS', slug='advjs',
            target_year_levels=[3, 4],
        )

    def test_empty_list_is_visible_to_everyone(self):
        for year in [None, 1, 2, 3, 4]:
            self.assertTrue(self.html.is_visible_to_year_level(year), year)

    def test_year_1_only_topic_filters_other_years(self):
        self.assertTrue(self.html5.is_visible_to_year_level(1))
        self.assertFalse(self.html5.is_visible_to_year_level(2))
        self.assertFalse(self.html5.is_visible_to_year_level(3))
        self.assertFalse(self.html5.is_visible_to_year_level(4))

    def test_year_3_and_4_topic(self):
        self.assertFalse(self.advanced.is_visible_to_year_level(1))
        self.assertFalse(self.advanced.is_visible_to_year_level(2))
        self.assertTrue(self.advanced.is_visible_to_year_level(3))
        self.assertTrue(self.advanced.is_visible_to_year_level(4))

    def test_none_year_passes_through_filters(self):
        # Anonymous / unscoped users always see scoped topics. Otherwise
        # the dashboard would be empty for non-students.
        self.assertTrue(self.html5.is_visible_to_year_level(None))
        self.assertTrue(self.advanced.is_visible_to_year_level(None))

    def test_invalid_year_string_passes(self):
        # If somehow year_level is a weird value, fall through (don't
        # crash, don't blank the dashboard).
        self.assertTrue(self.html5.is_visible_to_year_level('not-a-number'))

    def test_year_levels_with_string_ints_still_match(self):
        # JSON sometimes ships ints as strings (admin edits).
        weird = Topic.objects.create(
            category=self.html.category, name='X', slug='x',
            target_year_levels=['1', '2'],
        )
        self.assertTrue(weird.is_visible_to_year_level(1))
        self.assertTrue(weird.is_visible_to_year_level(2))
        self.assertFalse(weird.is_visible_to_year_level(3))


class CategoryListYearFilterTests(TestCase):
    """End-to-end through the public categories API to confirm topics
    are filtered out for year-scoped students."""

    def setUp(self):
        self.client = APIClient()
        cat = Category.objects.create(name='Web', slug='web')
        self.html = Topic.objects.create(category=cat, name='HTML', slug='html', target_year_levels=[])
        self.year1_only = Topic.objects.create(category=cat, name='Year1Only', slug='y1o', target_year_levels=[1])
        self.year3_only = Topic.objects.create(category=cat, name='Year3Only', slug='y3o', target_year_levels=[3])

    def _topics_in_payload(self, resp):
        # CategoryListView returns a list of categories; pull the union of topic names.
        names = set()
        for c in resp.json():
            for n in c.get('topics', []):
                names.add(n)
        return names

    def test_anonymous_sees_all_topics(self):
        resp = self.client.get('/api/game/categories/')
        names = self._topics_in_payload(resp)
        self.assertIn('HTML', names)
        self.assertIn('Year1Only', names)
        self.assertIn('Year3Only', names)

    def test_year1_student_only_sees_year1_topics_and_all_years(self):
        student = User.objects.create_user(
            email='y1@example.com', username='y1', password='Tr0ub4dor&3pix',
            year_level=1, is_email_verified=True,
        )
        self.client.force_authenticate(student)
        resp = self.client.get('/api/game/categories/')
        names = self._topics_in_payload(resp)
        self.assertIn('HTML', names)
        self.assertIn('Year1Only', names)
        self.assertNotIn('Year3Only', names)

    def test_year3_student_excludes_year1(self):
        student = User.objects.create_user(
            email='y3@example.com', username='y3', password='Tr0ub4dor&3pix',
            year_level=3, is_email_verified=True,
        )
        self.client.force_authenticate(student)
        resp = self.client.get('/api/game/categories/')
        names = self._topics_in_payload(resp)
        self.assertIn('HTML', names)
        self.assertNotIn('Year1Only', names)
        self.assertIn('Year3Only', names)

    def test_teacher_sees_all_topics(self):
        teacher = User.objects.create_user(
            email='t@example.com', username='t', password='Tr0ub4dor&3pix',
            role=User.ROLE_TEACHER, is_email_verified=True,
        )
        self.client.force_authenticate(teacher)
        resp = self.client.get('/api/game/categories/')
        names = self._topics_in_payload(resp)
        self.assertIn('HTML', names)
        self.assertIn('Year1Only', names)
        self.assertIn('Year3Only', names)
