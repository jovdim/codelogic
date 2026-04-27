"""
Enhanced Admin Configuration for CodeLogic Game Module.
Provides a powerful, user-friendly admin interface for non-developers.
"""

from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.html import format_html
from django.db import models
from django.db.models import Count, Avg
from django.contrib import messages
from django import forms

import base64

from .models import Category, Topic, Question, LearningResource, Certificate, UserCertificate, Lesson, QuizAttempt
from .models_settings import SiteSettings


# ============================================================
# Helpers
# ============================================================

def _photo_thumbnail(photo_bytes, size_px=64):
    """
    Render an inline thumbnail of a verification photo for the admin.
    Bytes are JPEG; we embed them as a data URI so no extra request is needed.
    """
    if not photo_bytes:
        return format_html('<span style="color:#9ca3af">no photo</span>')
    b64 = base64.b64encode(bytes(photo_bytes)).decode('ascii')
    return format_html(
        '<img src="data:image/jpeg;base64,{}" '
        'style="width:{}px;height:{}px;object-fit:cover;border-radius:6px;'
        'transform:scaleX(-1);box-shadow:0 1px 3px rgba(0,0,0,0.2)" />',
        b64, size_px, size_px,
    )


# ============================================================
# QUIZ ATTEMPT ADMIN - browse all attempts + their face photos
# ============================================================

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['photo_thumb', 'user', 'topic', 'level', 'score_display', 'stars', 'completed', 'verification_captured_at']
    list_select_related = ['user', 'topic', 'topic__category']
    list_filter = ['completed', 'passed', 'topic__category', 'level']
    search_fields = ['user__email', 'user__username', 'topic__name']
    ordering = ['-verification_captured_at', '-started_at']
    list_per_page = 30
    readonly_fields = [
        'id', 'user', 'topic', 'level',
        'score', 'total_questions', 'stars', 'xp_earned', 'hearts_lost',
        'completed', 'passed', 'started_at', 'completed_at',
        'verification_captured_at', 'photo_full',
    ]
    fields = readonly_fields  # everything is read-only; nothing to edit

    def photo_thumb(self, obj):
        return _photo_thumbnail(obj.verification_photo, size_px=56)
    photo_thumb.short_description = 'Photo'

    def photo_full(self, obj):
        return _photo_thumbnail(obj.verification_photo, size_px=240)
    photo_full.short_description = 'Verification photo'

    def score_display(self, obj):
        if not obj.completed:
            return format_html('<span style="color:#9ca3af">in progress</span>')
        return f'{obj.score}/{obj.total_questions}'
    score_display.short_description = 'Score'

    def has_add_permission(self, request):
        return False  # attempts are created by the quiz flow only

    def has_change_permission(self, request, obj=None):
        return False  # never editable

    def has_delete_permission(self, request, obj=None):
        # Allow delete in case staff needs to wipe a sensitive photo manually.
        return super().has_delete_permission(request, obj)


class QuizAttemptInline(admin.TabularInline):
    """
    Read-only inline of a user's recent quiz attempts, shown on the User
    admin detail page. Each row includes the verification photo thumbnail
    so you can scan a user's history at a glance.
    """
    model = QuizAttempt
    fk_name = 'user'
    extra = 0
    can_delete = False
    show_change_link = True
    verbose_name_plural = 'Recent quiz attempts (with verification photos)'
    fields = ['photo_thumb', 'topic', 'level', 'score_display', 'stars', 'completed', 'verification_captured_at']
    readonly_fields = fields
    ordering = ['-verification_captured_at', '-started_at']

    def photo_thumb(self, obj):
        return _photo_thumbnail(obj.verification_photo, size_px=56)
    photo_thumb.short_description = 'Photo'

    def score_display(self, obj):
        if not obj.completed:
            return format_html('<span style="color:#9ca3af">in progress</span>')
        return f'{obj.score}/{obj.total_questions}'
    score_display.short_description = 'Score'

    def has_add_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related('topic')
        return qs.order_by('-verification_captured_at', '-started_at')


