"""
URL configuration for CodeLogic API.
"""
import os
import pathlib
import subprocess
import tempfile
from datetime import timedelta

from django.contrib import admin
from django.contrib.admin.views.decorators import staff_member_required
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone


# ---------------------------------------------------------------------------
# HTML -> PDF rendering (Chrome subprocess primary, WeasyPrint fallback)
# Mirrors the strategy used by the certificate-PDF view in game/views.py.
# Chrome's `--no-pdf-header-footer` produces a clean PDF without the
# browser's date/page-number/URL strips, so the admin doesn't have to
# remember to uncheck "Headers and footers" in the print dialog.
# ---------------------------------------------------------------------------

_CHROME_CANDIDATES = [
    # DigitalOcean App Platform (bin/post_compile installs Chrome here).
    os.path.expanduser('~/.local/chrome/chrome'),
    # Windows
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    os.path.expanduser(r'~\AppData\Local\Google\Chrome\Application\chrome.exe'),
    # Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
    # macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
]


def _find_chrome():
    for c in _CHROME_CANDIDATES:
        if c and os.path.exists(c):
            return c
    return None


def _render_with_chrome(chrome_path, html_str):
    """Run headless Chrome to render HTML -> PDF. Raises on failure."""
    with tempfile.TemporaryDirectory() as tmpdir:
        tmp = pathlib.Path(tmpdir)
        html_file = tmp / 'report.html'
        pdf_file = tmp / 'report.pdf'
        html_file.write_text(html_str, encoding='utf-8')
        cmd = [
            chrome_path,
            '--headless=new',
            '--disable-gpu',
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--no-pdf-header-footer',
            f'--print-to-pdf={pdf_file}',
            html_file.as_uri(),
        ]
        result = subprocess.run(cmd, capture_output=True, timeout=30)
        if result.returncode != 0 or not pdf_file.exists() or pdf_file.stat().st_size == 0:
            err = result.stderr.decode('utf-8', errors='replace')[:300]
            raise RuntimeError(f'chrome failed: {err}')
        return pdf_file.read_bytes()


def _html_to_pdf_bytes(html_str):
    """Render HTML to PDF bytes. Returns None if no engine is available
    (caller should fall back to serving HTML in that case)."""
    chrome = _find_chrome()
    if chrome is not None:
        try:
            return _render_with_chrome(chrome, html_str)
        except Exception:  # noqa: BLE001 - fall through to WeasyPrint
            pass
    try:
        from weasyprint import HTML  # type: ignore[import-not-found]
    except ImportError:
        return None
    try:
        return HTML(string=html_str).write_pdf()
    except Exception:  # noqa: BLE001
        return None

CHART_HEIGHT_PX = 160  # matches .cl-chart height in dashboard.html


def _trend_series(qs, date_field, days=30):
    """
    Build a [{date, count, px, label}] list covering the last `days` days,
    zero-filled. `px` is the bar height in pixels (computed against the
    series max), so the template can render absolutely-positioned CSS bars
    without any percentage-height gotchas.
    """
    end = timezone.localdate()
    start = end - timedelta(days=days - 1)
    counts = (
        qs.filter(**{f"{date_field}__date__gte": start})
          .annotate(day=TruncDate(date_field))
          .values("day")
          .annotate(c=Count("id"))
    )
    by_day = {row["day"].isoformat(): row["c"] for row in counts if row["day"]}
    raw = [
        {"date": start + timedelta(days=i),
         "count": by_day.get((start + timedelta(days=i)).isoformat(), 0)}
        for i in range(days)
    ]
    max_count = max((d["count"] for d in raw), default=0)
    for d in raw:
        # Round to int so we don't get "27.77777777px" style values
        d["px"] = int(round(d["count"] / max_count * CHART_HEIGHT_PX)) if max_count else 0
        d["label"] = d["date"].strftime("%b %d")
        d["date"] = d["date"].isoformat()
    return raw


