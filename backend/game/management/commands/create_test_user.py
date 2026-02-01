"""
Management command to create a test user with all quizzes completed.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from game.models import Topic, UserProgress

User = get_user_model()


class Command(BaseCommand):
    help = 'Create a test user with all quizzes completed and email verified'

    def handle(self, *args, **options):
        # Test user credentials
        username = 'testuser'
        email = 'testuser@codelogic.com'
        password = 'TestUser123!'
        display_name = 'John Doe'
        
        # Delete existing test user if exists
        User.objects.filter(username=username).delete()
        
        # Create the test user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            display_name=display_name,
            is_email_verified=True,
            xp=15000,  # High XP for completing all quizzes
            current_hearts=10,
            max_hearts=10,
            current_streak=30,
            longest_streak=45,
        )
        
        self.stdout.write(f'Created user: {username}')
        
        # Get all topics
        topics = Topic.objects.filter(is_active=True)
        
        total_xp = 0
        for topic in topics:
            # Create progress for each topic - all levels completed
            progress = UserProgress.objects.create(
                user=user,
                topic=topic,
                current_level=topic.total_levels + 1,  # Past the final level
                highest_level_completed=topic.total_levels,
                total_xp_earned=topic.total_levels * 75,  # Approx XP per level
                total_questions_answered=topic.total_levels * 5,
                correct_answers=topic.total_levels * 4,  # ~80% accuracy
            )
            progress.last_played = timezone.now()
            progress.save()
            
            total_xp += progress.total_xp_earned
            self.stdout.write(f'  Completed topic: {topic.name} (15 levels)')
        
        # Update user total XP
        user.xp = total_xp
        user.save()
        
        self.stdout.write(self.style.SUCCESS(f'\n✓ Test user created successfully!'))
        self.stdout.write(self.style.SUCCESS(f'  Username: {username}'))
        self.stdout.write(self.style.SUCCESS(f'  Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'  Password: {password}'))
        self.stdout.write(self.style.SUCCESS(f'  Display Name: {display_name}'))
        self.stdout.write(self.style.SUCCESS(f'  Total XP: {total_xp}'))
        self.stdout.write(self.style.SUCCESS(f'  Topics Completed: {topics.count()}'))
        self.stdout.write(self.style.SUCCESS(f'  Email Verified: Yes'))
