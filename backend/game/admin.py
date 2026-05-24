"""
Enhanced Admin Configuration for CodeLogic Game Module.
Provides a powerful, user-friendly admin interface for non-developers.
"""

from django.contrib import admin
from django.contrib.admin import AdminSite
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html
from django.db import models
from django.db.models import Count, Avg
from django.contrib import messages
from django import forms

from .models import Category, Topic, Question, LearningResource, Certificate, UserCertificate, Lesson
from .models_settings import SiteSettings


# ============================================================
# Helpers
# ============================================================

# ============================================================
# Per-user quiz history (shown on User admin detail page)
# ============================================================

def _user_quiz_history_html(user):
    """
    Per-user "Quiz activity" report shown on the User admin detail page.
    Each quiz attempt becomes a stacked card with topic, level, score,
    duration, and timestamp. (Face verification and in-quiz monitor
    snapshots have been removed from the system.)
    """
    attempts = (
        user.quiz_attempts
        .select_related('topic')
        .order_by('-started_at')[:20]
    )
    if not attempts:
        return format_html(
            '<em style="color:#9ca3af">No quiz attempts yet.</em>'
        )

    cards = []
    for a in attempts:
        if a.completed:
            status = format_html(
                '<span style="color:#22c55e;font-weight:600">{}/{}</span> · '
                '<span style="color:#fbbf24">{}★</span>',
                a.score, a.total_questions, a.stars,
            )
        else:
            status = format_html('<span style="color:#9ca3af">in progress</span>')

        # `started_at` is stored as UTC. Convert to the configured TIME_ZONE
        # (Asia/Manila) before formatting, otherwise the admin shows times
        # offset by 8 hours.
        when_str = (
            timezone.localtime(a.started_at).strftime('%b %d, %Y %I:%M %p')
            if a.started_at else '-'
        )

        # Duration from start-click to result-screen.
        if a.completed and a.started_at and a.completed_at:
            secs = int((a.completed_at - a.started_at).total_seconds())
            if secs >= 3600:
                duration_str = f'{secs // 3600}h {(secs % 3600) // 60}m {secs % 60}s'
            elif secs >= 60:
                duration_str = f'{secs // 60}m {secs % 60}s'
            else:
                duration_str = f'{secs}s'
            duration_html = format_html(
                ' · <span style="color:#a78bfa">⏱ {}</span>', duration_str,
            )
        else:
            duration_html = format_html('')

        cards.append(format_html(
            '<div style="margin-bottom:12px;border:1px solid #2d2d44;'
            'border-radius:12px;overflow:hidden;background:#0f0f1a">'
            '<div style="padding:12px 16px;background:rgba(124,58,237,0.10)">'
            '<div style="font-size:14px;font-weight:700;color:#fff">{} - Level {}</div>'
            '<div style="font-size:12px;color:#cbd5e1;margin-top:4px">{} · {}{}</div>'
            '</div></div>',
            a.topic.name, a.level, status, when_str, duration_html,
        ))

    return format_html('{}' * len(cards), *cards)


# ============================================================
# USER CERTIFICATE ADMIN - browse earned certs + view / print them
#
# NOT REGISTERED with the admin site: in production no UserCertificate
# rows are ever created (CompleteQuizView doesn't persist them - the
# frontend /certificates page computes eligibility on the fly from
# UserProgress). Listing an always-empty page in the sidebar was
# confusing, so we hide it. The class is kept (and `UserCertificateInline`
# below still works on the User admin) so re-enabling is a one-line change
# if the awarding logic is ever wired up.
# ============================================================

# @admin.register(UserCertificate)  # re-enable if UserCertificate rows start being persisted
class UserCertificateAdmin(admin.ModelAdmin):
    list_display = ['user', 'topic_display', 'completion_date', 'total_stars', 'total_xp_earned', 'certificate_code', 'view_link']
    list_select_related = ['user', 'certificate', 'certificate__topic']
    list_filter = ['certificate__topic__category', 'completion_date']
    search_fields = ['user__email', 'user__username', 'certificate__topic__name', 'certificate_code']
    ordering = ['-completion_date']
    readonly_fields = [
        'id', 'user', 'certificate', 'topic_display',
        'total_stars', 'total_xp_earned',
        'completion_date', 'certificate_code', 'view_link',
    ]
    fields = readonly_fields

    def topic_display(self, obj):
        return obj.certificate.topic.name
    topic_display.short_description = 'Topic'

    def view_link(self, obj):
        url = reverse('admin-view-certificate', args=[obj.id])
        return format_html(
            '<a href="{}" target="_blank" rel="noopener" '
            'style="display:inline-block;padding:5px 12px;background:#7c3aed;color:white;'
            'border-radius:6px;font-weight:600;text-decoration:none">View Certificate</a>',
            url,
        )
    view_link.short_description = 'Certificate'

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


class UserCertificateInline(admin.TabularInline):
    """Read-only list of a user's earned certificates on the User admin page."""
    model = UserCertificate
    fk_name = 'user'
    extra = 0
    can_delete = False
    show_change_link = False
    verbose_name_plural = 'Earned certificates'
    fields = ['topic_display', 'completion_date', 'total_stars', 'total_xp_earned', 'certificate_code', 'view_link']
    readonly_fields = fields
    ordering = ['-completion_date']

    def topic_display(self, obj):
        return obj.certificate.topic.name
    topic_display.short_description = 'Topic'

    def view_link(self, obj):
        if not obj.pk:
            return ''
        url = reverse('admin-view-certificate', args=[obj.id])
        return format_html(
            '<a href="{}" target="_blank" rel="noopener" '
            'style="display:inline-block;padding:4px 10px;background:#7c3aed;color:white;'
            'border-radius:6px;font-weight:600;text-decoration:none;font-size:11px">View</a>',
            url,
        )
    view_link.short_description = 'Cert'

    def has_add_permission(self, request, obj=None):
        return False

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('certificate__topic')


