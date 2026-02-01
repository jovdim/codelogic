"""
URL configuration for CodeLogic API.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
from django.db.models import Count

# Simple admin dashboard view
def admin_dashboard(request):
    from accounts.models import User
    from game.models import Category, Topic, Question, LearningResource
    
    context = {
        'title': 'Dashboard',
        'total_users': User.objects.count(),
        'total_categories': Category.objects.count(),
        'total_topics': Topic.objects.count(),
        'total_questions': Question.objects.count(),
        'total_resources': LearningResource.objects.count(),
        'recent_users': User.objects.order_by('-date_joined')[:5],
        'categories': Category.objects.annotate(topics_count=Count('topics')),
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