# ============================================================
# SITE SETTINGS ADMIN (Singleton - ONE configuration for whole site)
# ============================================================

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ['site_name', 'maintenance_mode', 'registration_enabled', 'updated_at']
    
    fieldsets = (
        ('Site Branding', {
            'fields': ('site_name', 'site_tagline', 'site_description', 'contact_email'),
            'description': 'Basic site information displayed to users'
        }),
        ('Game Mechanics', {
            'fields': (
                ('max_hearts', 'heart_regen_minutes'),
                ('xp_per_correct_answer', 'xp_perfect_bonus'),
                ('question_time_limit', 'pass_percentage'),
                ('questions_per_quiz_min', 'questions_per_quiz_max'),
            ),
            'description': 'Configure hearts, XP, and quiz settings'
        }),
        ('Level System', {
            'fields': ('xp_per_level', 'max_topic_levels'),
            'description': 'How leveling works for users'
        }),
        ('Social Links', {
            'fields': ('github_url', 'twitter_url', 'discord_url', 'linkedin_url'),
            'classes': ('collapse',),
            'description': 'Social media links shown in footer'
        }),
        ('Feature Toggles', {
            'fields': (
                'maintenance_mode',
                'registration_enabled', 
                'email_verification_required',
                'leaderboard_enabled',
                'learning_resources_enabled',
            ),
            'description': 'Enable/disable major features'
        }),
    )
    
    def has_add_permission(self, request):
        # Only allow one instance (singleton pattern)
        return not SiteSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        return False


