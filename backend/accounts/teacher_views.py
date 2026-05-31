"""
Teacher portal views (server-rendered, separate from the game frontend
and the Django admin). Lives at /teacher/.

Flow:
- /teacher/login/                  -> redirect to /admin/login/?next=/teacher/
- /teacher/                        -> list of assigned students
- /teacher/student/new/            -> create a new student + assign to self
- /teacher/student/<uuid>/         -> student detail page (read-only stalk view)
- /teacher/student/<uuid>/edit/    -> edit student profile
- /teacher/student/<uuid>/delete/  -> POST: delete student
- /teacher/student/<uuid>/reset/   -> POST: trigger password reset email
- /teacher/logout/                 -> sign out

Unified login: teachers use /admin/login/ (same UI as the superadmin)
and get auto-redirected to /teacher/ after auth. is_staff is auto-set
to True for teachers (UserAdmin.save_model) so they pass admin's login
check; admin_dashboard bounces them away from the dashboard so they
never see Django admin model pages.
"""

import base64
from functools import wraps

from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import OperationalError, ProgrammingError
from django.http import HttpResponseForbidden
from django.shortcuts import redirect, render, get_object_or_404
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.views.decorators.http import require_http_methods

from .models import User, PasswordResetToken
from .views import send_password_reset_email


def _login_face_snapshots_html(student):
    """Render the student's login-face history as a grid of thumbnails.
    Same data the admin user-edit page shows. Caps at 30 to keep the
    teacher page snappy."""
    try:
        snaps = list(
            student.login_face_snapshots.only('photo', 'captured_at')[:30]
        )
        total = student.login_face_snapshots.count()
    except (OperationalError, ProgrammingError):
        return mark_safe(
            '<em style="color:#f87171">Login snapshot table is missing - '
            'run <code>manage.py migrate</code>.</em>'
        )

    # Backwards-compat: legacy single-snapshot field on the user.
    if not snaps and student.last_login_face_photo:
        b64 = base64.b64encode(bytes(student.last_login_face_photo)).decode('ascii')
        when = (
            timezone.localtime(student.last_login_face_captured_at)
            .strftime('%b %d, %Y %I:%M %p')
            if student.last_login_face_captured_at else 'unknown'
        )
        return format_html(
            '<div style="display:inline-block">'
            '<img src="data:image/jpeg;base64,{}" '
            'style="max-width:200px;border:1px solid #2d2d44;border-radius:6px;display:block"/>'
            '<div style="font-size:11px;color:#9ca3af;margin-top:4px">{}</div>'
            '<div style="font-size:10px;color:#6b7280;margin-top:2px">(legacy single snapshot)</div>'
            '</div>',
            b64, when,
        )

    if not snaps:
        return mark_safe(
            '<em style="color:#9ca3af">No login face snapshots yet.</em>'
        )

    def _ago(dt):
        secs = int((timezone.now() - dt).total_seconds())
        if secs < 0: return 'in the future?'
        if secs < 60: return f'{secs}s ago'
        if secs < 3600: return f'{secs // 60}m ago'
        if secs < 86400: return f'{secs // 3600}h ago'
        return f'{secs // 86400}d ago'

    tiles = []
    for i, snap in enumerate(snaps, start=1):
        b64 = base64.b64encode(bytes(snap.photo)).decode('ascii')
        when = timezone.localtime(snap.captured_at).strftime('%b %d, %Y %I:%M %p')
        latest_pill = (
            '<span style="display:inline-block;padding:1px 6px;border-radius:999px;'
            'background:rgba(124,58,237,0.20);color:#a78bfa;border:1px solid rgba(124,58,237,0.40);'
            'font-size:9px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;'
            'margin-left:6px">Latest</span>'
            if i == 1 else ''
        )
        tiles.append(format_html(
            '<div style="background:#1a1a2e;border:1px solid #2d2d44;border-radius:8px;padding:8px;width:200px">'
            '<img src="data:image/jpeg;base64,{}" '
            'style="width:100%;height:auto;border-radius:6px;display:block"/>'
            '<div style="font-size:11px;color:#cbd5e1;margin-top:6px">#{}{}</div>'
            '<div style="font-size:10px;color:#9ca3af;margin-top:2px;font-family:Consolas,monospace">{}</div>'
            '<div style="font-size:10px;color:#a78bfa;margin-top:1px;font-weight:600">{}</div>'
            '</div>',
            b64, total - i + 1, format_html(latest_pill), when, _ago(snap.captured_at),
        ))

    grid = mark_safe(''.join(tiles))
    footer = ''
    if total > len(snaps):
        footer = format_html(
            '<div style="color:#9ca3af;font-size:12px;margin-top:10px;'
            'padding:8px 12px;background:#1a1a2e;border:1px dashed #2d2d44;border-radius:6px">'
            '+ {} earlier capture{} not shown</div>',
            total - len(snaps), 's' if (total - len(snaps)) != 1 else '',
        )

    return format_html(
        '<div style="display:flex;flex-wrap:wrap;gap:12px">{}</div>{}',
        grid, footer,
    )


