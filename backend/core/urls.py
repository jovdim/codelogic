"""
URL configuration for CodeLogic API.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
from django.db.models import Count, Sum

# Custom admin dashboard view
def admin_dashboard(request):
    from accounts.models import User
    from game.models import Category, Topic, Question, QuizAttempt, LearningResource
    
    context = {
        'title': 'Dashboard',
        'total_users': User.objects.count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'verified_users': User.objects.filter(is_email_verified=True).count(),
        'total_questions': Question.objects.count(),
        'active_questions': Question.objects.filter(is_active=True).count(),
        'total_categories': Category.objects.count(),
        'total_topics': Topic.objects.count(),
        'total_attempts': QuizAttempt.objects.count(),
        'total_xp_earned': QuizAttempt.objects.aggregate(total=Sum('xp_earned'))['total'] or 0,
        'total_resources': LearningResource.objects.count(),
        'total_resource_views': LearningResource.objects.aggregate(total=Sum('views'))['total'] or 0,
        'recent_users': User.objects.order_by('-date_joined')[:5],
        'recent_attempts': QuizAttempt.objects.select_related('user', 'topic').order_by('-started_at')[:10],
        'top_users': User.objects.order_by('-xp')[:5],
        'questions_by_topic': Topic.objects.annotate(q_count=Count('questions')).order_by('-q_count')[:6],
    }
    return render(request, 'admin/dashboard.html', context)

# Customize admin site
admin.site.site_header = 'CodeLogic Admin'
admin.site.site_title = 'CodeLogic Admin'
admin.site.index_title = 'Welcome to CodeLogic Administration'

urlpatterns = [
    path('admin/dashboard/', admin.site.admin_view(admin_dashboard), name='admin-dashboard'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/game/', include('game.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
