"""
Models for quiz game mechanics.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import FileExtensionValidator
import re
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
    options = models.JSONField(default=list, blank=True)
    correct_answer = models.PositiveIntegerField(default=0)
    correct_text_answer = models.TextField(
        blank=True,
        help_text='For "Fill in the Blank" and "What is the Output" — the canonical text the user must type.',
    )
    accepted_answers = models.JSONField(
        default=list, blank=True,
        help_text='Optional alternative accepted answers as a JSON list, e.g. ["5", "five"]. Used alongside correct_text_answer.',
    )
    explanation = models.TextField(blank=True)
    highlight_line = models.PositiveIntegerField(
        null=True, blank=True,
        help_text='For "Find the Error" — the 1-based line number containing the bug. This is also the correct answer the user must click.',
    )
    xp_reward = models.PositiveIntegerField(default=10)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'questions'
        ordering = ['topic', 'level', 'order']

    def __str__(self):
        return f"{self.topic.name} L{self.level}: {self.question_text[:50]}"

    @staticmethod
    def _normalize_text(value):
        """Normalize for comparison: ONLY strip outer whitespace.
        Matching is case-sensitive and preserves internal whitespace —
        `body` ≠ `BODY`, `console.log` ≠ `console . log`. If the admin
        wants to accept casing variants, they add them to accepted_answers.
        """
        if value is None:
            return ''
        return str(value).strip()

    @property
    def resolved_text_answer(self):
        """Canonical text answer for typed-type questions.

        Falls back to options[correct_answer] when correct_text_answer is empty
        — this keeps legacy seeded data (which only set options + correct_answer
        index) working as typed-answer questions without a backfill.
        """
        if self.correct_text_answer:
            return self.correct_text_answer
        opts = self.options or []
        if 0 <= self.correct_answer < len(opts):
            return str(opts[self.correct_answer])
        return ''

    def check_text_answer(self, typed):
        """Return True if `typed` matches the canonical answer or any accepted_answers variant."""
        if not typed:
            return False
        normalized = self._normalize_text(typed)
        if normalized == self._normalize_text(self.resolved_text_answer):
            return True
        for variant in (self.accepted_answers or []):
            if normalized == self._normalize_text(variant):
                return True
        return False

    @property
    def is_single_line_code(self):
        """find-error with one-line code can't be 'click the buggy line' — falls back to MC."""
        return bool(self.code_snippet) and '\n' not in self.code_snippet.strip()

    # Patterns where the "answer" is a display label (e.g. '[, ]' meaning
    # 'open with [ and close with ]'). These questions have two blanks in the
    # code and can't be answered by typing a single string — force MC.
    _DISPLAY_LABEL_PATTERN = re.compile(r'^[\[\(\{\<],\s*[\]\)\}\>]$')

    @property
    def effective_question_type(self):
        """The question type to render and grade against — after applying
        compatibility fallbacks for legacy / structurally-incompatible data.

        Forces 'multiple-choice' when:
          * typed-type but resolved_text_answer is empty
          * typed-type but answer looks like a display label (e.g. '[, ]')
          * find-error with single-line code or no highlight_line
        """
        qtype = self.question_type
        if qtype in ('fill-blank', 'output'):
            resolved = self.resolved_text_answer
            if not resolved:
                return 'multiple-choice'
            if self._DISPLAY_LABEL_PATTERN.match(resolved):
                return 'multiple-choice'
        elif qtype == 'find-error':
            if self.is_single_line_code or not self.highlight_line:
                return 'multiple-choice'
        return qtype


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
    stars = models.PositiveSmallIntegerField(default=0)
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

    @staticmethod
    def calculate_stars(score, total_questions):
        """Single source of truth for score → stars. Mirrors the result-modal rule."""
        if not total_questions:
            return 0
        pct = score / total_questions
        if pct >= 0.9:
            return 3
        if pct >= 0.7:
            return 2
        if pct >= 0.5:
            return 1
        return 0


class UserAnswer(models.Model):
    """One row per answered question in a quiz attempt. Authoritative record of correctness."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey('Question', on_delete=models.CASCADE)
    selected_answer = models.IntegerField(
        help_text='Integer answer: option index for multiple-choice, line number for find-error. -1 when the answer is text-based (see selected_text).',
    )
    selected_text = models.TextField(
        null=True, blank=True,
        help_text='Raw typed answer for fill-blank / output questions.',
    )
    is_correct = models.BooleanField()
    answered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_answers'
        unique_together = [('attempt', 'question')]

    def __str__(self):
        return f"{self.attempt_id} Q{self.question_id}: {'OK' if self.is_correct else 'WRONG'}"


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
