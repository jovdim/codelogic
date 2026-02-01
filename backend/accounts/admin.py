"""
Enhanced Admin Configuration for CodeLogic Accounts.
Manage users, tokens, and gamification settings.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils import timezone
from django.contrib import messages
from django.db.models import Sum
from .models import User, EmailVerificationToken, PasswordResetToken


# ============================================================
# USER ADMIN - Manage all users
# ============================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'display_name', 'level_badge', 'xp', 'hearts_display', 'streak_display', 'is_email_verified', 'is_active', 'date_joined']
    list_filter = ['is_email_verified', 'is_active', 'is_staff', 'level', 'date_joined']
    search_fields = ['email', 'username', 'display_name']
    ordering = ['-date_joined']
    list_per_page = 50
    
    # Bulk actions
    actions = ['verify_email', 'reset_hearts', 'add_xp_100', 'add_xp_500', 'reset_xp', 'activate_users', 'deactivate_users']
    
    fieldsets = (
        ('Account', {'fields': ('email', 'username', 'password')}),
        ('Profile', {
            'fields': ('display_name', 'bio', 'avatar'),
            'description': 'Avatar is a number 1-5 for preset avatars'
        }),
        ('Gamification', {
            'fields': (
                ('xp', 'level'),
                ('current_hearts', 'max_hearts'),
                ('current_streak', 'longest_streak'),
            ),
            'description': 'Manage player stats - XP, hearts, and streaks'
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_email_verified', 'groups', 'user_permissions'),
            'classes': ('collapse',),
        }),
        ('Activity', {
            'fields': ('date_joined', 'last_active', 'last_activity_date'),
            'classes': ('collapse',),
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ['date_joined']
    
    def level_badge(self, obj):
        colors = {
            1: '#6b7280', 2: '#6b7280', 3: '#22c55e', 4: '#22c55e', 5: '#22c55e',
            6: '#3b82f6', 7: '#3b82f6', 8: '#3b82f6', 9: '#8b5cf6', 10: '#8b5cf6',
        }
        color = colors.get(obj.level, '#f59e0b')
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 10px; border-radius: 12px; font-weight: bold;">Lv.{}</span>',
            color, obj.level
        )
    level_badge.short_description = 'Level'
    
    def hearts_display(self, obj):
        return f"{obj.current_hearts}/{obj.max_hearts}"
    hearts_display.short_description = 'Hearts'
    
    def streak_display(self, obj):
        if obj.current_streak > 0:
            return f"{obj.current_streak} days"
        return "-"
    streak_display.short_description = 'Streak'
    
    @admin.action(description='Mark selected as Email Verified')
    def verify_email(self, request, queryset):
        count = queryset.update(is_email_verified=True)
        self.message_user(request, f'{count} users marked as email verified.', messages.SUCCESS)
    
    @admin.action(description='Reset hearts to max')
    def reset_hearts(self, request, queryset):
        for user in queryset:
            user.current_hearts = user.max_hearts
            user.save()
        self.message_user(request, f'{queryset.count()} users hearts reset to max.', messages.SUCCESS)
    
    @admin.action(description='Add 100 XP')
    def add_xp_100(self, request, queryset):
        for user in queryset:
            user.xp += 100
            user.save()
        self.message_user(request, f'{queryset.count()} users gained 100 XP.', messages.SUCCESS)
    
    @admin.action(description='Add 500 XP')
    def add_xp_500(self, request, queryset):
        for user in queryset:
            user.xp += 500
            user.save()
        self.message_user(request, f'{queryset.count()} users gained 500 XP.', messages.SUCCESS)
    
    @admin.action(description='Reset XP to 0')
    def reset_xp(self, request, queryset):
        count = queryset.update(xp=0, level=1)
        self.message_user(request, f'{count} users XP reset to 0.', messages.WARNING)
    
    @admin.action(description='Activate users')
    def activate_users(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} users activated.', messages.SUCCESS)
    
    @admin.action(description='Deactivate users')
    def deactivate_users(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} users deactivated.', messages.WARNING)


# ============================================================
# TOKEN ADMIN - Manage verification tokens
# ============================================================

@admin.register(EmailVerificationToken)
class EmailVerificationTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'expires_at', 'is_used', 'is_expired_badge']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['token', 'created_at']
    ordering = ['-created_at']
    
    def is_expired_badge(self, obj):
        from django.utils.safestring import mark_safe
        if obj.expires_at < timezone.now():
            return mark_safe('<span style="color: #ef4444;">Expired</span>')
        return mark_safe('<span style="color: #22c55e;">Valid</span>')
    is_expired_badge.short_description = 'Status'


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'expires_at', 'is_used', 'is_expired_badge']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['token', 'created_at']
    ordering = ['-created_at']
    
    def is_expired_badge(self, obj):
        from django.utils.safestring import mark_safe
        if obj.expires_at < timezone.now():
            return mark_safe('<span style="color: #ef4444;">Expired</span>')
        return mark_safe('<span style="color: #22c55e;">Valid</span>')
    is_expired_badge.short_description = 'Status'
