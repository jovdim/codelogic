"""
Enhanced Admin Configuration for CodeLogic Accounts.
Manage users and gamification settings.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.http import HttpResponseRedirect
from django.utils import timezone
from django.utils.html import format_html
from django.contrib import messages
from django.db.models import Sum
from .models import User
from game.admin import UserCertificateInline, _user_quiz_history_html

# Hide Django's default "Groups" admin - we don't use permission groups,
# only is_staff / is_superuser flags. Decluttering the sidebar.
admin.site.unregister(Group)

# Hide SimpleJWT's "Token Blacklist" admin section - the app stays
# INSTALLED (it's used to blacklist refresh tokens on logout/rotation,
# per SIMPLE_JWT['BLACKLIST_AFTER_ROTATION']=True), we just don't need
# to manage the tokens through the admin UI.
try:
    from rest_framework_simplejwt.token_blacklist.models import (
        OutstandingToken, BlacklistedToken,
    )
    admin.site.unregister(OutstandingToken)
    admin.site.unregister(BlacklistedToken)
except Exception:
    # If the models aren't registered (older simplejwt), skip silently.
    pass


# ============================================================
# USER ADMIN - Manage all users
# ============================================================

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    change_form_template = 'admin/accounts/user/change_form.html'
    # Custom card-grid layout instead of the default Django admin table.
    # The template extends admin/change_list.html so search / filters /
    # pagination / bulk-actions all keep working - we only override how
    # individual rows render.
    change_list_template = 'admin/accounts/user/change_list.html'
    list_display = ['email', 'username', 'display_name', 'level_badge', 'xp', 'hearts_display', 'streak_display', 'is_email_verified', 'active_badge', 'date_joined']
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
        ('Login face verification', {
            'fields': ('login_face_display',),
            'description': 'Every face snapshot captured after this user logged in - newest first.',
        }),
        # Per-user stacked quiz history: each attempt is a section with the
        # start-of-quiz verification photo + all in-quiz monitor snapshots
        # + score / completion / timestamp. Easier to scan one user's full
        # activity than clicking into each attempt separately.
        ('Quiz activity', {
            'fields': ('quiz_history',),
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )

    readonly_fields = ['date_joined', 'last_active', 'quiz_history', 'login_face_display']

    inlines = [UserCertificateInline]

    def save_model(self, request, obj, form, change):
        # Auto-verify users created through the admin. An admin adding a
        # user is vouching for the account, so requiring them to also
        # tick `is_email_verified` (or run the bulk action) is a footgun -
        # the user can't log in until they do, and the error message
        # ("Please verify your email") points to a flow that doesn't apply.
        # `change` is False on add, True on edit; on edit we leave the
        # checkbox alone so admins keep full control.
        if not change:
            obj.is_email_verified = True
        super().save_model(request, obj, form, change)

    def quiz_history(self, obj):
        return _user_quiz_history_html(obj)
    quiz_history.short_description = 'Quiz attempts (verification photo + monitor snapshots)'

    def login_face_display(self, obj):
        """Render the FULL login-face history as a responsive grid.

        Pulls from LoginFaceSnapshot (one row per login). Newest first.
        For very heavy accounts we cap the rendered list at 60 and show
        a "+N earlier captures" footer so the page stays snappy. The
        legacy single-field snapshot on User is shown as a fallback for
        rows that only exist from before the history table was added.
        """
        import base64
        from django.db import OperationalError, ProgrammingError

        # Defensive: if the login_face_snapshots table doesn't exist yet
        # (e.g. someone deployed before running `manage.py migrate`), we
        # still want the User edit page to load instead of throwing 500.
        try:
            snapshots = list(
                obj.login_face_snapshots.only('photo', 'captured_at')[:60]
            )
            total = obj.login_face_snapshots.count()
        except (OperationalError, ProgrammingError):
            return format_html(
                '<em style="color:#f87171">Login snapshot table is missing — '
                'run <code>python manage.py migrate</code> on the server.</em>'
            )

        # Backwards-compat: if no history rows yet but the user has the
        # legacy single snapshot, show that one.
        if not snapshots and obj.last_login_face_photo:
            b64 = base64.b64encode(bytes(obj.last_login_face_photo)).decode('ascii')
            captured = (
                timezone.localtime(obj.last_login_face_captured_at).strftime('%Y-%m-%d %H:%M:%S')
                if obj.last_login_face_captured_at else 'unknown'
            )
            return format_html(
                '<div style="display:inline-block">'
                '<img src="data:image/jpeg;base64,{}" '
                'style="max-width:200px;border:1px solid #2d2d44;border-radius:6px;display:block"/>'
                '<div style="font-size:11px;color:#9ca3af;margin-top:4px">{}</div>'
                '<div style="font-size:10px;color:#6b7280;margin-top:2px">(legacy single snapshot)</div>'
                '</div>',
                b64, captured,
            )

        if not snapshots:
            return format_html(
                '<em style="color:#9ca3af">No login face snapshots recorded yet.</em>'
            )

        tiles = []
        for i, snap in enumerate(snapshots, start=1):
            b64 = base64.b64encode(bytes(snap.photo)).decode('ascii')
            when = timezone.localtime(snap.captured_at).strftime('%Y-%m-%d %H:%M:%S')
            # Latest snapshot gets a "Latest" pill to make scanning easier.
            latest_pill = (
                '<span style="display:inline-block;padding:1px 6px;border-radius:999px;'
                'background:rgba(124,58,237,0.20);color:#a78bfa;border:1px solid rgba(124,58,237,0.40);'
                'font-size:9px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;margin-left:6px">Latest</span>'
                if i == 1 else ''
            )
            tiles.append(format_html(
                '<div style="background:#1a1a2e;border:1px solid #2d2d44;border-radius:8px;padding:8px;width:200px">'
                '<img src="data:image/jpeg;base64,{}" '
                'style="width:100%;height:auto;border-radius:6px;display:block"/>'
                '<div style="font-size:11px;color:#cbd5e1;margin-top:6px;display:flex;align-items:center">'
                '#{}{}</div>'
                '<div style="font-size:10px;color:#9ca3af;margin-top:2px;font-family:Consolas,monospace">{}</div>'
                '</div>',
                b64, total - i + 1, format_html(latest_pill), when,
            ))

        from django.utils.safestring import mark_safe
        grid_inner = mark_safe(''.join(tiles))
        footer = mark_safe('')
        if total > len(snapshots):
            footer = format_html(
                '<div style="color:#9ca3af;font-size:12px;margin-top:10px;'
                'padding:8px 12px;background:#1a1a2e;border:1px dashed #2d2d44;border-radius:6px">'
                '+ {} earlier capture{} not shown</div>',
                total - len(snapshots), 's' if (total - len(snapshots)) != 1 else '',
            )

        return format_html(
            '<div style="display:flex;flex-wrap:wrap;gap:12px">{}</div>{}',
            grid_inner, footer,
        )
    login_face_display.short_description = 'Login face snapshots (newest first)'

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
            return f"{obj.current_streak} {'day' if obj.current_streak == 1 else 'days'}"
        return "0 days"
    streak_display.short_description = 'Streak'

    def active_badge(self, obj):
        """Coloured pill version of is_active. Easier to scan than the
        default boolean tick column."""
        if obj.is_active:
            return format_html(
                '<span style="background:#22c55e;color:white;padding:2px 10px;'
                'border-radius:12px;font-weight:600;font-size:11px">ACTIVE</span>'
            )
        return format_html(
            '<span style="background:#ef4444;color:white;padding:2px 10px;'
            'border-radius:12px;font-weight:600;font-size:11px">DISABLED</span>'
        )
    active_badge.short_description = 'Status'

    def response_change(self, request, obj):
        """
        Handle the Enable/Disable button from the change_form template
        (sends a POST with the _toggle_active hidden field). Toggle
        is_active, save, flash a message, redirect back to the same page.
        """
        if '_toggle_active' in request.POST:
            obj.is_active = not obj.is_active
            obj.save(update_fields=['is_active'])
            verb = 'enabled' if obj.is_active else 'disabled'
            self.message_user(
                request,
                f'User {obj.email} has been {verb}.',
                messages.SUCCESS if obj.is_active else messages.WARNING,
            )
            return HttpResponseRedirect(request.path)
        return super().response_change(request, obj)
    
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
