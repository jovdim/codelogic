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
        
        # Set initial streak to 1 and last_activity_date to today
        if 'current_streak' not in extra_fields:
            extra_fields['current_streak'] = 1
        if 'longest_streak' not in extra_fields:
            extra_fields['longest_streak'] = 1
        if 'last_activity_date' not in extra_fields:
            extra_fields['last_activity_date'] = timezone.now().date()
        
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_email_verified', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with email authentication and gamification fields.
    """
    ROLE_STUDENT = 'student'
    ROLE_TEACHER = 'teacher'
    ROLE_ADMIN = 'admin'
    ROLE_CHOICES = [
        (ROLE_STUDENT, 'Student'),
        (ROLE_TEACHER, 'Teacher'),
        (ROLE_ADMIN, 'Admin'),
    ]

    # Suggested department list; admin can still type a custom value because
    # we leave `choices` off and the form is a free-text input. The list is
    # only used as a typing/UI hint elsewhere.
    DEPARTMENT_SUGGESTIONS = ['IT', 'Computer Engineering']

    # Default options shown in the dropdown. The field itself accepts
    # any positive integer (no `choices=` on the DB field), so the admin
    # form's "Other..." input can post 5, 6, etc. for schools with
    # non-standard programs. These labels are still used to render the
    # known values nicely (1 -> "1st Year").
    YEAR_LEVEL_CHOICES = [
        (1, '1st Year'),
        (2, '2nd Year'),
        (3, '3rd Year'),
        (4, '4th Year'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, max_length=255)
    username = models.CharField(unique=True, max_length=50)

    # Profile fields
    display_name = models.CharField(max_length=100, blank=True)
    last_display_name_change = models.DateTimeField(null=True, blank=True)
    avatar = models.PositiveIntegerField(default=1, choices=[(i, f'Avatar {i}') for i in range(1, 6)])  # 1-5 preset avatars
    bio = models.TextField(max_length=500, blank=True)

    # Role + assignment
    # Students play the game; teachers manage their assigned students via
    # the /teacher/ portal; admins use Django admin. Computed superuser is
    # always treated as admin regardless of `role`.
    role = models.CharField(max_length=16, choices=ROLE_CHOICES, default=ROLE_STUDENT)
    department = models.CharField(
        max_length=80, blank=True, default='',
        help_text='Department label (e.g. "IT", "Computer Engineering"). Free text - use anything that matches your school.',
    )
    year_level = models.PositiveSmallIntegerField(
        null=True, blank=True, choices=YEAR_LEVEL_CHOICES,
        help_text='Year level for students. Pick 1st-4th from the dropdown, or use "Other..." for non-standard programs (medical, PhD, etc.).',
    )
    section = models.CharField(
        max_length=20, blank=True, default='',
        help_text='Section label (e.g. "A", "1B", "Block 3"). Optional for teachers/admin.',
    )
    # Students -> teachers M2M. A student may have multiple subject teachers;
    # a teacher sees ONLY students in this set on their portal. Superadmins
    # see everyone via Django admin so they don't need to populate this.
    teachers = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='students',
        blank=True,
        limit_choices_to={'role': 'teacher'},
        help_text='For students: the teachers who can manage this student.',
    )

    # Account status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    # Lockout: counts wrong-password attempts since the last successful login.
    # On reaching FAILED_LOGIN_THRESHOLD the LoginView flips is_email_verified
    # off and emails an unlock link, reusing the existing email-verify flow.
    failed_login_attempts = models.PositiveIntegerField(default=0)
    
    # Timestamps
    date_joined = models.DateTimeField(default=timezone.now)
    last_active = models.DateTimeField(auto_now=True)
    
    # Gamification fields (for future use)
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    
    # Hearts/Lives system
    max_hearts = models.PositiveIntegerField(default=10)
    current_hearts = models.PositiveIntegerField(default=10)
    last_heart_update = models.DateTimeField(default=timezone.now)
    
    # Streak system
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    # Post-login face verification snapshot. JPEG bytes captured by the
    # browser when the user passes the face check after login. Stored
    # for admin review (e.g. dispute / impersonation investigation).
    last_login_face_photo = models.BinaryField(null=True, blank=True)
    last_login_face_captured_at = models.DateTimeField(null=True, blank=True)

    # Reference / "base" photo of the student, supplied by the teacher
    # at student-creation time (file upload OR webcam capture). Used
    # purely for human-eye verification: a teacher can scroll the
    # student detail page and compare this reference against the
    # post-login face snapshots in LoginFaceSnapshot. No automatic
    # matching - just a visual aid. Stored as JPEG bytes.
    base_face_photo = models.BinaryField(null=True, blank=True)
    base_face_photo_at = models.DateTimeField(null=True, blank=True)

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

    @property
    def scoping_year_level(self):
        """Year level used for content scoping rules.

        Teachers / admins / superusers ALWAYS scope to None (= see all
        years) regardless of any value on their `year_level` column.
        Only actual students get year-level filtering. This stops a
        teacher who happens to have year_level=2 in the DB from being
        treated like a 2nd-year student and losing access to other-year
        topics.
        """
        if self.is_superuser or self.is_staff:
            return None
        if self.role != self.ROLE_STUDENT:
            return None
        return self.year_level
    
    def can_change_display_name(self):
        """Check if user can change display name (3-day cooldown)."""
        if self.last_display_name_change is None:
            return True, None
        
        from datetime import timedelta
        cooldown = timedelta(days=3)
        next_change_allowed = self.last_display_name_change + cooldown
        
        if timezone.now() >= next_change_allowed:
            return True, None
        
        return False, next_change_allowed
    
    def calculate_level(self):
        """Calculate user level based on XP."""
        # Simple formula: level = 1 + (xp // 500)
        # Can be adjusted for more complex progression
        return 1 + (self.xp // 500)
    
    def save(self, *args, **kwargs):
        self.level = self.calculate_level()
        # Superusers are treated as admins everywhere in the app; keep the
        # `role` column in sync so admin filters / role pills / scoping
        # checks all agree. Without this, a superuser created before the
        # `role` field existed (or via `createsuperuser` with explicit
        # role) can show up under the Student filter while being labelled
        # "Admin" in the pill, which is confusing.
        if self.is_superuser and self.role != self.ROLE_ADMIN:
            self.role = self.ROLE_ADMIN
        super().save(*args, **kwargs)


class LoginFaceSnapshot(models.Model):
    """One row per post-login face-verification capture.

    Replaces the single `last_login_face_photo` field on User: that field
    overwrote on every login, losing history. This model appends, so admins
    can review every login attempt for a given user (impersonation /
    dispute investigations).

    The legacy User fields are still around (read-only) so existing data
    isn't lost; new captures only go here.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='login_face_snapshots',
    )
    photo = models.BinaryField()
    captured_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'login_face_snapshots'
        ordering = ['-captured_at']
        indexes = [
            models.Index(fields=['user', '-captured_at']),
        ]

    def __str__(self):
        return f'Login snapshot for {self.user.email} at {self.captured_at:%Y-%m-%d %H:%M:%S}'


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
