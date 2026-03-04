"""
Models for quiz game mechanics.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import FileExtensionValidator
import uuid

# Import settings models
from .models_settings import SiteSettings, Announcement

# Validator for icon files (allows SVG, PNG, JPG, etc.)
icon_validator = FileExtensionValidator(
    allowed_extensions=['svg', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'ico']
)


class Category(models.Model):
    """Programming categories (Frontend, Backend, etc.)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon_file = models.FileField(
        upload_to='icons/categories/', 
        blank=True, 
        null=True, 
        validators=[icon_validator],
        help_text='Upload SVG, PNG, JPG, or other image for icon'
    )
    color = models.CharField(max_length=7, default='#7c3aed')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'categories'
        ordering = ['order', 'name']
        verbose_name_plural = 'categories'
    
    def __str__(self):
        return self.name
    
    @property
    def icon_url(self):
        if self.icon_file:
            return self.icon_file.url
        return None


class Topic(models.Model):
    """Topics within a category (JavaScript, Python, etc.)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    description = models.TextField(blank=True)
    icon_file = models.FileField(
        upload_to='icons/topics/', 
        blank=True, 
        null=True, 
        validators=[icon_validator],
        help_text='Upload SVG, PNG, JPG, or other image for icon (falls back to category icon)'
    )
    order = models.PositiveIntegerField(default=0)
    total_levels = models.PositiveIntegerField(default=15)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'topics'
        ordering = ['order', 'name']
        unique_together = ['category', 'slug']
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"
    
    @property
    def icon_url(self):
        if self.icon_file:
            return self.icon_file.url
        # Fall back to category icon if topic doesn't have one
        if self.category.icon_file:
            return self.category.icon_file.url
        return None


class Question(models.Model):
    """Quiz questions."""
    QUESTION_TYPES = [
        ('multiple-choice', 'Multiple Choice'),
        ('find-error', 'Find the Error'),
        ('fill-blank', 'Fill in the Blank'),
        ('output', 'What is the Output'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    level = models.PositiveIntegerField(default=1)
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, default='multiple-choice')
    question_text = models.TextField()
    code_snippet = models.TextField(blank=True)
    options = models.JSONField(default=list)
    correct_answer = models.PositiveIntegerField(default=0)
    explanation = models.TextField(blank=True)
    highlight_line = models.PositiveIntegerField(null=True, blank=True)
    xp_reward = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'questions'
        ordering = ['topic', 'level', 'order']
    
    def __str__(self):
        return f"{self.topic.name} L{self.level}: {self.question_text[:50]}"


class Lesson(models.Model):
    """Short lesson slides shown before quiz questions in a level."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='lessons')
    level = models.PositiveIntegerField(default=1)
    title = models.CharField(max_length=200)
    content = models.TextField(help_text='Main lesson text - keep it short and simple')
    code_example = models.TextField(blank=True, help_text='Optional code example to show')
    tip = models.TextField(blank=True, help_text='Optional quick tip or fun fact')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'lessons'
        ordering = ['topic', 'level', 'order']

    def __str__(self):
        return f"{self.topic.name} L{self.level}: {self.title}"


class UserProgress(models.Model):
    """Track user progress on each topic."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='topic_progress')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='user_progress')
    current_level = models.PositiveIntegerField(default=1)
    highest_level_completed = models.PositiveIntegerField(default=0)
    total_xp_earned = models.PositiveIntegerField(default=0)
    total_questions_answered = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    last_played = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_progress'
        unique_together = ['user', 'topic']
    
    def __str__(self):
        return f"{self.user.username} - {self.topic.name}: Level {self.current_level}"


class QuizAttempt(models.Model):
    """Record of each quiz attempt."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='quiz_attempts')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='attempts')
    level = models.PositiveIntegerField()
    score = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=0)
    hearts_lost = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    passed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'quiz_attempts'
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.topic.name} L{self.level}: {self.score}/{self.total_questions}"


