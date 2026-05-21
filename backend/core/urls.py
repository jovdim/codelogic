"""
URL configuration for CodeLogic API.
"""
from datetime import timedelta

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone

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

# Customize admin site
admin.site.site_header = 'CodeLogic Admin'
admin.site.site_title = 'CodeLogic Admin'
admin.site.index_title = 'Welcome to CodeLogic Administration'

# Replace the default app/model index at /admin/ with the dashboard. The
# URL stays at /admin/ (no 302 redirect) and the page content is the
# dashboard. The standalone /admin/dashboard/ route below is kept as an
# alias for back-compat with any existing links.
admin.site.index = admin_dashboard

urlpatterns = [
    path('admin/dashboard/', admin.site.admin_view(admin_dashboard), name='admin-dashboard'),
    path('admin/', admin.site.urls),
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
