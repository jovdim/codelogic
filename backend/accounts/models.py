"""
Custom User Model for CodeLogic
Includes fields for gamification: hearts, streaks, XP, etc.
"""

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import uuid
import secrets
import random


class UserManager(BaseUserManager):
    """Custom user manager for email-based authentication."""
    
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')
        
        email = self.normalize_email(email)
        # Assign random avatar (1-5) if not specified
        if 'avatar' not in extra_fields:
            extra_fields['avatar'] = random.randint(1, 5)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_email_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with email authentication and gamification fields.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(unique=True, max_length=50)
    
    # Profile fields
    display_name = models.CharField(max_length=100, blank=True)
    avatar = models.PositiveIntegerField(default=1, choices=[(i, f'Avatar {i}') for i in range(1, 6)])  # 1-5 preset avatars
    bio = models.TextField(max_length=500, blank=True)
    
    # Account status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    
    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    last_active = models.DateTimeField(auto_now=True)
    
    # Gamification fields (for future use)
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    
    # Hearts/Lives system
    max_hearts = models.PositiveIntegerField(default=5)
    current_hearts = models.PositiveIntegerField(default=5)
    last_heart_update = models.DateTimeField(default=timezone.now)
    
    # Streak system
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self):
        return self.email
    
    def get_display_name(self):
        return self.display_name or self.username
    
    def calculate_level(self):
        """Calculate user level based on XP."""
        # Simple formula: level = 1 + (xp // 1000)
        # Can be adjusted for more complex progression
        return 1 + (self.xp // 1000)
    
    def save(self, *args, **kwargs):
        self.level = self.calculate_level()
        super().save(*args, **kwargs)


class EmailVerificationToken(models.Model):
    """Token for email verification during registration."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_tokens')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'email_verification_tokens'
    
    def __str__(self):
        return f"Verification token for {self.user.email}"
    
    @classmethod
    def create_token(cls, user, expiry_hours=24):
        """Create a new verification token for a user."""
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timezone.timedelta(hours=expiry_hours)
        return cls.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
    
    def is_valid(self):
        """Check if token is still valid."""
        return not self.is_used and timezone.now() < self.expires_at


class PasswordResetToken(models.Model):
    """Token for password reset requests."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_reset_tokens'
    
    def __str__(self):
        return f"Password reset token for {self.user.email}"
    
    @classmethod
    def create_token(cls, user, expiry_hours=1):
        """Create a new password reset token for a user."""
        # Invalidate any existing tokens
        cls.objects.filter(user=user, is_used=False).update(is_used=True)
        
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timezone.timedelta(hours=expiry_hours)
        return cls.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
    
    def is_valid(self):
        """Check if token is still valid."""
        return not self.is_used and timezone.now() < self.expires_at