# Simple admin dashboard view. extra_context kwarg is accepted (and ignored)
# so this function can be assigned directly to admin.site.index, which Django
# calls as `self.index(request, extra_context=...)`.
def admin_dashboard(request, extra_context=None):
    from accounts.models import User
    from game.models import Category, Topic, Question, LearningResource, Certificate, UserCertificate, QuizAttempt

    # Unified-login routing: teachers go through /admin/login/ (same UI as
    # superadmin) and then get bounced to their portal at /teacher/.
    # Superusers skip the bounce so they can still see the dashboard.
    if (
        request.user.is_authenticated
        and getattr(request.user, 'role', None) == User.ROLE_TEACHER
        and not request.user.is_superuser
    ):
        from django.shortcuts import redirect
        return redirect('teacher_portal')
    
    # Get categories with topics
    categories_with_topics = []
    for cat in Category.objects.prefetch_related('topics').order_by('order', 'name'):
        topics = cat.topics.filter(is_active=True).order_by('order', 'name')
        categories_with_topics.append({
            'category': cat,
            'topics': topics,
            'topics_count': topics.count(),
        })
    
    # Get all certificates (one per topic)
    certificates = Certificate.objects.select_related('topic', 'topic__category').order_by('topic__category__order', 'topic__order')
    
    # 30-day trend series for the two top charts. Serialized to JSON
    # here so the template can drop them straight into Chart.js init.
    signups_trend = _trend_series(User.objects.filter(is_email_verified=True), "date_joined", days=30)
    attempts_trend = _trend_series(QuizAttempt.objects.all(), "started_at", days=30)

    # admin.site.each_context() provides 'available_apps', 'site_header',
    # 'user' etc. that admin/base.html needs to render the left nav-sidebar.
    # Without this, the sidebar would not appear on the dashboard page.
    context = {
        **admin.site.each_context(request),
        'title': 'Dashboard',
        'total_users': User.objects.filter(is_email_verified=True).count(),
        'total_categories': Category.objects.count(),
        'total_topics': Topic.objects.count(),
        'total_questions': Question.objects.count(),
        'total_resources': LearningResource.objects.count(),
        'total_certificates': Certificate.objects.count(),
        'recent_users': User.objects.filter(is_email_verified=True).order_by('-date_joined')[:5],
        'categories_with_topics': categories_with_topics,
        'certificates': certificates,
        'signups_trend': signups_trend,
        'attempts_trend': attempts_trend,
        'signups_30d_total': sum(d["count"] for d in signups_trend),
        'attempts_30d_total': sum(d["count"] for d in attempts_trend),
    }
    return render(request, 'admin/dashboard.html', context)

# ---------------------------------------------------------------------------
# Daily quiz report (teacher's printable PDF)
# ---------------------------------------------------------------------------

def _quiz_attempt_status(attempt):
    """Map a QuizAttempt to a human-readable status + a class tag for the PDF."""
    if not attempt.completed:
        return ('Not Finished', 'in-progress')
    if attempt.passed:
        return ('Passed', 'passed')
    return ('Failed', 'failed')


def _format_duration(started_at, completed_at):
    """Return a short 'how long the quiz took' string, e.g. '5m 12s' or '1h 03m'.
    Returns a hyphen if either timestamp is missing (i.e. quiz never finished)."""
    if not started_at or not completed_at:
        return '-'
    secs = max(0, int((completed_at - started_at).total_seconds()))
    if secs >= 3600:
        return f'{secs // 3600}h {(secs % 3600) // 60:02d}m'
    if secs >= 60:
        return f'{secs // 60}m {secs % 60:02d}s'
    return f'{secs}s'


