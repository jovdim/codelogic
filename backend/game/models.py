"""
Models for quiz game mechanics.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid

# Import settings models
from .models_settings import SiteSettings, Announcement


class Category(models.Model):
    """Programming categories (Frontend, Backend, etc.)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#7c3aed')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'categories'
        ordering = ['order', 'name']
        verbose_name_plural = 'categories'
    
    def __str__(self):
        return self.name


class Topic(models.Model):
    """Topics within a category (JavaScript, Python, etc.)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True, help_text='Icon key (e.g., react, python, javascript)')
    order = models.PositiveIntegerField(default=0)
    total_levels = models.PositiveIntegerField(default=15)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'topics'
        ordering = ['order', 'name']
        unique_together = ['category', 'slug']
    
    def __str__(self):
        return f"{self.category.name} - {self.name}"


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