# ---------------------------------------------------------------------------
# Permission decorator
# ---------------------------------------------------------------------------

def teacher_required(view_func):
    """Only allow teachers (or superusers) past. Anonymous users redirect to login."""
    @wraps(view_func)
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(reverse('teacher_login') + f'?next={request.path}')
        if not (request.user.role == User.ROLE_TEACHER or request.user.is_superuser):
            return HttpResponseForbidden(
                '<h1>Forbidden</h1><p>This page is for teachers only.</p>'
            )
        return view_func(request, *args, **kwargs)
    return _wrapped


def _teacher_students_qs(request):
    """The set of students the current teacher can see.
    Superuser sees ALL students; regular teachers see only those assigned.
    """
    if request.user.is_superuser:
        return User.objects.filter(role=User.ROLE_STUDENT).order_by('-date_joined')
    return request.user.students.filter(role=User.ROLE_STUDENT).order_by('-date_joined')


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@require_http_methods(['GET', 'POST'])
def teacher_login(request):
    """Unified login: bounce to /admin/login/ with /teacher/ as the next URL.
    This means teachers and superadmins use the same login form (branded
    Django admin login page) - no separate UI to maintain.

    If the user is already signed in as a teacher, skip the login page
    entirely and send them to their portal. POST is accepted as a no-op
    redirect so any old bookmarks / form submissions still work.
    """
    if request.user.is_authenticated and (
        request.user.role == User.ROLE_TEACHER or request.user.is_superuser
    ):
        return redirect('teacher_portal')
    return redirect(reverse('admin:login') + f'?next={reverse("teacher_portal")}')


@require_http_methods(['POST', 'GET'])
def teacher_logout(request):
    # Same Django session as /admin/ so admin's logout works too.
    # IMPORTANT: redirect to /admin/login/ WITHOUT a ?next= param. If we
    # pinned ?next=/teacher/, an admin signing in next at the same URL
    # would be bounced to /teacher/ instead of their dashboard. By
    # leaving next blank, the user lands on /admin/ after auth, and
    # admin_dashboard handles role-based routing (teacher -> /teacher/,
    # admin/superuser -> dashboard).
    logout(request)
    return redirect(reverse('admin:login'))


# ---------------------------------------------------------------------------
# Portal pages
# ---------------------------------------------------------------------------

@teacher_required
def teacher_portal(request):
    """List students assigned to the logged-in teacher."""
    students = _teacher_students_qs(request)
    q = (request.GET.get('q') or '').strip()
    if q:
        students = students.filter(email__icontains=q) | students.filter(username__icontains=q) | students.filter(display_name__icontains=q)
    year = (request.GET.get('year') or '').strip()
    if year.isdigit():
        students = students.filter(year_level=int(year))
    section = (request.GET.get('section') or '').strip()
    if section:
        students = students.filter(section__iexact=section)

    return render(request, 'teachers/portal.html', {
        'students': students[:500],
        'total_count': students.count(),
        'q': q,
        'year': year,
        'section': section,
        'year_choices': User.YEAR_LEVEL_CHOICES,
    })


@teacher_required
@require_http_methods(['GET', 'POST'])
def teacher_student_new(request):
    """Create a new student account and auto-assign to the current teacher."""
    error = None
    form = {
        'email': '',
        'username': '',
        'display_name': '',
        'year_level': '',
        'section': '',
        'department': request.user.department or '',
        'password': '',
    }

    if request.method == 'POST':
        form = {k: (request.POST.get(k) or '').strip() for k in form.keys()}
        if not form['email'] or not form['username'] or not form['password']:
            error = 'Email, username, and password are required.'
        elif User.objects.filter(email__iexact=form['email']).exists():
            error = 'A user with that email already exists.'
        elif User.objects.filter(username__iexact=form['username']).exists():
            error = 'A user with that username already exists.'
        else:
            student = User.objects.create_user(
                email=form['email'],
                username=form['username'],
                password=form['password'],
                display_name=form['display_name'],
                department=form['department'],
                section=form['section'],
                year_level=int(form['year_level']) if form['year_level'].isdigit() else None,
                role=User.ROLE_STUDENT,
                is_email_verified=True,  # teacher-vouched, skip the verify-email flow
            )
            if not request.user.is_superuser:
                student.teachers.add(request.user)
            messages.success(request, f'Student {student.email} created and assigned to you.')
            return redirect('teacher_portal')

    return render(request, 'teachers/student_form.html', {
        'mode': 'new',
        'form': form,
        'error': error,
        'year_choices': User.YEAR_LEVEL_CHOICES,
    })