def _build_quiz_report_rows(attempts):
    """Convert a queryset of QuizAttempt rows into the dict shape the report
    template expects. Times are converted to the project TIME_ZONE here so
    the template doesn't have to know about timezones."""
    rows = []
    for a in attempts:
        status_label, status_class = _quiz_attempt_status(a)
        started_local = timezone.localtime(a.started_at) if a.started_at else None
        completed_local = timezone.localtime(a.completed_at) if a.completed_at else None
        rows.append({
            'student_name': a.user.get_display_name() if a.user else '-',
            'student_email': a.user.email if a.user else '-',
            'topic': a.topic.name if a.topic else '-',
            'category': a.topic.category.name if a.topic and a.topic.category else '-',
            'level': a.level,
            'started_at': started_local.strftime('%b %d, %I:%M %p') if started_local else '-',
            'completed_at': completed_local.strftime('%b %d, %I:%M %p') if completed_local else '-',
            'duration': _format_duration(a.started_at, a.completed_at),
            'score': f'{a.score}/{a.total_questions}' if a.completed else '-',
            'status_label': status_label,
            'status_class': status_class,
        })
    return rows


def _render_quiz_report_response(request, context, filename_slug):
    """Render the shared report template; return as PDF using the local
    Chrome subprocess (primary) or WeasyPrint (fallback). If neither engine
    is available, serve the HTML so the admin still sees the report and can
    use the browser's Save-as-PDF as a last resort."""
    html = render_to_string('admin/reports/quiz_report_today.html', context)
    pdf_bytes = _html_to_pdf_bytes(html)
    if pdf_bytes is None:
        return HttpResponse(html)
    response = HttpResponse(pdf_bytes, content_type='application/pdf')
    # `inline` so the PDF previews in the browser (with the browser's built-in
    # PDF viewer); the admin can still hit "Save" to keep a copy. Switch to
    # `attachment` if you'd rather force a direct download.
    response['Content-Disposition'] = f'inline; filename="{filename_slug}.pdf"'
    return response


def _superuser_only(view):
    """The admin reports routes used to be guarded by `staff_member_required`,
    but UserAdmin.save_model auto-sets is_staff=True for every teacher
    (so they can hit /admin/login/), which silently gave them access to
    school-wide PDFs of every student's quiz activity.

    Tighten the gate: only superusers see the report endpoints. Teachers
    print PDFs via /teacher/reports/ which IS scoped to their assigned
    students.
    """
    from functools import wraps
    from django.http import HttpResponseForbidden
    from django.shortcuts import redirect
    from django.urls import reverse

    @wraps(view)
    def _wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect(reverse('admin:login') + f'?next={request.path}')
        if not request.user.is_superuser:
            return HttpResponseForbidden(
                '<h1>403 Forbidden</h1>'
                '<p>Admin reports are superuser-only. '
                'Teachers can print reports for their own students at '
                '<a href="/teacher/reports/">/teacher/reports/</a>.</p>'
            )
        return view(request, *args, **kwargs)
    return _wrapped


@_superuser_only
def admin_reports_index(request):
    """Reports landing page at /admin/reports/. Consolidates the form widgets
    that used to live on the admin dashboard + each user's change page so
    the admin sidebar has one dedicated entry point for reports."""
    from accounts.models import User
    students = (
        User.objects
        .filter(is_email_verified=True, is_staff=False, is_superuser=False)
        .order_by('username')
    )
    context = {
        **admin.site.each_context(request),
        'title': 'Reports',
        'students': students,
    }
    return render(request, 'admin/reports/index.html', context)