# ============================================================
# CATEGORY ADMIN
# ============================================================

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon_preview', 'topic_count', 'question_count', 'color_preview', 'order', 'is_active']
    list_filter = ['is_active']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['order', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['order', 'name']
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug', 'description')
        }),
        ('Display', {
            'fields': ('icon_file', 'color', 'order'),
            'description': 'Upload icon (SVG, PNG, etc.), set color (hex), and display order'
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    def icon_preview(self, obj):
        if obj.icon_file:
            return format_html('<img src="{}" width="24" height="24" style="object-fit: contain;" />', obj.icon_file.url)
        return "-"
    icon_preview.short_description = 'Icon'
    
    def topic_count(self, obj):
        count = obj.topics.count()
        return format_html('<span style="font-weight: bold;">{}</span>', count)
    topic_count.short_description = 'Topics'
    
    def question_count(self, obj):
        count = Question.objects.filter(topic__category=obj).count()
        return format_html('<span style="color: #666;">{}</span>', count)
    question_count.short_description = 'Questions'
    
    def color_preview(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 2px 12px; border-radius: 4px; color: white;">{}</span>',
            obj.color, obj.color
        )
    color_preview.short_description = 'Color'


# ============================================================
# TOPIC ADMIN
# ============================================================

class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 1
    fields = ['level', 'title', 'content', 'code_example', 'tip', 'order', 'is_active']
    show_change_link = True
    ordering = ['level', 'order']
    can_delete = True
    
    verbose_name_plural = "Lessons"
    
    formfield_overrides = {
        models.TextField: {'widget': forms.Textarea(attrs={'rows': 4, 'style': 'width: 95%;'})},
    }


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    fields = ['level', 'question_type', 'question_text', 'xp_reward', 'is_active']
    show_change_link = True  # This adds a link to open the full question edit page
    ordering = ['level', 'order']
    readonly_fields = []
    max_num = 0  # Don't allow adding from inline - use the button instead
    can_delete = False
    
    verbose_name_plural = "Existing Questions (view only - use button below to add new)"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('topic')
    
    def has_add_permission(self, request, obj=None):
        return False  # Disable inline add


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'slug', 'icon_preview', 'question_count', 'levels_with_questions', 'total_levels', 'is_active']
    list_filter = ['category', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active']
    search_fields = ['name', 'description']
    ordering = ['category', 'order', 'name']
    inlines = [LessonInline, QuestionInline]
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Display', {
            'fields': ('icon_file',),
            'description': 'Upload icon (SVG, PNG, etc.) - if not set, uses category icon'
        }),
        ('Settings', {
            'fields': ('total_levels', 'order'),
            'description': 'Number of levels and display order'
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
    def icon_preview(self, obj):
        if obj.icon_file:
            return format_html('<img src="{}" width="24" height="24" style="object-fit: contain;" />', obj.icon_file.url)
        elif obj.category.icon_file:
            return format_html('<img src="{}" width="24" height="24" style="object-fit: contain; opacity: 0.5;" title="Using category icon" />', obj.category.icon_file.url)
        return "-"
    icon_preview.short_description = 'Icon'
    
    def question_count(self, obj):
        count = obj.questions.count()
        active = obj.questions.filter(is_active=True).count()
        if count != active:
            return format_html('<span title="{} active">{} ({})</span>', active, count, active)
        return count
    question_count.short_description = 'Questions'
    
    def levels_with_questions(self, obj):
        levels = obj.questions.values('level').distinct().count()
        return format_html('{} / {}', levels, obj.total_levels)
    levels_with_questions.short_description = 'Levels Used'
    
    def change_view(self, request, object_id, form_url='', extra_context=None):
        extra_context = extra_context or {}
        extra_context['show_add_question_button'] = True
        extra_context['topic_id'] = object_id
        return super().change_view(request, object_id, form_url, extra_context=extra_context)


# ============================================================
# QUESTION ADMIN - Most Important!
# ============================================================

class QuestionAdminForm(forms.ModelForm):
    """Custom form with better widgets for question editing."""
    class Meta:
        model = Question
        fields = '__all__'
        widgets = {
            'question_text': forms.Textarea(attrs={'rows': 3, 'style': 'width: 100%;'}),
            'code_snippet': forms.Textarea(attrs={'rows': 8, 'style': 'width: 100%; font-family: monospace; background: #1e1e1e; color: #d4d4d4;'}),
            'explanation': forms.Textarea(attrs={'rows': 3, 'style': 'width: 100%;'}),
            'options': forms.Textarea(attrs={'rows': 6, 'style': 'width: 100%; font-family: monospace;', 'placeholder': '["Option 1", "Option 2", "Option 3", "Option 4"]'}),
        }


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    form = QuestionAdminForm
    list_display = ['short_question', 'topic', 'level', 'question_type_badge', 'options_count', 'correct_answer', 'xp_reward', 'is_active']
    list_filter = ['topic__category', 'topic', 'level', 'question_type', 'is_active']
    search_fields = ['question_text', 'code_snippet', 'explanation']
    list_editable = ['level', 'xp_reward', 'is_active']
    ordering = ['topic', 'level', 'order']
    list_per_page = 50
    
    # Bulk actions
    actions = ['make_active', 'make_inactive', 'duplicate_questions', 'increase_xp_10', 'decrease_xp_10']
    
    fieldsets = (
        ('Question', {
            'fields': ('topic', 'level', 'question_type', 'question_text'),
            'description': 'Basic question information'
        }),
        ('Code (Optional)', {
            'fields': ('code_snippet', 'highlight_line'),
            'classes': ('collapse',),
            'description': 'Add code for "Find Error" or "Output" questions'
        }),
        ('Answer Options', {
            'fields': ('options', 'correct_answer'),
            'description': 'Options as JSON array: ["A", "B", "C", "D"]. correct_answer is index (0=A, 1=B, 2=C, 3=D)'
        }),
        ('Explanation', {
            'fields': ('explanation',),
            'classes': ('collapse',),
            'description': 'Shown after answering - explain why the answer is correct'
        }),
        ('Settings', {
            'fields': ('xp_reward', 'order', 'is_active')
        }),
    )
    
    def get_changeform_initial_data(self, request):
        """Pre-fill topic when coming from topic page."""
        initial = super().get_changeform_initial_data(request)
        topic_id = request.GET.get('topic')
        if topic_id:
            initial['topic'] = topic_id
        return initial
    
    def response_add(self, request, obj, post_url_continue=None):
        """After adding, redirect back to topic if came from there."""
        if '_addanother' not in request.POST and '_continue' not in request.POST:
            topic_id = request.GET.get('topic')
            if topic_id:
                from django.urls import reverse
                from django.http import HttpResponseRedirect
                return HttpResponseRedirect(reverse('admin:game_topic_change', args=[topic_id]))
        return super().response_add(request, obj, post_url_continue)
    
    def short_question(self, obj):
        text = obj.question_text[:60] + '...' if len(obj.question_text) > 60 else obj.question_text
        return text
    short_question.short_description = 'Question'
    
    def question_type_badge(self, obj):
        colors = {
            'multiple-choice': '#22c55e',
            'find-error': '#ef4444',
            'output': '#f59e0b',
            'fill-blank': '#3b82f6',
        }
        color = colors.get(obj.question_type, '#666')
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px;">{}</span>',
            color, obj.get_question_type_display()
        )
    question_type_badge.short_description = 'Type'
    
    def options_count(self, obj):
        if obj.options:
            return len(obj.options)
        return 0
    options_count.short_description = 'Opts'
    
    @admin.action(description='Mark selected as Active')
    def make_active(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} questions marked as active.', messages.SUCCESS)
    
    @admin.action(description='Mark selected as Inactive')
    def make_inactive(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} questions marked as inactive.', messages.WARNING)
    
    @admin.action(description='Duplicate selected questions')
    def duplicate_questions(self, request, queryset):
        for question in queryset:
            question.pk = None
            question.question_text = f"[COPY] {question.question_text}"
            question.save()
        self.message_user(request, f'{queryset.count()} questions duplicated.', messages.SUCCESS)
    
    @admin.action(description='Increase XP by 10')
    def increase_xp_10(self, request, queryset):
        for q in queryset:
            q.xp_reward += 10
            q.save()
        self.message_user(request, f'{queryset.count()} questions XP increased.', messages.SUCCESS)
    
    @admin.action(description='Decrease XP by 10')
    def decrease_xp_10(self, request, queryset):
        for q in queryset:
            q.xp_reward = max(0, q.xp_reward - 10)
            q.save()
        self.message_user(request, f'{queryset.count()} questions XP decreased.', messages.SUCCESS)


# ============================================================
# LEARNING RESOURCE ADMIN
# ============================================================

@admin.register(LearningResource)
class LearningResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'language', 'category', 'pages', 'views', 'is_active', 'is_featured', 'thumbnail_preview']
    list_filter = ['category', 'language', 'is_active', 'is_featured']
    search_fields = ['title', 'description', 'language']
    prepopulated_fields = {'slug': ('title',)}
    list_editable = ['is_active', 'is_featured']
    readonly_fields = ['views', 'created_at', 'updated_at', 'thumbnail_preview_large']
    ordering = ['-is_featured', '-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'language')
        }),
        ('Classification', {
            'fields': ('category',)
        }),
        ('Files', {
            'fields': ('pdf_file', 'thumbnail', 'thumbnail_preview_large')
        }),
        ('Metadata', {
            'fields': ('pages', 'read_time', 'views')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def thumbnail_preview(self, obj):
        if obj and obj.pk and obj.thumbnail:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />', obj.thumbnail.url)
        return "No thumbnail"
    thumbnail_preview.short_description = 'Thumbnail'
    
    def thumbnail_preview_large(self, obj):
        if obj and obj.pk and obj.thumbnail:
            return format_html('<img src="{}" width="200" style="border-radius: 8px;" />', obj.thumbnail.url)
        return "No thumbnail uploaded"
    thumbnail_preview_large.short_description = 'Thumbnail Preview'


# ============================================================
# CERTIFICATE ADMIN
# ============================================================

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['topic', 'category_name', 'icon_preview', 'title_display', 'created_at']
    list_filter = ['topic__category']
    search_fields = ['topic__name', 'title', 'description']
    ordering = ['topic__category__order', 'topic__order']
    readonly_fields = ['created_at', 'updated_at', 'icon_preview_large']
    
    fieldsets = (
        ('Topic', {
            'fields': ('topic',),
            'description': 'Certificate is automatically created for each topic'
        }),
        ('Customization', {
            'fields': ('title', 'description'),
            'description': 'Optional: customize certificate text (defaults to topic name)'
        }),
        ('Icon', {
            'fields': ('icon_file', 'icon_preview_large'),
            'description': 'Optional: custom icon (defaults to topic icon → category icon)'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def category_name(self, obj):
        return obj.topic.category.name
    category_name.short_description = 'Category'
    
    def icon_preview(self, obj):
        icon_url = obj.icon_url
        if icon_url:
            return format_html('<img src="{}" width="24" height="24" style="object-fit: contain;" />', icon_url)
        return "-"
    icon_preview.short_description = 'Icon'
    
    def icon_preview_large(self, obj):
        icon_url = obj.icon_url
        if icon_url:
            source = "certificate" if obj.icon_file else ("topic" if obj.topic.icon_file else "category")
            return format_html('<img src="{}" width="48" height="48" style="object-fit: contain;" /><br><small>Using {} icon</small>', icon_url, source)
        return "No icon (will use default)"
    icon_preview_large.short_description = 'Icon Preview'
    
    def title_display(self, obj):
        return obj.get_title()
    title_display.short_description = 'Certificate Title'
    
    def has_add_permission(self, request):
        # Certificates are auto-created with topics
        return False


# ============================================================
# LESSON ADMIN
# ============================================================

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['short_title', 'topic', 'level', 'has_code', 'has_tip', 'order', 'is_active']
    list_filter = ['topic__category', 'topic', 'level', 'is_active']
    search_fields = ['title', 'content', 'code_example', 'tip']
    list_editable = ['level', 'order', 'is_active']
    ordering = ['topic', 'level', 'order']
    list_per_page = 50
    
    fieldsets = (
        ('Lesson', {
            'fields': ('topic', 'level', 'title', 'content'),
            'description': 'Basic lesson information'
        }),
        ('Code Example (Optional)', {
            'fields': ('code_example',),
            'classes': ('collapse',),
            'description': 'Add a code example to illustrate the concept'
        }),
        ('Tip (Optional)', {
            'fields': ('tip',),
            'classes': ('collapse',),
            'description': 'A quick tip or helpful note'
        }),
        ('Settings', {
            'fields': ('order', 'is_active')
        }),
    )
    
    def short_title(self, obj):
        text = obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
        return text
    short_title.short_description = 'Title'
    
    def has_code(self, obj):
        return bool(obj.code_example)
    has_code.boolean = True
    has_code.short_description = 'Code'
    
    def has_tip(self, obj):
        return bool(obj.tip)
    has_tip.boolean = True
    has_tip.short_description = 'Tip'