# ============================================================
# SITE SETTINGS ADMIN (Singleton - ONE configuration for whole site)
#
# NOT REGISTERED with the admin site: all 31 fields are currently
# unused in code - game mechanics are hardcoded as Python constants
# in views.py (HEART_REGEN_MINUTES, XP_PER_CORRECT, etc.), feature
# flags are never checked, branding/social/announcement fields are
# not consumed by any API or frontend component. Listing a page of
# config knobs that don't do anything was confusing, so we hide it.
# Re-enable by uncommenting the decorator below once the fields are
# actually wired up.
# ============================================================

# @admin.register(SiteSettings)  # re-enable when SiteSettings fields are actually consumed
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
    change_list_template = 'admin/game/category/change_list.html'
    change_form_template = 'admin/game/category/change_form.html'
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
    # Custom card-list template (mirrors what we did for User).
    change_list_template = 'admin/game/topic/change_list.html'
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
            'correct_text_answer': forms.Textarea(attrs={'rows': 2, 'style': 'width: 100%; font-family: monospace;', 'placeholder': 'The exact text the user must type (whitespace + case are normalized)'}),
            'accepted_answers': forms.Textarea(attrs={'rows': 3, 'style': 'width: 100%; font-family: monospace;', 'placeholder': '["alternative1", "alternative2"]  (optional alt answers)'}),
        }

    def clean(self):
        cleaned = super().clean()
        qtype = cleaned.get('question_type')

        if qtype == 'multiple-choice':
            opts = cleaned.get('options') or []
            if not isinstance(opts, list) or len(opts) < 2:
                self.add_error('options', 'Multiple-choice questions need at least 2 options.')
            correct = cleaned.get('correct_answer')
            if isinstance(opts, list) and correct is not None and correct >= len(opts):
                self.add_error('correct_answer', f'correct_answer index {correct} is out of range for {len(opts)} options.')

        elif qtype == 'find-error':
            if not cleaned.get('code_snippet'):
                self.add_error('code_snippet', 'Find-the-Error questions need a code snippet.')
            if not cleaned.get('highlight_line'):
                self.add_error('highlight_line', 'Find-the-Error questions need highlight_line set to the 1-based line number of the bug - this is the answer the user clicks.')

        elif qtype in ('fill-blank', 'output'):
            if not (cleaned.get('correct_text_answer') or '').strip():
                self.add_error('correct_text_answer', f'{qtype.replace("-", " ").title()} questions need a correct_text_answer - the text the user must type.')
            accepted = cleaned.get('accepted_answers')
            if accepted and not isinstance(accepted, list):
                self.add_error('accepted_answers', 'accepted_answers must be a JSON list, e.g. ["foo", "bar"].')

        return cleaned


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    form = QuestionAdminForm
    # Dark card-list + hero change-form, mirroring User/Topic.
    change_list_template = 'admin/game/question/change_list.html'
    change_form_template = 'admin/game/question/change_form.html'
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
            'description': 'Basic question information. Pick the type - the fields below will adapt.'
        }),
        ('Code Snippet', {
            'fields': ('code_snippet', 'highlight_line'),
            'classes': ('cl-fs-code',),
            'description': 'Required for Find-the-Error. Recommended for Output / Fill-in-the-Blank. Optional for Multiple Choice. The "Highlight line" field only applies to Find-the-Error - it is the 1-based buggy line, which is also the line the user must click to answer.'
        }),
        ('Multiple-Choice Options', {
            'fields': ('options', 'correct_answer'),
            'classes': ('cl-fs-mc',),
            'description': 'For Multiple Choice ONLY. Options as JSON array: ["A", "B", "C", "D"]. correct_answer is the index (0=A, 1=B, 2=C, 3=D).'
        }),
        ('Typed Answer', {
            'fields': ('correct_text_answer', 'accepted_answers'),
            'classes': ('cl-fs-typed',),
            'description': 'For Fill-in-the-Blank and What-is-the-Output. The user must type their answer. Matching is whitespace-collapsed and case-insensitive. Use accepted_answers (JSON list) to allow variants like ["5", "five"].'
        }),
        ('Explanation', {
            'fields': ('explanation',),
            'classes': ('collapse',),
            'description': 'Shown after answering - explain why the answer is correct.'
        }),
        ('Settings', {
            'fields': ('xp_reward', 'order', 'is_active')
        }),
    )

    class Media:
        js = ('admin/codelogic-question-toggle.js',)
    
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
    change_list_template = 'admin/game/learningresource/change_list.html'
    change_form_template = 'admin/game/learningresource/change_form.html'
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

# Hidden from the admin sidebar on 2026-05-22 - the Certificate model is still
# read by the frontend cert pages (TopicWithProgressSerializer surfaces title +
# description, /certificates uses get_title fallback). To re-enable admin
# customization of per-topic cert title/description, just uncomment the
# @admin.register line below.
# @admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    change_list_template = 'admin/game/certificate/change_list.html'
    change_form_template = 'admin/game/certificate/change_form.html'
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
    change_list_template = 'admin/game/lesson/change_list.html'
    change_form_template = 'admin/game/lesson/change_form.html'
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
