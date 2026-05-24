"""Tests for quiz scoring, completion, and stars.

Covers the bugs fixed in the scoring overhaul:
  - Star thresholds (single source of truth on QuizAttempt.calculate_stars)
  - Authoritative score recomputed from UserAnswer rows (no client trust)
  - Single QuizAttempt row per quiz (no orphans on completion)
  - UserProgress not double-counted on retries
  - Stars persisted on the attempt row, served by read paths
  - Idempotent completion (replays don't double XP or shift streak)
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import (
    Category,
    Topic,
    Question,
    QuizAttempt,
    UserAnswer,
    UserProgress,
)

User = get_user_model()


# ---------------------------------------------------------------------------
# Pure helper: score → stars
# ---------------------------------------------------------------------------

class CalculateStarsTest(APITestCase):
    """Threshold table - locks the 90/70/50 rule in place."""

    def test_zero_total_returns_zero(self):
        self.assertEqual(QuizAttempt.calculate_stars(0, 0), 0)
        self.assertEqual(QuizAttempt.calculate_stars(5, 0), 0)

    def test_perfect_is_three_stars(self):
        self.assertEqual(QuizAttempt.calculate_stars(10, 10), 3)
        self.assertEqual(QuizAttempt.calculate_stars(5, 5), 3)

    def test_ninety_percent_is_three_stars(self):
        # The bug the user reported: 9/10 used to give 2 stars on the topic
        # page even though the modal said 3.
        self.assertEqual(QuizAttempt.calculate_stars(9, 10), 3)

    def test_eighty_percent_is_two_stars(self):
        self.assertEqual(QuizAttempt.calculate_stars(8, 10), 2)

    def test_seventy_percent_is_two_stars(self):
        self.assertEqual(QuizAttempt.calculate_stars(7, 10), 2)

    def test_sixty_percent_is_one_star(self):
        self.assertEqual(QuizAttempt.calculate_stars(6, 10), 1)

    def test_fifty_percent_is_one_star(self):
        self.assertEqual(QuizAttempt.calculate_stars(5, 10), 1)

    def test_below_fifty_is_zero_stars(self):
        self.assertEqual(QuizAttempt.calculate_stars(4, 10), 0)
        self.assertEqual(QuizAttempt.calculate_stars(0, 10), 0)


# ---------------------------------------------------------------------------
# Shared API setup
# ---------------------------------------------------------------------------

class QuizApiTestBase(APITestCase):
    """Builds a category with one topic and 10 multiple-choice questions."""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(name='Frontend', slug='frontend')
        cls.topic = Topic.objects.create(
            category=cls.category, name='Basics', slug='basics', total_levels=3,
        )
        cls.questions = [
            Question.objects.create(
                topic=cls.topic,
                level=1,
                question_text=f'Q{i}',
                options=['a', 'b', 'c', 'd'],
                correct_answer=0,  # always option 0
                xp_reward=10,
            )
            for i in range(10)
        ]

    def setUp(self):
        self.user = User.objects.create_user(
            email='player@example.com',
            username='player',
            password='pw-1234567',
        )
        self.user.is_email_verified = True
        self.user.current_hearts = 5
        self.user.save()
        self.client.force_authenticate(self.user)

    def start_quiz(self, level=1):
        url = f'/api/game/quiz/{self.category.slug}/{self.topic.slug}/{level}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        return response.data

    def submit_answer(self, attempt_id, question_id, answer):
        return self.client.post(
            '/api/game/answer/',
            {'attempt_id': attempt_id, 'question_id': question_id, 'answer': answer},
            format='json',
        )

    def complete(self, attempt_id, hearts_lost=0):
        return self.client.post(
            '/api/game/complete/',
            {'attempt_id': attempt_id, 'hearts_lost': hearts_lost},
            format='json',
        )


# ---------------------------------------------------------------------------
# SubmitAnswerView
# ---------------------------------------------------------------------------

class SubmitAnswerTests(QuizApiTestBase):
    def test_correct_answer_creates_useranswer_and_does_not_lose_heart(self):
        data = self.start_quiz()
        attempt_id = data['attempt_id']
        q = data['questions'][0]

        hearts_before = self.user.current_hearts
        response = self.submit_answer(attempt_id, q['id'], q['correct_answer'])
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['correct'])
        self.assertFalse(response.data['heart_lost'])

        self.user.refresh_from_db()
        self.assertEqual(self.user.current_hearts, hearts_before)

        ua = UserAnswer.objects.get(attempt_id=attempt_id, question_id=q['id'])
        self.assertTrue(ua.is_correct)
        self.assertEqual(ua.selected_answer, q['correct_answer'])

    def test_wrong_answer_loses_heart_and_records_useranswer(self):
        data = self.start_quiz()
        attempt_id = data['attempt_id']
        q = data['questions'][0]
        wrong = (q['correct_answer'] + 1) % 4

        response = self.submit_answer(attempt_id, q['id'], wrong)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['correct'])
        self.assertTrue(response.data['heart_lost'])

        self.user.refresh_from_db()
        self.assertEqual(self.user.current_hearts, 4)

        ua = UserAnswer.objects.get(attempt_id=attempt_id, question_id=q['id'])
        self.assertFalse(ua.is_correct)

    def test_missing_attempt_id_rejected(self):
        data = self.start_quiz()
        q = data['questions'][0]
        response = self.client.post(
            '/api/game/answer/',
            {'question_id': q['id'], 'answer': 0},
            format='json',
        )
        self.assertEqual(response.status_code, 400)

    def test_attempt_belonging_to_other_user_rejected(self):
        data = self.start_quiz()
        q = data['questions'][0]

        other = User.objects.create_user(
            email='other@example.com', username='other', password='pw-1234567',
        )
        self.client.force_authenticate(other)

        response = self.submit_answer(data['attempt_id'], q['id'], 0)
        self.assertEqual(response.status_code, 404)

    def test_re_submitting_same_question_does_not_overwrite(self):
        # First answer wins - guards against the user changing their mind after
        # the explanation appears.
        data = self.start_quiz()
        attempt_id = data['attempt_id']
        q = data['questions'][0]

        self.submit_answer(attempt_id, q['id'], q['correct_answer'])
        self.submit_answer(attempt_id, q['id'], (q['correct_answer'] + 1) % 4)

        self.assertEqual(UserAnswer.objects.filter(attempt_id=attempt_id).count(), 1)
        ua = UserAnswer.objects.get(attempt_id=attempt_id, question_id=q['id'])
        self.assertTrue(ua.is_correct)


# ---------------------------------------------------------------------------
# SubmitAnswerView - typed-answer (fill-blank, output) & find-error click
# ---------------------------------------------------------------------------

class TypedAnswerSubmitTests(APITestCase):
    """Covers the four question modes: MC, find-error (click line), fill-blank, output."""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(name='Web', slug='web')
        cls.topic = Topic.objects.create(
            category=cls.category, name='HTML', slug='html', total_levels=1,
        )
        cls.q_fill = Question.objects.create(
            topic=cls.topic, level=1,
            question_type='fill-blank',
            question_text='What tag wraps visible HTML content?',
            options=[],
            correct_answer=0,
            correct_text_answer='body',
            accepted_answers=['<body>'],
            xp_reward=10,
        )
        cls.q_output = Question.objects.create(
            topic=cls.topic, level=1,
            question_type='output',
            question_text='What does this print?',
            code_snippet='print("Hello, World!")',
            options=[],
            correct_answer=0,
            correct_text_answer='Hello, World!',
            xp_reward=10,
        )
        cls.q_find = Question.objects.create(
            topic=cls.topic, level=1,
            question_type='find-error',
            question_text='Which line has the bug?',
            code_snippet='<html>\n<head>\n  <title>My Page<title>\n</head>',
            options=[],
            correct_answer=0,
            highlight_line=3,
            xp_reward=10,
        )

    def setUp(self):
        self.user = User.objects.create_user(
            email='player@example.com', username='player', password='pw-1234567',
        )
        self.user.current_hearts = 5
        self.user.save()
        self.client.force_authenticate(self.user)
        self.attempt = QuizAttempt.objects.create(
            user=self.user, topic=self.topic, level=1, total_questions=3,
        )

    def _submit(self, question, **payload):
        return self.client.post(
            '/api/game/answer/',
            {'attempt_id': str(self.attempt.id), 'question_id': str(question.id), **payload},
            format='json',
        )

    # ----- fill-blank -----

    def test_fill_blank_exact_text_is_correct(self):
        r = self._submit(self.q_fill, answer_text='body')
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data['correct'])
        ua = UserAnswer.objects.get(attempt=self.attempt, question=self.q_fill)
        self.assertTrue(ua.is_correct)
        self.assertEqual(ua.selected_text, 'body')
        self.assertEqual(ua.selected_answer, -1)

    def test_fill_blank_case_sensitive_wrong(self):
        # Case matters now: `BODY` should NOT match `body`.
        r = self._submit(self.q_fill, answer_text='BODY')
        self.assertFalse(r.data['correct'])

    def test_fill_blank_outer_whitespace_trimmed(self):
        # Only outer whitespace is stripped - internal stays as-is.
        r = self._submit(self.q_fill, answer_text='  body  ')
        self.assertTrue(r.data['correct'])

    def test_fill_blank_accepted_variant(self):
        r = self._submit(self.q_fill, answer_text='<body>')
        self.assertTrue(r.data['correct'])

    def test_fill_blank_wrong_loses_heart(self):
        r = self._submit(self.q_fill, answer_text='div')
        self.assertFalse(r.data['correct'])
        self.assertTrue(r.data['heart_lost'])
        self.user.refresh_from_db()
        self.assertEqual(self.user.current_hearts, 4)

    def test_fill_blank_correct_answer_display_returned(self):
        r = self._submit(self.q_fill, answer_text='div')
        self.assertEqual(r.data['correct_answer_display'], 'body')

    # ----- output -----

    def test_output_exact_match_correct(self):
        r = self._submit(self.q_output, answer_text='Hello, World!')
        self.assertTrue(r.data['correct'])

    def test_output_wrong_text_loses_heart(self):
        r = self._submit(self.q_output, answer_text='Hello World')
        self.assertFalse(r.data['correct'])
        self.assertTrue(r.data['heart_lost'])

    # ----- find-error (clicked line number) -----

    def test_find_error_correct_line_clicked(self):
        r = self._submit(self.q_find, answer=3)
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.data['correct'])
        ua = UserAnswer.objects.get(attempt=self.attempt, question=self.q_find)
        self.assertEqual(ua.selected_answer, 3)
        self.assertTrue(ua.is_correct)

    def test_find_error_wrong_line_clicked(self):
        r = self._submit(self.q_find, answer=1)
        self.assertFalse(r.data['correct'])
        self.assertEqual(r.data['correct_answer_display'], 'Line 3')
        self.assertTrue(r.data['heart_lost'])

    # ----- missing-fields safety -----

    def test_typed_question_missing_text_rejected(self):
        r = self._submit(self.q_fill)  # no answer or answer_text
        self.assertEqual(r.status_code, 400)

    # ----- legacy-data fallback: typed questions without correct_text_answer -----

    def test_typed_question_falls_back_to_options_when_text_answer_missing(self):
        """Legacy seeded fill-blank/output questions only have options + correct_answer.
        They must still grade correctly without a backfill."""
        legacy = Question.objects.create(
            topic=self.topic, level=1,
            question_type='fill-blank',
            question_text='Legacy fill-blank with no correct_text_answer',
            options=['console.log', 'print', 'echo', 'puts'],
            correct_answer=0,
            correct_text_answer='',  # the bug
        )
        r = self._submit(legacy, answer_text='console.log')
        self.assertTrue(r.data['correct'], r.data)
        self.assertEqual(r.data['correct_answer_display'], 'console.log')

    def test_typed_question_fallback_wrong_answer(self):
        legacy = Question.objects.create(
            topic=self.topic, level=1,
            question_type='output',
            question_text='Legacy output',
            options=['Hello, World!', 'hello', 'Error', 'undefined'],
            correct_answer=0,
            correct_text_answer='',
        )
        r = self._submit(legacy, answer_text='hello')
        self.assertFalse(r.data['correct'])
        self.assertEqual(r.data['correct_answer_display'], 'Hello, World!')

    # ----- legacy-data fallback: single-line find-error reverts to MC -----

    def test_find_error_single_line_falls_back_to_mc(self):
        """Single-line find-error can't be 'click the buggy line'. The view
        should evaluate `answer` as an option index against `correct_answer`."""
        single = Question.objects.create(
            topic=self.topic, level=1,
            question_type='find-error',
            question_text='Find the bug',
            code_snippet='let x = 5',  # single line, no \n
            options=['Missing semicolon', 'Wrong keyword', 'Wrong value', 'Nothing wrong'],
            correct_answer=0,
            highlight_line=1,
        )
        # answer=0 picks the first option → matches correct_answer → correct
        r = self._submit(single, answer=0)
        self.assertTrue(r.data['correct'], r.data)
        # answer=1 picks the wrong option → wrong
        single2 = Question.objects.create(
            topic=self.topic, level=1,
            question_type='find-error',
            question_text='Find the bug 2',
            code_snippet='print(x)',
            options=['A', 'B', 'C', 'D'],
            correct_answer=2,
            highlight_line=1,
        )
        r2 = self._submit(single2, answer=1)
        self.assertFalse(r2.data['correct'], r2.data)


# ---------------------------------------------------------------------------
# Question model: normalization helper
# ---------------------------------------------------------------------------

class CheckTextAnswerTests(APITestCase):
    """check_text_answer: strict case-sensitive match, only outer-whitespace trim."""

    @classmethod
    def setUpTestData(cls):
        cls.category = Category.objects.create(name='C', slug='c')
        cls.topic = Topic.objects.create(category=cls.category, name='T', slug='t', total_levels=1)
        cls.q = Question.objects.create(
            topic=cls.topic, level=1,
            question_type='output',
            question_text='?',
            correct_text_answer='5',
            accepted_answers=['five', 'V'],
        )

    def test_exact(self):
        self.assertTrue(self.q.check_text_answer('5'))

    def test_case_sensitive_mismatch(self):
        # 'FIVE' should NOT match 'five' (admin can add it to accepted_answers if they want).
        self.assertFalse(self.q.check_text_answer('FIVE'))

    def test_outer_whitespace_trimmed_only(self):
        self.assertTrue(self.q.check_text_answer('  five  '))

    def test_internal_whitespace_matters(self):
        # 'f i v e' should NOT match 'five' - internal whitespace preserved.
        self.assertFalse(self.q.check_text_answer('f i v e'))

    def test_variant_exact_case(self):
        # 'V' is in accepted_answers; 'v' (lowercase) is not.
        self.assertTrue(self.q.check_text_answer('V'))
        self.assertFalse(self.q.check_text_answer('v'))

    def test_empty_is_wrong(self):
        self.assertFalse(self.q.check_text_answer(''))
        self.assertFalse(self.q.check_text_answer(None))

    def test_wrong(self):
        self.assertFalse(self.q.check_text_answer('6'))


# ---------------------------------------------------------------------------
# CompleteQuizView
# ---------------------------------------------------------------------------

class CompleteQuizTests(QuizApiTestBase):
    def _answer_n_correct(self, data, n):
        attempt_id = data['attempt_id']
        for i, q in enumerate(data['questions']):
            answer = q['correct_answer'] if i < n else (q['correct_answer'] + 1) % 4
            self.submit_answer(attempt_id, q['id'], answer)
        return attempt_id

    def test_perfect_run_stores_three_stars(self):
        data = self.start_quiz()
        attempt_id = self._answer_n_correct(data, 10)

        response = self.complete(attempt_id)
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['score'], 10)
        self.assertEqual(response.data['stars'], 3)
        self.assertTrue(response.data['passed'])

        attempt = QuizAttempt.objects.get(id=attempt_id)
        self.assertEqual(attempt.score, 10)
        self.assertEqual(attempt.stars, 3)
        self.assertTrue(attempt.completed)
        self.assertTrue(attempt.passed)

    def test_nine_out_of_ten_is_three_stars(self):
        data = self.start_quiz()
        attempt_id = self._answer_n_correct(data, 9)

        response = self.complete(attempt_id)
        self.assertEqual(response.data['score'], 9)
        self.assertEqual(response.data['stars'], 3)

    def test_seven_out_of_ten_is_two_stars(self):
        data = self.start_quiz()
        attempt_id = self._answer_n_correct(data, 7)

        response = self.complete(attempt_id)
        self.assertEqual(response.data['score'], 7)
        self.assertEqual(response.data['stars'], 2)

    def test_failing_run_does_not_set_passed(self):
        data = self.start_quiz()
        attempt_id = self._answer_n_correct(data, 3)

        response = self.complete(attempt_id)
        self.assertFalse(response.data['passed'])
        self.assertEqual(response.data['stars'], 0)

    def test_client_supplied_score_is_ignored(self):
        # A tampered client tries to claim 10/10 having only answered 1 correct.
        data = self.start_quiz()
        attempt_id = self._answer_n_correct(data, 1)

        response = self.client.post(
            '/api/game/complete/',
            {
                'attempt_id': attempt_id,
                'hearts_lost': 0,
                # Inflated values that should be ignored.
                'score': 10,
                'total_questions': 10,
            },
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['score'], 1)
        self.assertEqual(response.data['stars'], 0)

    def test_no_orphan_attempt_row_on_completion(self):
        # Before the fix: starting + completing a quiz produced 2 attempts.
        data = self.start_quiz()
        attempt_id = self._answer_n_correct(data, 10)
        self.complete(attempt_id)

        attempts = QuizAttempt.objects.filter(user=self.user, topic=self.topic)
        self.assertEqual(attempts.count(), 1)
        self.assertTrue(attempts.first().completed)

    def test_completion_is_idempotent(self):
        data = self.start_quiz()
        attempt_id = self._answer_n_correct(data, 10)

        first = self.complete(attempt_id)
        xp_after_first = self.user.__class__.objects.get(pk=self.user.pk).xp

        second = self.complete(attempt_id)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.data['score'], first.data['score'])
        self.assertEqual(second.data['stars'], first.data['stars'])

        # XP must not double on replay.
        xp_after_second = self.user.__class__.objects.get(pk=self.user.pk).xp
        self.assertEqual(xp_after_first, xp_after_second)

        # Still only one row.
        self.assertEqual(
            QuizAttempt.objects.filter(user=self.user, topic=self.topic).count(),
            1,
        )

    def test_progress_not_double_counted_on_retry(self):
        # Play level 1 perfectly - first pass.
        data = self.start_quiz()
        self._answer_n_correct(data, 10)
        self.complete(data['attempt_id'])

        progress = UserProgress.objects.get(user=self.user, topic=self.topic)
        self.assertEqual(progress.total_questions_answered, 10)
        self.assertEqual(progress.correct_answers, 10)

        # Replay level 1 - should NOT inflate the lifetime counters.
        data2 = self.start_quiz()
        self._answer_n_correct(data2, 8)  # different score this time
        self.complete(data2['attempt_id'])

        progress.refresh_from_db()
        self.assertEqual(progress.total_questions_answered, 10)
        self.assertEqual(progress.correct_answers, 10)

    def test_passing_unlocks_next_level(self):
        data = self.start_quiz(level=1)
        self._answer_n_correct(data, 10)
        self.complete(data['attempt_id'])

        progress = UserProgress.objects.get(user=self.user, topic=self.topic)
        self.assertEqual(progress.highest_level_completed, 1)
        self.assertEqual(progress.current_level, 2)

    def test_xp_bonus_for_perfect_and_no_hearts_lost(self):
        data = self.start_quiz()
        attempt_id = self._answer_n_correct(data, 10)
        response = self.complete(attempt_id, hearts_lost=0)
        # 10 correct * 10 + 50 perfect + 25 no-hearts-lost = 175.
        self.assertEqual(response.data['xp_earned'], 175)

    def test_xp_no_bonuses_when_imperfect_and_hearts_lost(self):
        data = self.start_quiz()
        attempt_id = self._answer_n_correct(data, 7)
        response = self.complete(attempt_id, hearts_lost=2)
        # 7 * 10 = 70, no perfect bonus, no no-hearts-lost bonus.
        self.assertEqual(response.data['xp_earned'], 70)

    def test_unknown_attempt_returns_404(self):
        response = self.complete('00000000-0000-0000-0000-000000000000')
        self.assertEqual(response.status_code, 404)

    def test_other_users_attempt_rejected(self):
        data = self.start_quiz()
        attempt_id = data['attempt_id']

        other = User.objects.create_user(
            email='other@example.com', username='other', password='pw-1234567',
        )
        self.client.force_authenticate(other)

        response = self.complete(attempt_id)
        self.assertEqual(response.status_code, 404)


# ---------------------------------------------------------------------------
# Read paths use the persisted stars
# ---------------------------------------------------------------------------

class TopicProgressStarsTests(QuizApiTestBase):
    def test_topic_endpoint_returns_persisted_stars(self):
        data = self.start_quiz(level=1)
        for i, q in enumerate(data['questions']):
            ans = q['correct_answer'] if i < 9 else (q['correct_answer'] + 1) % 4
            self.submit_answer(data['attempt_id'], q['id'], ans)
        self.complete(data['attempt_id'])

        url = f'/api/game/topics/{self.category.slug}/{self.topic.slug}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        progress = response.data['user_progress']
        self.assertEqual(progress['level_stars'][1], 3)
        self.assertEqual(progress['total_stars'], 3)

    def test_best_stars_per_level_kept_across_retries(self):
        # First run: 7/10 → 2 stars.
        data1 = self.start_quiz(level=1)
        for i, q in enumerate(data1['questions']):
            ans = q['correct_answer'] if i < 7 else (q['correct_answer'] + 1) % 4
            self.submit_answer(data1['attempt_id'], q['id'], ans)
        self.complete(data1['attempt_id'])

        # Replay: 10/10 → 3 stars. Best should stick.
        data2 = self.start_quiz(level=1)
        for q in data2['questions']:
            self.submit_answer(data2['attempt_id'], q['id'], q['correct_answer'])
        self.complete(data2['attempt_id'])

        url = f'/api/game/topics/{self.category.slug}/{self.topic.slug}/'
        response = self.client.get(url)
        self.assertEqual(response.data['user_progress']['level_stars'][1], 3)

    def test_worse_replay_does_not_demote_stars(self):
        # 10/10 → 3 stars.
        data1 = self.start_quiz(level=1)
        for q in data1['questions']:
            self.submit_answer(data1['attempt_id'], q['id'], q['correct_answer'])
        self.complete(data1['attempt_id'])

        # Replay 5/10 → 1 star, but the previous 3 should still win.
        data2 = self.start_quiz(level=1)
        for i, q in enumerate(data2['questions']):
            ans = q['correct_answer'] if i < 5 else (q['correct_answer'] + 1) % 4
            self.submit_answer(data2['attempt_id'], q['id'], ans)
        self.complete(data2['attempt_id'])

        url = f'/api/game/topics/{self.category.slug}/{self.topic.slug}/'
        response = self.client.get(url)
        self.assertEqual(response.data['user_progress']['level_stars'][1], 3)
