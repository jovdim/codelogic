"""
Site Settings Model - Allows admin to configure site-wide settings without code changes.
"""

from django.db import models
from django.core.cache import cache
import uuid


class SiteSettings(models.Model):
    """
    Singleton model for site-wide settings.
    Only one instance should exist.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # ===== SITE BRANDING =====
    site_name = models.CharField(max_length=100, default='CodeLogic')
    site_tagline = models.CharField(max_length=200, default='Learn to Code, Level Up')
    site_description = models.TextField(
        default='A gamified quiz platform that makes learning programming fun, engaging, and rewarding.',
        help_text='Meta description for SEO'
    )
    contact_email = models.EmailField(default='hello@codelogic.com')
    
    # ===== GAME MECHANICS =====
    max_hearts = models.PositiveIntegerField(
        default=10,
        help_text='Maximum hearts a user can have'
    )
    heart_regen_minutes = models.PositiveIntegerField(
        default=2,
        help_text='Minutes to regenerate 1 heart'
    )
    xp_per_correct_answer = models.PositiveIntegerField(
        default=10,
        help_text='XP earned per correct answer'
    )
    xp_perfect_bonus = models.PositiveIntegerField(
        default=50,
        help_text='Bonus XP for completing a quiz with 100%'
    )
    question_time_limit = models.PositiveIntegerField(
        default=30,
        help_text='Seconds per question'
    )
    questions_per_quiz_min = models.PositiveIntegerField(
        default=5,
        help_text='Minimum questions per quiz'
    )
    questions_per_quiz_max = models.PositiveIntegerField(
        default=10,
        help_text='Maximum questions per quiz'
    )
    pass_percentage = models.PositiveIntegerField(
        default=70,
        help_text='Minimum percentage to pass a quiz'
    )
    
    # ===== LEVEL SYSTEM =====
    xp_per_level = models.PositiveIntegerField(
        default=500,
        help_text='XP required per level (Level = 1 + XP // this value)'
    )
    max_topic_levels = models.PositiveIntegerField(
        default=15,
        help_text='Maximum levels per topic'
    )
    
    # ===== SOCIAL LINKS =====
    github_url = models.URLField(blank=True, default='')
    twitter_url = models.URLField(blank=True, default='')
    discord_url = models.URLField(blank=True, default='')
    linkedin_url = models.URLField(blank=True, default='')
    
    # ===== FEATURE FLAGS =====
    maintenance_mode = models.BooleanField(
        default=False,
        help_text='Enable maintenance mode (shows maintenance page)'
    )
    registration_enabled = models.BooleanField(
        default=True,
        help_text='Allow new user registrations'
    )
    email_verification_required = models.BooleanField(
        default=True,
        help_text='Require email verification for new accounts'
    )
    leaderboard_enabled = models.BooleanField(
        default=True,
        help_text='Show leaderboard to users'
    )
    learning_resources_enabled = models.BooleanField(
        default=True,
        help_text='Enable the Learn section with PDF resources'
    )
    
    # ===== ANNOUNCEMENTS =====
    announcement_text = models.TextField(
        blank=True,
        default='',
        help_text='Banner announcement shown to all users (leave blank to hide)'
    )
    announcement_type = models.CharField(
        max_length=20,
        choices=[
            ('info', 'Info (Blue)'),
            ('success', 'Success (Green)'),
            ('warning', 'Warning (Yellow)'),
            ('error', 'Error (Red)'),
        ],
        default='info'
    )
    announcement_enabled = models.BooleanField(default=False)
    
    # Timestamps
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'site_settings'
        verbose_name = 'Site Settings'
        verbose_name_plural = 'Site Settings'
    
    def __str__(self):
        return f"Site Settings (Updated: {self.updated_at.strftime('%Y-%m-%d %H:%M')})"
    
    def save(self, *args, **kwargs):
        # Ensure only one instance exists
        if not self.pk and SiteSettings.objects.exists():
            # Update existing instance instead
            existing = SiteSettings.objects.first()
            self.pk = existing.pk
        
        # Clear cache when settings are saved
        cache.delete('site_settings')
        super().save(*args, **kwargs)
    
    @classmethod
    def get_settings(cls):
        """Get the settings instance, creating if doesn't exist."""
        settings = cache.get('site_settings')
        if not settings:
            settings, created = cls.objects.get_or_create(pk=cls.objects.first().pk if cls.objects.exists() else None)
            cache.set('site_settings', settings, 300)  # Cache for 5 minutes
        return settings


class Announcement(models.Model):
    """
    Multiple announcements/news items for the site.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    content = models.TextField()
    announcement_type = models.CharField(
        max_length=20,
        choices=[
            ('update', 'Platform Update'),
            ('feature', 'New Feature'),
            ('event', 'Event'),
            ('maintenance', 'Maintenance'),
            ('other', 'Other'),
        ],
        default='update'
    )
    is_active = models.BooleanField(default=True)
    is_pinned = models.BooleanField(default=False, help_text='Pinned announcements appear first')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text='Leave blank for no expiration')
    
    class Meta:
        db_table = 'announcements'
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return self.title
