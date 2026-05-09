"""
Delete photo blobs (verification photos + in-quiz monitor snapshots) older
than the retention window.

The QuizAttempt and QuizSnapshot rows themselves are preserved (we still
want the score / monitor history) - only the JPEG bytes are nulled. Run
daily from a cron / DigitalOcean scheduled job.
"""

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from game.models import QuizAttempt, QuizSnapshot


class Command(BaseCommand):
    help = "Null out verification photos + quiz monitor snapshots older than --days (default 60)."

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
        dry = opts['dry_run']
        cutoff = timezone.now() - timedelta(days=days)

        # 1) Start-of-quiz verification photos.
        verify_qs = QuizAttempt.objects.filter(
            verification_captured_at__lt=cutoff,
        ).exclude(verification_photo__isnull=True)
        verify_count = verify_qs.count()

        # 2) In-quiz monitor snapshots.
        snap_qs = QuizSnapshot.objects.filter(
            captured_at__lt=cutoff,
        ).exclude(photo__isnull=True)
        snap_count = snap_qs.count()

        if dry:
            self.stdout.write(
                f'[dry-run] would clear {verify_count} verification photo(s) '
                f'and {snap_count} monitor snapshot(s) older than {days} days'
            )
            return

        verify_qs.update(verification_photo=None, verification_captured_at=None)
        snap_qs.update(photo=None)

        self.stdout.write(self.style.SUCCESS(
            f'Cleared {verify_count} verification photo(s) '
            f'and {snap_count} monitor snapshot(s) older than {days} days.'
        ))
