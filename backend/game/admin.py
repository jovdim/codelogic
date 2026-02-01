"""
Enhanced Admin Configuration for CodeLogic Game Module.
Provides a powerful, user-friendly admin interface for non-developers.
"""

from django.contrib import admin
from django.contrib.admin import AdminSite
from django.utils.html import format_html
from django.db.models import Count, Avg
from django.contrib import messages
from django import forms

from .models import Category, Topic, Question, LearningResource
from .models_settings import SiteSettings


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
    list_display = ['name', 'slug', 'topic_count', 'question_count', 'color_preview', 'order', 'is_active']
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
            'fields': ('icon', 'color', 'order'),
            'description': 'Icon class, color (hex), and display order'
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
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

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    fields = ['level', 'question_type', 'question_text', 'xp_reward', 'is_active']
    show_change_link = True
    ordering = ['level', 'order']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('topic')


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'slug', 'question_count', 'levels_with_questions', 'total_levels', 'is_active']
    list_filter = ['category', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['is_active']
    search_fields = ['name', 'description']
    ordering = ['category', 'order', 'name']
    inlines = [QuestionInline]
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug', 'category', 'description')
        }),
        ('Settings', {
            'fields': ('total_levels', 'order'),
            'description': 'Number of levels and display order'
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
    )
    
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