class LearningResource(models.Model):
    """PDF learning resources that users can view."""
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    CATEGORY_CHOICES = [
        ('web-development', 'Web Development'),
        ('programming', 'Programming'),
        ('data', 'Data'),
        ('mobile', 'Mobile Development'),
        ('devops', 'DevOps'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='programming')
    language = models.CharField(max_length=50, help_text="Programming language (e.g., Python, JavaScript)")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    
    # PDF file
    pdf_file = models.FileField(upload_to='learning_resources/pdfs/')
    
    # Thumbnail image
    thumbnail = models.ImageField(upload_to='learning_resources/thumbnails/', blank=True, null=True)
    
    # Metadata
    pages = models.PositiveIntegerField(default=1)
    read_time = models.CharField(max_length=50, blank=True, help_text="Estimated read time (e.g., '2 hours')")
    views = models.PositiveIntegerField(default=0)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'learning_resources'
        ordering = ['-is_featured', '-created_at']
    
    def __str__(self):
        return self.title
    
    def increment_views(self):
        """Increment the view count."""
        self.views += 1
        self.save(update_fields=['views'])


class Certificate(models.Model):
    """Certificate for completing a topic. Auto-created when topic is created."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    topic = models.OneToOneField(Topic, on_delete=models.CASCADE, related_name='certificate')
    title = models.CharField(max_length=200, blank=True, help_text='Certificate title (defaults to topic name)')
    description = models.TextField(blank=True, help_text='Custom description for the certificate')
    icon_file = models.FileField(
        upload_to='icons/certificates/', 
        blank=True, 
        null=True, 
        validators=[icon_validator],
        help_text='Custom icon for certificate (defaults to topic icon)'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'certificates'
        ordering = ['topic__category__order', 'topic__order']
    
    def __str__(self):
        return f"Certificate: {self.topic.name}"
    
    @property
    def icon_url(self):
        """Return certificate icon, falling back to topic icon, then category icon."""
        if self.icon_file:
            return self.icon_file.url
        if self.topic.icon_file:
            return self.topic.icon_file.url
        if self.topic.category.icon_file:
            return self.topic.category.icon_file.url
        return None
    
    def get_title(self):
        """Return custom title or default to topic name."""
        return self.title or f"{self.topic.name} Mastery"


class UserCertificate(models.Model):
    """Awarded certificate to a user for completing a topic."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificates')
    certificate = models.ForeignKey(Certificate, on_delete=models.CASCADE, related_name='awarded_to')
    
    # Achievement stats at time of completion
    total_stars = models.PositiveIntegerField(default=0)
    total_xp_earned = models.PositiveIntegerField(default=0)
    completion_date = models.DateTimeField(auto_now_add=True)
    
    # Unique certificate ID for verification
    certificate_code = models.CharField(max_length=20, unique=True, blank=True)
    
    class Meta:
        db_table = 'user_certificates'
        unique_together = ['user', 'certificate']
        ordering = ['-completion_date']
    
    def __str__(self):
        return f"{self.user.username} - {self.certificate.topic.name}"
    
    def save(self, *args, **kwargs):
        if not self.certificate_code:
            # Generate unique certificate code: CL-TOPIC-XXXXXXXX
            import hashlib
            base = f"{self.user.id}-{self.certificate.topic.slug}-{timezone.now().isoformat()}"
            hash_hex = hashlib.md5(base.encode()).hexdigest()[:8].upper()
            topic_code = self.certificate.topic.slug[:4].upper()
            self.certificate_code = f"CL-{topic_code}-{hash_hex}"
        super().save(*args, **kwargs)


# Signal to auto-create certificate when topic is created
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Topic)
def create_certificate_for_topic(sender, instance, created, **kwargs):
    """Automatically create a certificate when a new topic is created."""
    if created:
        Certificate.objects.create(topic=instance)