@_superuser_only
def daily_quiz_report_pdf(request):
    """All-students quiz report across the last N days (Asia/Manila TZ).

    Default is `days=1` (today only) to keep the original behavior. Teachers
    can pass `?days=7` or any custom value to get a wider window.
    """
    from game.models import QuizAttempt
    from datetime import timedelta as _td

    try:
        days = int(request.GET.get('days', 1))
    except (TypeError, ValueError):
        days = 1
    days = max(1, min(days, 365))

    today_local = timezone.localdate()
    start_date = today_local - _td(days=days - 1)  # days=1 -> just today

    attempts = (
        QuizAttempt.objects
        # Only completed attempts - teachers don't care about students who
        # opened a quiz and walked away. Counts and rows both exclude these.
        .filter(started_at__date__gte=start_date, completed=True)
        .select_related('user', 'topic', 'topic__category')
        .order_by('-started_at')
    )
    rows = _build_quiz_report_rows(attempts)

    if days == 1:
        title = 'Daily Quiz Report'
        subtitle = f'For {today_local.strftime("%B %d, %Y")}'
        slug = f'quiz-report-{today_local.isoformat()}'
    else:
        title = 'Quiz Activity Report'
        subtitle = (
            f'{start_date.strftime("%B %d")} to {today_local.strftime("%B %d, %Y")} '
            f'({days} days)'
        )
        slug = f'quiz-report-{days}d-{today_local.isoformat()}'

    context = {
        'report_title': title,
        'report_subtitle': subtitle,
        'show_student_column': True,
        'generated_at': timezone.localtime(timezone.now()).strftime('%I:%M %p'),
        'rows': rows,
        'total_count': len(rows),
        'passed_count': sum(1 for r in rows if r['status_class'] == 'passed'),
        'failed_count': sum(1 for r in rows if r['status_class'] == 'failed'),
    }
    return _render_quiz_report_response(request, context, slug)


@_superuser_only
def user_quiz_report_pdf(request, user_id):
    """Per-user quiz report for the last N days (default 7). Used by teachers
    to review a single student's recent activity.

    Query params:
      - days: number of past days to include (1-365, default 7). 1 means today only.
    """
    from accounts.models import User
    from game.models import QuizAttempt
    from django.shortcuts import get_object_or_404
    from datetime import timedelta as _td

    user = get_object_or_404(User, pk=user_id)

    # Clamp `days` to a sensible range.
    try:
        days = int(request.GET.get('days', 7))
    except (TypeError, ValueError):
        days = 7
    days = max(1, min(days, 365))

    today_local = timezone.localdate()
    start_date = today_local - _td(days=days - 1)  # days=1 -> just today

    attempts = (
        QuizAttempt.objects
        .filter(user=user, started_at__date__gte=start_date, completed=True)
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
        'report_title': f'Quiz Report - {user.get_display_name()}',
        'report_subtitle': subtitle,
        'report_user': {
            'name': user.get_display_name(),
            'email': user.email,
            'username': user.username,
        },
        # Hide the redundant Student column when the whole report is one user.
        'show_student_column': False,
        'generated_at': timezone.localtime(timezone.now()).strftime('%I:%M %p'),
        'rows': rows,
        'total_count': len(rows),
        'passed_count': sum(1 for r in rows if r['status_class'] == 'passed'),
        'failed_count': sum(1 for r in rows if r['status_class'] == 'failed'),
    }
    slug = user.username or str(user.pk)
    return _render_quiz_report_response(
        request, context, f'quiz-report-{slug}-{days}d-{today_local.isoformat()}',
    )


# Customize admin site
admin.site.site_header = 'CodeLogic Admin'
admin.site.site_title = 'CodeLogic Admin'
admin.site.index_title = 'Welcome to CodeLogic Administration'
# Remove the "View site" link from the top-right user-tools bar. The default
# Django target ('/') is a backend-only deployment and 404s, which confused
# admins. The frontend lives on a separate Vercel domain anyway.
admin.site.site_url = None

# Replace the default app/model index at /admin/ with the dashboard. The
# URL stays at /admin/ (no 302 redirect) and the page content is the
# dashboard. The standalone /admin/dashboard/ route below is kept as an
# alias for back-compat with any existing links.
admin.site.index = admin_dashboard

urlpatterns = [
    path('admin/dashboard/', admin.site.admin_view(admin_dashboard), name='admin-dashboard'),
    path('admin/reports/', admin_reports_index, name='admin-reports'),
    path('admin/reports/today/', daily_quiz_report_pdf, name='admin-quiz-report-today'),
    path('admin/reports/user/<uuid:user_id>/', user_quiz_report_pdf, name='admin-user-quiz-report'),
    path('admin/', admin.site.urls),
    path('teacher/', include('accounts.teacher_urls')),
    path('api/auth/', include('accounts.urls')),
    path('api/game/', include('game.urls')),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

# Serve media files in development and production
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