@teacher_required
def teacher_student_detail(request, student_id):
    """Read-only "stalker view" of one student, modeled on the Django
    admin user-edit page. Shows profile, gamification stats, login face
    snapshots, full quiz history, and assignment info."""
    from game.admin import _user_quiz_history_html

    student = get_object_or_404(_teacher_students_qs(request), pk=student_id)

    # Quiz attempt aggregates (separate from the rich HTML render so the
    # template can show counts/highlights at the top of the page).
    attempts_qs = student.quiz_attempts.all()
    total_attempts = attempts_qs.count()
    completed_attempts = attempts_qs.filter(completed=True).count()
    passed_attempts = attempts_qs.filter(completed=True, passed=True).count()

    return render(request, 'teachers/student_detail.html', {
        'student': student,
        'quiz_history_html': _user_quiz_history_html(student),
        'login_face_html': _login_face_snapshots_html(student),
        'total_attempts': total_attempts,
        'completed_attempts': completed_attempts,
        'passed_attempts': passed_attempts,
        'failed_attempts': completed_attempts - passed_attempts,
    })


@teacher_required
@require_http_methods(['GET', 'POST'])
def teacher_student_edit(request, student_id):
    """Edit one of the teacher's students. Full power - same fields the
    admin user-edit page exposes (profile + gameplay stats + status).
    Email/username stay read-only since changing those is account-merge
    territory (defer to superadmin)."""
    student = get_object_or_404(_teacher_students_qs(request), pk=student_id)

    def _as_int(name, lo=0, hi=10_000_000, default=0):
        raw = (request.POST.get(name) or '').strip()
        try:
            return max(lo, min(int(raw), hi))
        except ValueError:
            return default

    if request.method == 'POST':
        student.display_name = (request.POST.get('display_name') or '').strip()
        student.bio = (request.POST.get('bio') or '').strip()
        student.department = (request.POST.get('department') or '').strip()
        student.section = (request.POST.get('section') or '').strip()
        year = (request.POST.get('year_level') or '').strip()
        student.year_level = int(year) if year.isdigit() else None

        # Gameplay stats - teachers can tune XP, hearts, streaks as the
        # admin does. `level` is derived from XP via Model.save() so we
        # do NOT take a posted level value.
        student.xp = _as_int('xp', lo=0, hi=10_000_000, default=student.xp)
        max_h = _as_int('max_hearts', lo=1, hi=999, default=student.max_hearts)
        cur_h = _as_int('current_hearts', lo=0, hi=999, default=student.current_hearts)
        student.max_hearts = max_h
        student.current_hearts = min(cur_h, max_h)
        student.current_streak = _as_int('current_streak', lo=0, hi=10_000, default=student.current_streak)
        student.longest_streak = max(
            student.current_streak,
            _as_int('longest_streak', lo=0, hi=10_000, default=student.longest_streak),
        )

        # Status flags
        student.is_active = bool(request.POST.get('is_active'))
        student.is_email_verified = bool(request.POST.get('is_email_verified'))

        student.save()  # full save so `level` recomputes from xp
        messages.success(request, f'Updated {student.email}.')
        return redirect('teacher_student_detail', student_id=student.id)

    return render(request, 'teachers/student_form.html', {
        'mode': 'edit',
        'student': student,
        'form': {
            'email': student.email,
            'username': student.username,
            'display_name': student.display_name,
            'bio': student.bio,
            'year_level': student.year_level or '',
            'section': student.section or '',
            'department': student.department or '',
            'xp': student.xp,
            'level': student.level,
            'current_hearts': student.current_hearts,
            'max_hearts': student.max_hearts,
            'current_streak': student.current_streak,
            'longest_streak': student.longest_streak,
            'is_active': student.is_active,
            'is_email_verified': student.is_email_verified,
        },
        'error': None,
        'year_choices': User.YEAR_LEVEL_CHOICES,
    })


@teacher_required
@require_http_methods(['POST'])
def teacher_student_delete(request, student_id):
    student = get_object_or_404(_teacher_students_qs(request), pk=student_id)
    email = student.email
    student.delete()
    messages.warning(request, f'Deleted {email}.')
    return redirect('teacher_portal')


# ---------------------------------------------------------------------------
# PDF reports (scoped to this teacher's students)
# ---------------------------------------------------------------------------

@teacher_required
def teacher_reports_index(request):
    """Reports landing page at /teacher/reports/. Mirrors the admin Reports
    layout: 'All My Students' PDF + per-student PDF picker, scoped to the
    students assigned to the logged-in teacher."""
    students = (
        _teacher_students_qs(request)
        .filter(is_email_verified=True)
        .order_by('username')
    )
    return render(request, 'teachers/reports.html', {
        'students': students,
    })


