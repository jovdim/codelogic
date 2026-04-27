"""
URL routes for game API.
"""

from django.urls import path
from . import views

urlpatterns = [
    # Categories and Topics
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:category_slug>/', views.CategoryDetailView.as_view(), name='category-detail'),
    path('topics/<slug:category_slug>/<slug:topic_slug>/', views.TopicDetailView.as_view(), name='topic-detail'),
    
    # Quiz
    path('quiz/<slug:category_slug>/<slug:topic_slug>/<int:level>/', views.QuizQuestionsView.as_view(), name='quiz-questions'),
    path('answer/', views.SubmitAnswerView.as_view(), name='submit-answer'),
    path('complete/', views.CompleteQuizView.as_view(), name='complete-quiz'),
    
    # User data
    path('leaderboard/', views.LeaderboardView.as_view(), name='leaderboard'),
    path('stats/', views.UserStatsView.as_view(), name='user-stats'),
    path('daily-stats/', views.UserDailyStatsView.as_view(), name='daily-stats'),
    path('certificates/', views.UserCertificatesView.as_view(), name='user-certificates'),
    
    # Learning resources
    path('resources/', views.LearningResourceListView.as_view(), name='resource-list'),
    path('resources/<slug:slug>/', views.LearningResourceDetailView.as_view(), name='resource-detail'),

]
