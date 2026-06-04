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
from django.db.models import Sum, Q
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
    list_display = ['email', 'username', 'display_name', 'role_badge', 'year_level', 'section', 'department', 'level_badge', 'xp', 'is_email_verified', 'active_badge']
    list_filter = ['role', 'department', 'year_level', 'section', 'is_email_verified', 'is_active', 'is_staff', 'date_joined']
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
        ('Role & assignment', {
            'fields': ('role', 'department', 'year_level', 'section', 'teachers'),
            'description': (
                'Role drives where the user can log in: student plays the game, '
                'teacher uses /teacher/, admin uses Django admin. '
                'Teachers see only the students assigned to them via the "teachers" field on the student.'
            ),
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
        ('Identity reference', {
            'fields': ('base_face_photo_display',),
            'description': 'Reference photo the teacher uploaded at student-create time. Used to visually verify the login snapshots below are really this user.',
        }),
        ('Login face verification', {
            'fields': ('login_face_display',),
            'description': 'Every face snapshot captured after this user logged in - newest first. Compare against the reference photo above.',
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
            'fields': (
                'email', 'username', 'password1', 'password2',
                'role', 'department', 'year_level', 'section',
            ),
        }),
    )

    readonly_fields = ['date_joined', 'last_active', 'quiz_history', 'login_face_display', 'base_face_photo_display']

    inlines = [UserCertificateInline]

    def formfield_for_dbfield(self, db_field, request, **kwargs):
        """Render `year_level` as a dropdown with the 4 standard year options.

        The model field has `choices=YEAR_LEVEL_CHOICES` so that
        `user.get_year_level_display()` returns "2nd Year" (used in the
        teacher portal pills + templates). But choices on a model field
        triggers ChoiceField-level form validation, which would reject
        the custom 5+ integer the JS "Other..." widget can post.

        We override here to return a plain IntegerField (no choices
        validation) bound to a Select widget that still displays the
        standard 4 labels. Result: dropdown UI for the normal cases,
        custom-integer support for the edge cases.
        """
        if db_field.name == 'year_level':
            from django import forms
            return forms.IntegerField(
                required=False,
                min_value=1,
                label=db_field.verbose_name.capitalize(),
                help_text=db_field.help_text,
                widget=forms.Select(
                    choices=[('', '----------')] + list(User.YEAR_LEVEL_CHOICES),
                ),
            )
        return super().formfield_for_dbfield(db_field, request, **kwargs)

    def get_urls(self):
        """Add a CSV bulk-import endpoint at /admin/accounts/user/import-csv/."""
        from django.urls import path
        urls = super().get_urls()
        custom = [
            path(
                'import-csv/',
                self.admin_site.admin_view(self.import_csv_view),
                name='accounts_user_import_csv',
            ),
        ]
        return custom + urls

    def import_csv_view(self, request):
        """
        Bulk-create users from a CSV upload. Header row required.

        Recognized columns (case-insensitive, any subset):
            email (required), username (required), password (required),
            role (student|teacher|admin, default student),
            display_name, year_level (1-4), section, department.

        Each row becomes one User. Duplicates (existing email/username)
        are SKIPPED with a row-level message. Rows missing email/
        username/password are reported and skipped. Successes get
        is_email_verified=True (admin-vouched).
        """
        from django.contrib.admin.views.decorators import staff_member_required
        from django.shortcuts import render, redirect
        from django.contrib import messages
        from django.urls import reverse
        from django.db import IntegrityError, transaction
        from django.contrib.auth.password_validation import validate_password
        from django.core.exceptions import ValidationError
        import csv
        import io

        # Cap at 5 MB. A "users.csv" of 5 MB is already ~50k rows; an
        # operator wanting more should split the file. This is the
        # cheapest way to neutralize the OOM angle.
        MAX_CSV_BYTES = 5 * 1024 * 1024

        if not request.user.is_superuser:
            self.message_user(
                request,
                'Only the superadmin can bulk-import users.',
                level=messages.ERROR,
            )
            return redirect(reverse('admin:accounts_user_changelist'))

        report = None
        if request.method == 'POST' and request.FILES.get('csv_file'):
            upload = request.FILES['csv_file']
            if getattr(upload, 'size', 0) and upload.size > MAX_CSV_BYTES:
                self.message_user(
                    request,
                    f'CSV is too large ({upload.size} bytes). Limit is {MAX_CSV_BYTES} bytes.',
                    level=messages.ERROR,
                )
                return redirect(request.path)
            try:
                raw_bytes = upload.read(MAX_CSV_BYTES + 1)
                if len(raw_bytes) > MAX_CSV_BYTES:
                    self.message_user(
                        request,
                        'CSV exceeds the 5 MB upload cap. Split the file and re-upload.',
                        level=messages.ERROR,
                    )
                    return redirect(request.path)
                # Sniff a UTF-16 BOM so Excel "Unicode" exports work.
                if raw_bytes.startswith(b'\xff\xfe'):
                    raw = raw_bytes.decode('utf-16-le').lstrip('﻿')
                elif raw_bytes.startswith(b'\xfe\xff'):
                    raw = raw_bytes.decode('utf-16-be').lstrip('﻿')
                else:
                    raw = raw_bytes.decode('utf-8-sig')
            except UnicodeDecodeError:
                self.message_user(
                    request,
                    'Could not decode CSV. Please re-save as UTF-8 (or UTF-16) and re-upload.',
                    level=messages.ERROR,
                )
                return redirect(request.path)

            reader = csv.DictReader(io.StringIO(raw))
            if not reader.fieldnames:
                self.message_user(
                    request, 'CSV looks empty (no header row).',
                    level=messages.ERROR,
                )
                return redirect(request.path)

            # Detect duplicate / ambiguous headers BEFORE normalization
            # so the operator gets a clear error instead of silent data
            # loss (the last duplicate wins in dict).
            normalized = [(k.lower().strip(), k) for k in reader.fieldnames if k]
            seen_norm = {}
            duplicate_headers = []
            for norm, original in normalized:
                if norm in seen_norm:
                    duplicate_headers.append(norm)
                else:
                    seen_norm[norm] = original
            if duplicate_headers:
                self.message_user(
                    request,
                    'Duplicate or ambiguous column headers (case-insensitive): '
                    + ', '.join(sorted(set(duplicate_headers))),
                    level=messages.ERROR,
                )
                return redirect(request.path)
            field_map = seen_norm

            def cell(row, key):
                src = field_map.get(key)
                if src is None:
                    return ''
                return (row.get(src) or '').strip()

            created = []
            skipped = []
            errors = []
            for i, row in enumerate(reader, start=2):  # row 1 = header
                email = cell(row, 'email').lower()
                username = cell(row, 'username')
                password = cell(row, 'password')
                if not email or not username or not password:
                    errors.append(f'Row {i}: missing required email / username / password')
                    continue
                if User.objects.filter(email__iexact=email).exists():
                    skipped.append(f'Row {i}: {email} already exists')
                    continue
                if User.objects.filter(username__iexact=username).exists():
                    skipped.append(f'Row {i}: username "{username}" already taken')
                    continue

                role_raw = cell(row, 'role').lower() or User.ROLE_STUDENT
                if role_raw not in {User.ROLE_STUDENT, User.ROLE_TEACHER, User.ROLE_ADMIN}:
                    errors.append(f'Row {i}: invalid role "{role_raw}"')
                    continue

                yl_raw = cell(row, 'year_level')
                year_level = None
                if yl_raw:
                    try:
                        year_level = int(yl_raw)
                        if year_level not in {1, 2, 3, 4}:
                            errors.append(f'Row {i}: year_level "{yl_raw}" out of range 1-4')
                            continue
                    except ValueError:
                        errors.append(f'Row {i}: year_level "{yl_raw}" is not a number')
                        continue

                # Apply Django's password validators - StrongPasswordValidator
                # etc. - same as the public signup flow does. Without this,
                # a CSV import could create users with `a` as the password.
                try:
                    validate_password(password, user=User(email=email, username=username))
                except ValidationError as e:
                    errors.append(f'Row {i}: weak password ({"; ".join(e.messages)})')
                    continue

                # Optional `teachers` column: pipe- or comma-separated list
                # of teacher emails / usernames. Resolved here so the
                # student lands on the right teacher's portal immediately.
                teacher_idents = []
                teachers_cell = cell(row, 'teachers')
                if teachers_cell:
                    for tok in teachers_cell.replace('|', ',').split(','):
                        tok = tok.strip().lower()
                        if tok:
                            teacher_idents.append(tok)

                try:
                    with transaction.atomic():
                        u = User.objects.create_user(
                            email=email,
                            username=username,
                            password=password,
                            display_name=cell(row, 'display_name'),
                            role=role_raw,
                            year_level=year_level,
                            section=cell(row, 'section'),
                            department=cell(row, 'department'),
                            is_email_verified=True,
                        )
                        # Teachers need is_staff=True to use /admin/login/.
                        if u.role == User.ROLE_TEACHER:
                            u.is_staff = True
                            u.save(update_fields=['is_staff'])
                except IntegrityError:
                    # TOCTOU: another concurrent import beat us to the
                    # unique constraint. Treat as a duplicate skip.
                    skipped.append(f'Row {i}: {email} appeared concurrently')
                    continue
                except Exception:  # noqa: BLE001 - generic + continue (no DB payload in msg)
                    errors.append(f'Row {i}: import failed')
                    continue

                # Resolve + assign teachers OUTSIDE the create transaction
                # so a bad teacher identifier doesn't roll back the user.
                # Only meaningful for student rows; teachers don't have
                # other teachers.
                if teacher_idents and u.role == User.ROLE_STUDENT:
                    lowered = [t.lower() for t in teacher_idents]
                    matched = User.objects.filter(
                        role=User.ROLE_TEACHER,
                    ).filter(
                        Q(email__in=lowered) | Q(username__in=lowered)
                    )
                    for t in matched:
                        u.teachers.add(t)
                created.append(email)

            report = {
                'created_count': len(created),
                'skipped_count': len(skipped),
                'error_count': len(errors),
                'created': created[:50],
                'skipped': skipped[:50],
                'errors': errors[:50],
                'total': len(created) + len(skipped) + len(errors),
            }
            if created:
                self.message_user(
                    request,
                    f'Imported {len(created)} user{"s" if len(created) != 1 else ""}.',
                    level=messages.SUCCESS,
                )
            if skipped:
                self.message_user(
                    request,
                    f'Skipped {len(skipped)} duplicate row{"s" if len(skipped) != 1 else ""}.',
                    level=messages.WARNING,
                )
            if errors:
                self.message_user(
                    request,
                    f'{len(errors)} row{"s" if len(errors) != 1 else ""} failed - see report.',
                    level=messages.ERROR,
                )

        ctx = {
            **self.admin_site.each_context(request),
            'title': 'Bulk import users',
            'opts': self.model._meta,
            'report': report,
        }
        return render(request, 'admin/accounts/user/import_csv.html', ctx)

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
        # Teachers log in through /admin/login/ (unified UI). The admin
        # login form requires is_staff=True, so flip it on automatically
        # for teacher accounts. They still can't open Django admin model
        # pages (no model-level perms) - and our admin_dashboard view
        # immediately redirects them to /teacher/ anyway.
        # We also flip is_staff back OFF when a teacher is demoted to a
        # student role; otherwise the LeaderboardView filter (is_staff
        # =False) silently keeps them off the board forever.
        if not obj.is_superuser:
            if obj.role == User.ROLE_TEACHER:
                obj.is_staff = True
            elif obj.role == User.ROLE_STUDENT:
                obj.is_staff = False
        super().save_model(request, obj, form, change)

    def quiz_history(self, obj):
        return _user_quiz_history_html(obj)
    quiz_history.short_description = 'Quiz attempts (verification photo + monitor snapshots)'

    def base_face_photo_display(self, obj):
        """Render the teacher-uploaded reference photo on the user-edit
        page so the admin can eyeball-compare it to login snapshots."""
        import base64
        if not obj.base_face_photo:
            return format_html(
                '<em style="color:#9ca3af">No reference photo on file. '
                'A teacher should add one at /teacher/student/{}/edit/.</em>',
                obj.pk,
            )
        b64 = base64.b64encode(bytes(obj.base_face_photo)).decode('ascii')
        when = (
            timezone.localtime(obj.base_face_photo_at).strftime('%b %d, %Y %I:%M %p')
            if obj.base_face_photo_at else 'unknown'
        )
        return format_html(
            '<div style="display:inline-block">'
            '<img src="data:image/jpeg;base64,{}" '
            'style="width:220px;height:220px;object-fit:cover;border-radius:10px;'
            'border:1px solid #2d2d44;display:block"/>'
            '<div style="font-size:11px;color:#9ca3af;margin-top:4px">Taken {}</div>'
            '</div>',
            b64, when,
        )
    base_face_photo_display.short_description = 'Reference photo'

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
                '<em style="color:#f87171">Login snapshot table is missing - '
                'run <code>python manage.py migrate</code> on the server.</em>'
            )

        # Backwards-compat: if no history rows yet but the user has the
        # legacy single snapshot, show that one.
        if not snapshots and obj.last_login_face_photo:
            b64 = base64.b64encode(bytes(obj.last_login_face_photo)).decode('ascii')
            captured = (
                timezone.localtime(obj.last_login_face_captured_at).strftime('%b %d, %Y %I:%M:%S %p')
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

        def _ago(dt):
            """Render a short, human relative time like '5m ago' / '2h ago'."""
            secs = int((timezone.now() - dt).total_seconds())
            if secs < 0:  # clock skew between request server and snapshot server
                return 'in the future?'
            if secs < 60:
                return f'{secs}s ago'
            if secs < 3600:
                return f'{secs // 60}m ago'
            if secs < 86400:
                return f'{secs // 3600}h ago'
            return f'{secs // 86400}d ago'

        tiles = []
        for i, snap in enumerate(snapshots, start=1):
            b64 = base64.b64encode(bytes(snap.photo)).decode('ascii')
            when = timezone.localtime(snap.captured_at).strftime('%b %d, %Y %I:%M:%S %p')
            ago = _ago(snap.captured_at)
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
                '<div style="font-size:10px;color:#a78bfa;margin-top:1px;font-weight:600">{}</div>'
                '</div>',
                b64, total - i + 1, format_html(latest_pill), when, ago,
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

    def role_badge(self, obj):
        """Pill version of the role field, easier to scan in the user list."""
        role = obj.role or 'student'
        if obj.is_superuser:
            role = 'admin'
        colors = {
            'student': '#3b82f6',
            'teacher': '#10b981',
            'admin': '#f59e0b',
        }
        color = colors.get(role, '#6b7280')
        return format_html(
            '<span style="background:{};color:white;padding:2px 10px;'
            'border-radius:12px;font-weight:600;font-size:11px;'
            'text-transform:uppercase;letter-spacing:0.4px">{}</span>',
            color, role,
        )
    role_badge.short_description = 'Role'
    role_badge.admin_order_field = 'role'

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
