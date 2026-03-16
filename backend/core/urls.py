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
    from game.models import Category, Topic, Question, LearningResource, Certificate, UserCertificate
    
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
    
    context = {
        'title': 'Dashboard',
        'total_users': User.objects.count(),
        'total_categories': Category.objects.count(),
        'total_topics': Topic.objects.count(),
        'total_questions': Question.objects.count(),
        'total_resources': LearningResource.objects.count(),
        'total_certificates': Certificate.objects.count(),
        'total_awarded': UserCertificate.objects.count(),
        'recent_users': User.objects.order_by('-date_joined')[:5],
        'categories_with_topics': categories_with_topics,
        'certificates': certificates,
        'recent_certificates': UserCertificate.objects.select_related('user', 'certificate__topic').order_by('-completion_date')[:5],
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

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

# Serve media files in development and production
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
