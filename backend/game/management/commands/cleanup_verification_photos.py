"""
Delete face-verification photo blobs older than the retention window.

The QuizAttempt row itself is preserved (we still want the score history) —
only the photo bytes and the captured_at timestamp are nulled. Run daily
from a cron / DigitalOcean scheduled job.
"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from game.models import QuizAttempt


class Command(BaseCommand):
    help = "Null out QuizAttempt.verification_photo for rows older than --days (default 60)."

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=60,
            help='Retention window in days. Photos captured before this cutoff are wiped.',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Print how many rows would be wiped without modifying anything.',
        )

    def handle(self, *args, **opts):
        days = opts['days']
        cutoff = timezone.now() - timedelta(days=days)

        qs = QuizAttempt.objects.filter(
            verification_captured_at__lt=cutoff,
        ).exclude(verification_photo__isnull=True)

        count = qs.count()

        if opts['dry_run']:
            self.stdout.write(f'[dry-run] would clear {count} verification photo(s) older than {days} days')
            return

        qs.update(verification_photo=None, verification_captured_at=None)
        self.stdout.write(self.style.SUCCESS(
            f'Cleared {count} verification photo(s) older than {days} days.'
        ))