def _clamp_days(value, default):
    try:
        n = int(value or default)
    except (TypeError, ValueError):
        n = default
    return max(1, min(n, 365))


def _date_window(days):
    """Return (start_local_date, end_local_date) covering the last `days` days
    inclusive of today."""
    from datetime import timedelta as _td
    end = timezone.localdate()
    start = end - _td(days=days - 1)
    return start, end


@teacher_required
def teacher_quiz_report_all_pdf(request):
    """PDF of ALL the calling teacher's students' quiz attempts over the
    last N days. Same template the admin uses."""
    # Lazy-imported so the module load order doesn't depend on core.urls.
    from core.urls import (
        _build_quiz_report_rows, _render_quiz_report_response,
    )
    from game.models import QuizAttempt

    days = _clamp_days(request.GET.get('days', 1), default=1)
    start_date, today_local = _date_window(days)
    student_ids = list(
        _teacher_students_qs(request).values_list('id', flat=True)
    )

    attempts = (
        QuizAttempt.objects
        .filter(user_id__in=student_ids,
                started_at__date__gte=start_date, completed=True)
        .select_related('user', 'topic', 'topic__category')
        .order_by('-started_at')
    )
    rows = _build_quiz_report_rows(attempts)

    if days == 1:
        title = 'My Students - Daily Quiz Report'
        subtitle = f'For {today_local.strftime("%B %d, %Y")}'
        slug = f'my-students-quiz-{today_local.isoformat()}'
    else:
        title = 'My Students - Quiz Activity Report'
        subtitle = (
            f'{start_date.strftime("%B %d")} to {today_local.strftime("%B %d, %Y")} '
            f'({days} days)'
        )
        slug = f'my-students-quiz-{days}d-{today_local.isoformat()}'

    context = {
        'report_title': title,
        'report_subtitle': subtitle,
        'report_user': {
            'name': request.user.get_display_name(),
            'email': request.user.email,
        },
        'show_student_column': True,
        'generated_at': timezone.localtime(timezone.now()).strftime('%I:%M %p'),
        'rows': rows,
        'total_count': len(rows),
        'passed_count': sum(1 for r in rows if r['status_class'] == 'passed'),
        'failed_count': sum(1 for r in rows if r['status_class'] == 'failed'),
    }
    return _render_quiz_report_response(request, context, slug)


@teacher_required
def teacher_student_quiz_report_pdf(request, student_id):
    """PDF of ONE assigned student's quiz attempts over the last N days."""
    from core.urls import (
        _build_quiz_report_rows, _render_quiz_report_response,
    )
    from game.models import QuizAttempt

    student = get_object_or_404(_teacher_students_qs(request), pk=student_id)
    days = _clamp_days(request.GET.get('days', 7), default=7)
    start_date, today_local = _date_window(days)

    attempts = (
        QuizAttempt.objects
        .filter(user=student, started_at__date__gte=start_date, completed=True)
        .select_related('user', 'topic', 'topic__category')
        .order_by('-started_at')
    )
    rows = _build_quiz_report_rows(attempts)

    if days == 1:
        subtitle = f'For {today_local.strftime("%B %d, %Y")}'
    else:
        subtitle = (
            f'{start_date.strftime("%B %d")} to {today_local.strftime("%B %d, %Y")} '
            f'({days} days)'
        )

    context = {
        'report_title': f'Quiz Report - {student.get_display_name()}',
        'report_subtitle': subtitle,
        'report_user': {
            'name': student.get_display_name(),
            'email': student.email,
            'username': student.username,
        },
        'show_student_column': False,
        'generated_at': timezone.localtime(timezone.now()).strftime('%I:%M %p'),
        'rows': rows,
        'total_count': len(rows),
        'passed_count': sum(1 for r in rows if r['status_class'] == 'passed'),
        'failed_count': sum(1 for r in rows if r['status_class'] == 'failed'),
    }
    slug = student.username or str(student.pk)
    return _render_quiz_report_response(
        request, context, f'quiz-report-{slug}-{days}d-{today_local.isoformat()}',
    )


@teacher_required
@require_http_methods(['POST'])
def teacher_student_reset_password(request, student_id):
    """Send a password-reset email to the student."""
    import logging
    logger = logging.getLogger(__name__)

    student = get_object_or_404(_teacher_students_qs(request), pk=student_id)
    token = PasswordResetToken.create_token(student)
    try:
        send_password_reset_email(student, token)
        messages.success(request, f'Password-reset email sent to {student.email}.')
    except Exception as e:  # noqa: BLE001 - surface the failure to the teacher
        logger.exception(f'Teacher portal: reset email FAILED to {student.email}: {e}')
        messages.error(
            request,
            f'Could not send the reset email to {student.email}. Try again in a moment.',
        )
    return redirect('teacher_portal')
