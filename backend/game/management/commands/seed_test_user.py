"""
Create / refresh a test account that has every topic fully completed.

Use this to demo the certificates section without playing through all levels:

    python manage.py seed_test_user

By default it creates `tester@codelogic.dev` (password: Tester2026!) and
marks every active topic as complete with a UserCertificate awarded. Idempotent
- if the user already exists, just refreshes their progress.

Pass `--email`, `--username`, `--password` to override the defaults, or
`--topics frontend/html,frontend/css` to only complete a subset.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone

from game.models import (
    Category,
    Topic,
    Certificate,
    UserCertificate,
    UserProgress,
    QuizAttempt,
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Create / refresh a fully-completed test account for certificate demos.'

    def add_arguments(self, parser):
        parser.add_argument('--email', default='tester@codelogic.dev')
        parser.add_argument('--username', default='tester')
        parser.add_argument('--password', default='Tester2026!')
        parser.add_argument('--display-name', default='Test Account')
        parser.add_argument(
            '--topics',
            default='',
            help='Comma-separated list of "category-slug/topic-slug" pairs. Empty = all active topics.',
        )

    def handle(self, *args, **opts):
        email = opts['email']
        username = opts['username']
        password = opts['password']
        display_name = opts['display_name']

        # 1. Create or update the user
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': username,
                'display_name': display_name,
                'is_email_verified': True,
                'is_active': True,
                'current_hearts': 5,
                'max_hearts': 5,
            },
        )
        # Always set password so the caller can rely on it.
        user.set_password(password)
        user.is_email_verified = True
        user.is_active = True
        user.username = username
        if not user.display_name:
            user.display_name = display_name
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f'Created user {email}'))
        else:
            self.stdout.write(f'Refreshing existing user {email}')

        # 2. Pick which topics to mark complete
        if opts['topics']:
            wanted = []
            for pair in opts['topics'].split(','):
                pair = pair.strip()
                if not pair:
                    continue
                cat_slug, topic_slug = pair.split('/', 1)
                try:
                    wanted.append(Topic.objects.get(
                        category__slug=cat_slug, slug=topic_slug, is_active=True,
                    ))
                except Topic.DoesNotExist:
                    self.stderr.write(self.style.WARNING(f'Skipping unknown topic: {pair}'))
            topics = wanted
        else:
            topics = list(Topic.objects.filter(is_active=True).select_related('category'))

        if not topics:
            self.stderr.write(self.style.ERROR('No topics to seed. Did you forget to seed_questions?'))
            return

        # 3. For each topic: mark progress complete + award certificate
        total_xp = 0
        for topic in topics:
            level_count = topic.total_levels or 5
            xp_per_topic = level_count * 100
            total_xp += xp_per_topic

            # Mark UserProgress as fully complete
            UserProgress.objects.update_or_create(
                user=user,
                topic=topic,
                defaults={
                    'current_level': level_count,
                    'highest_level_completed': level_count,
                    'total_xp_earned': xp_per_topic,
                    'total_questions_answered': level_count * 10,
                    'correct_answers': level_count * 10,
                },
            )

            # Add a single dummy QuizAttempt for the last level so the
            # completion history isn't empty (admin photo review etc).
            if not QuizAttempt.objects.filter(user=user, topic=topic, level=level_count).exists():
                QuizAttempt.objects.create(
                    user=user,
                    topic=topic,
                    level=level_count,
                    score=10,
                    total_questions=10,
                    stars=3,
                    xp_earned=100,
                    hearts_lost=0,
                    completed=True,
                    passed=True,
                    completed_at=timezone.now(),
                )

            # Make sure the topic has a Certificate row (auto-created in
            # most setups, but safe to ensure).
            cert, _ = Certificate.objects.get_or_create(topic=topic)

            # Award the UserCertificate
            UserCertificate.objects.update_or_create(
                user=user,
                certificate=cert,
                defaults={
                    'total_stars': level_count * 3,
                    'total_xp_earned': xp_per_topic,
                },
            )

        # 4. Bump the user's totals so the leaderboard / dashboard look right
        user.xp = total_xp
        user.level = max(1, total_xp // 1000)
        user.current_streak = 7
        user.longest_streak = 14
        user.current_hearts = user.max_hearts
        user.save()

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {len(topics)} topic(s) for {email}. '
            f'Login with: {email} / {password}'
        ))
