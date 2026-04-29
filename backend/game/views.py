"""
Views for game API - quizzes, progress, hearts/XP management.
"""

import os
import pathlib
import subprocess
import tempfile

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.contrib.admin.views.decorators import staff_member_required
from django.http import HttpResponse, Http404
from django.shortcuts import get_object_or_404, render
from django.views.decorators.cache import cache_control
from django.utils import timezone
from django.db.models import F, Q, Count, Sum
from django.db.models.functions import Coalesce
import random

from .models import Category, Topic, Question, QuizAttempt, UserAnswer, UserProgress, LearningResource, Lesson, UserCertificate
from .serializers import (
    CategorySerializer, TopicSerializer, TopicWithProgressSerializer,
    QuestionSerializer, LeaderboardUserSerializer,
    LearningResourceListSerializer, LearningResourceDetailSerializer,
    LessonSerializer
)

User = get_user_model()

# Constants
HEART_REGEN_MINUTES = 2
XP_PER_CORRECT = 10
XP_BONUS_PERFECT = 50
XP_BONUS_NO_HEARTS_LOST = 25


class CategoryListView(APIView):
    """Get all active categories with their topics."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        categories = Category.objects.filter(is_active=True).prefetch_related(
            'topics'
        ).annotate(
            total_questions=Count(
                'topics__questions',
                filter=Q(topics__questions__is_active=True)
            ),
            total_xp=Coalesce(
                Sum('topics__questions__xp_reward', filter=Q(topics__questions__is_active=True)),
                0
            )
        ).order_by('order', 'name')
        
        result = []
        for cat in categories:
            topics = cat.topics.filter(is_active=True).order_by('order', 'name')
            topic_names = [t.name for t in topics]
            topic_count = len(topic_names)
            
            # Build icon URL
            icon_url = None
            if cat.icon_file:
                icon_url = request.build_absolute_uri(cat.icon_file.url)
            
            result.append({
                'id': str(cat.id),
                'slug': cat.slug,
                'name': cat.name,
                'description': cat.description,
                'icon': icon_url,
                'color': cat.color,
                'topics': topic_names,
                'topicCount': topic_count,
                'totalQuestions': cat.total_questions,
                'totalXP': cat.total_xp,
            })
        
        return Response(result)


class CategoryDetailView(APIView):
    """Get single category with full topic details."""
    permission_classes = [AllowAny]
    
    def get(self, request, category_slug):
        try:
            category = Category.objects.get(slug=category_slug, is_active=True)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        
        topics = category.topics.filter(is_active=True).annotate(
            question_count=Count('questions', filter=Q(questions__is_active=True)),
            topic_xp=Coalesce(Sum('questions__xp_reward', filter=Q(questions__is_active=True)), 0)
        ).order_by('order', 'name')
        
        # Calculate total XP from annotated topics
        total_xp = sum(t.topic_xp for t in topics)
        
        # Build category icon URL
        category_icon_url = None
        if category.icon_file:
            category_icon_url = request.build_absolute_uri(category.icon_file.url)
        
        topics_data = []
        for topic in topics:
            # Build topic icon URL (fallback to category icon)
            topic_icon_url = None
            if topic.icon_file:
                topic_icon_url = request.build_absolute_uri(topic.icon_file.url)
            elif category.icon_file:
                topic_icon_url = category_icon_url
            
            topics_data.append({
                'id': str(topic.id),
                'slug': topic.slug,
                'name': topic.name,
                'description': topic.description,
                'icon': topic_icon_url,
                'totalLevels': topic.total_levels,
                'xpReward': topic.topic_xp,
                'questionCount': topic.question_count,
            })
        
        return Response({
            'id': str(category.id),
            'slug': category.slug,
            'name': category.name,
            'description': category.description,
            'icon': category_icon_url,
            'color': category.color,
            'topics': topics_data,
            'totalXP': total_xp,
        })


class TopicDetailView(APIView):
    """Get topic details with user progress."""
    permission_classes = [AllowAny]
    
    def get(self, request, category_slug, topic_slug):
        try:
            topic = Topic.objects.get(
                category__slug=category_slug,
                slug=topic_slug,
                is_active=True
            )
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.user.is_authenticated:
            serializer = TopicWithProgressSerializer(topic, context={'request': request})
        else:
            serializer = TopicSerializer(topic)
        
        return Response(serializer.data)


class QuizQuestionsView(APIView):
    """
    Start a quiz: accept the face-verification photo, create a QuizAttempt
    bound to it, and return the questions to play. The photo is mandatory —
    no attempt row is created without one. This is the single chokepoint
    that gates the quiz on identity capture.
    """
    permission_classes = [IsAuthenticated]
    # Face photo arrives as multipart/form-data from the verification modal.
    parser_classes = [MultiPartParser, FormParser]

    # Hard cap on what we'll accept and store in Postgres. The frontend
    # downscales aggressively so real captures land well under this.
    MAX_PHOTO_BYTES = 500_000  # ~500 KB

    def post(self, request, category_slug, topic_slug, level):
        photo_file = request.FILES.get('verification_photo')
        if photo_file is None:
            return Response(
                {'error': 'Face verification photo is required to start a quiz.',
                 'code': 'VERIFICATION_REQUIRED'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if photo_file.size > self.MAX_PHOTO_BYTES:
            return Response(
                {'error': 'Verification photo is too large.',
                 'code': 'PHOTO_TOO_LARGE'},
                status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            )
        photo_bytes = photo_file.read()
        if not photo_bytes:
            return Response(
                {'error': 'Verification photo is empty.',
                 'code': 'PHOTO_EMPTY'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            topic = Topic.objects.get(
                category__slug=category_slug,
                slug=topic_slug,
                is_active=True
            )
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check hearts
        user = request.user
        self._regenerate_hearts(user)

        if user.current_hearts <= 0:
            return Response({
                'error': 'No hearts remaining',
                'hearts': user.current_hearts,
            }, status=status.HTTP_403_FORBIDDEN)

        # Get questions for this level
        questions = list(Question.objects.filter(topic=topic, level=level, is_active=True))

        if not questions:
            return Response({'error': 'No questions found for this level'}, status=status.HTTP_404_NOT_FOUND)

        # Shuffle and limit
        random.shuffle(questions)
        questions = questions[:10]

        # Create a quiz attempt with the verification photo attached.
        attempt = QuizAttempt.objects.create(
            user=user,
            topic=topic,
            level=level,
            total_questions=len(questions),
            verification_photo=photo_bytes,
            verification_captured_at=timezone.now(),
        )
        
        # Get lessons for this level
        lessons = Lesson.objects.filter(topic=topic, level=level, is_active=True).order_by('order')
        lesson_data = LessonSerializer(lessons, many=True).data
        
        serializer = QuestionSerializer(questions, many=True)
        return Response({
            'lessons': lesson_data,
            'questions': serializer.data,
            'topic': topic.name,
            'level': level,
            'total_questions': len(questions),
            'hearts': user.current_hearts,
            'attempt_id': str(attempt.id),
        })
    
    def _regenerate_hearts(self, user):
        if user.current_hearts >= user.max_hearts:
            return
        now = timezone.now()
        time_diff = now - user.last_heart_update
        minutes_passed = time_diff.total_seconds() / 60
        hearts_to_add = int(minutes_passed // HEART_REGEN_MINUTES)
        if hearts_to_add > 0:
            user.current_hearts = min(user.max_hearts, user.current_hearts + hearts_to_add)
            user.last_heart_update = now
            user.save()


class SubmitAnswerView(APIView):
    """Submit an answer and get result. Persists the answer against the attempt."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        question_id = request.data.get('question_id')
        answer = request.data.get('answer')
        attempt_id = request.data.get('attempt_id')

        if question_id is None or answer is None or attempt_id is None:
            return Response(
                {'error': 'Missing question_id, answer, or attempt_id'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            attempt = QuizAttempt.objects.get(id=attempt_id, user=request.user)
        except (QuizAttempt.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Invalid attempt'}, status=status.HTTP_404_NOT_FOUND)

        if attempt.completed:
            return Response(
                {'error': 'Attempt already completed'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        is_correct = (answer == question.correct_answer)

        # Record the answer (idempotent on retry — first answer wins).
        UserAnswer.objects.get_or_create(
            attempt=attempt,
            question=question,
            defaults={
                'selected_answer': answer,
                'is_correct': is_correct,
            },
        )

        xp_earned = question.xp_reward if is_correct else 0
        heart_lost = False
        if not is_correct and user.current_hearts > 0:
            user.current_hearts -= 1
            user.last_heart_update = timezone.now()
            user.save()
            heart_lost = True

        return Response({
            'correct': is_correct,
            'correct_answer': question.correct_answer,
            'explanation': question.explanation,
            'xp_earned': xp_earned,
            'heart_lost': heart_lost,
            'hearts_remaining': user.current_hearts,
        })


class CompleteQuizView(APIView):
    """Complete a quiz and record results.

    Score and stars are recomputed from the persisted UserAnswer rows — the
    client-supplied ``score`` field is ignored, so a tampered request cannot
    inflate stars or XP.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        attempt_id = request.data.get('attempt_id')
        hearts_lost = request.data.get('hearts_lost', 0)

        if attempt_id is None:
            return Response({'error': 'Missing attempt_id'}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        try:
            attempt = QuizAttempt.objects.select_related('topic').get(
                id=attempt_id, user=user
            )
        except (QuizAttempt.DoesNotExist, ValueError, TypeError):
            return Response({'error': 'Invalid attempt'}, status=status.HTTP_404_NOT_FOUND)

        if attempt.completed:
            # Idempotent: return what was previously recorded so retries don't
            # double-award XP or break the UI.
            return Response({
                'passed': attempt.passed,
                'score': attempt.score,
                'total_questions': attempt.total_questions,
                'stars': attempt.stars,
                'xp_earned': attempt.xp_earned,
                'new_level': UserProgress.objects.filter(user=user, topic=attempt.topic).values_list('current_level', flat=True).first() or 1,
                'total_xp': user.xp,
                'current_streak': user.current_streak,
            })

        topic = attempt.topic
        level = attempt.level
        total_questions = attempt.total_questions

        # Authoritative score: count correct answers persisted by SubmitAnswerView.
        score = UserAnswer.objects.filter(attempt=attempt, is_correct=True).count()
        passed = total_questions > 0 and score >= (total_questions * 0.5)
        stars = QuizAttempt.calculate_stars(score, total_questions)

        # XP rules: 10 per correct, +50 perfect, +25 no hearts lost (only if any correct).
        xp_earned = score * XP_PER_CORRECT
        if score == total_questions and total_questions > 0:
            xp_earned += XP_BONUS_PERFECT
        if hearts_lost == 0 and score > 0:
            xp_earned += XP_BONUS_NO_HEARTS_LOST

        # Streak (by calendar day).
        today = timezone.now().date()
        from datetime import timedelta
        yesterday = today - timedelta(days=1)
        if user.last_activity_date is None:
            user.current_streak = 1
            user.longest_streak = max(user.longest_streak, 1)
        elif user.last_activity_date == today:
            pass
        elif user.last_activity_date == yesterday:
            user.current_streak += 1
            user.longest_streak = max(user.longest_streak, user.current_streak)
        else:
            user.current_streak = 1
        user.last_activity_date = today

        user.xp += xp_earned
        user.save()

        # Update progress. Only increment lifetime answer counters on first pass
        # of a level so retries don't dilute the user's accuracy stat.
        progress, _ = UserProgress.objects.get_or_create(
            user=user, topic=topic,
            defaults={'current_level': 1},
        )

        is_first_pass_of_level = passed and level > progress.highest_level_completed

        if passed and level >= progress.current_level:
            progress.highest_level_completed = max(progress.highest_level_completed, level)
            progress.current_level = level + 1
        progress.total_xp_earned += xp_earned
        if is_first_pass_of_level:
            progress.total_questions_answered += total_questions
            progress.correct_answers += score
        progress.save()

        # Update the existing attempt row instead of creating a new one (no orphans).
        attempt.score = score
        attempt.stars = stars
        attempt.xp_earned = xp_earned
        attempt.hearts_lost = hearts_lost
        attempt.completed = True
        attempt.passed = passed
        attempt.completed_at = timezone.now()
        attempt.save()

        return Response({
            'passed': passed,
            'score': score,
            'total_questions': total_questions,
            'stars': stars,
            'xp_earned': xp_earned,
            'new_level': progress.current_level,
            'total_xp': user.xp,
            'current_streak': user.current_streak,
        })


class LeaderboardView(APIView):
    """Get leaderboard."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        limit = min(int(request.query_params.get('limit', 15)), 15)
        # Exclude staff and superusers from leaderboard
        users = User.objects.filter(
            is_active=True,
            is_email_verified=True,
            is_staff=False,
            is_superuser=False
        ).order_by('-xp', '-current_streak')[:limit]
        
        leaderboard = []
        for rank, user in enumerate(users, 1):
            data = LeaderboardUserSerializer(user).data
            data['rank'] = rank
            leaderboard.append(data)
        
        return Response({'leaderboard': leaderboard})


class UserStatsView(APIView):
    """Get user game stats."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get progress across all topics
        progress = UserProgress.objects.filter(user=user)
        total_completed_levels = sum(p.highest_level_completed for p in progress)
        total_questions = sum(p.total_questions_answered for p in progress)
        total_correct = sum(p.correct_answers for p in progress)
        
        return Response({
            'xp': user.xp,
            'level': user.level,
            'current_hearts': user.current_hearts,
            'max_hearts': user.max_hearts,
            'current_streak': user.current_streak,
            'longest_streak': user.longest_streak,
            'total_completed_levels': total_completed_levels,
            'total_questions_answered': total_questions,
            'total_correct_answers': total_correct,
            'accuracy': round(total_correct / total_questions * 100, 1) if total_questions > 0 else 0,
        })


class UserDailyStatsView(APIView):
    """Get user's daily stats including challenges progress."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        today = timezone.now().date()
        
        # Get today's quiz attempts
        today_attempts = QuizAttempt.objects.filter(
            user=user,
            started_at__date=today,
            completed=True
        )
        
        quizzes_completed_today = today_attempts.count()
        perfect_scores_today = today_attempts.filter(score=F('total_questions')).count()
        
        # Calculate best streak today (consecutive correct answers in any quiz)
        best_streak_today = 0
        for attempt in today_attempts:
            if attempt.hearts_lost == 0:
                best_streak_today = max(best_streak_today, attempt.score)
        
        # Recent activity (last 6 completed quizzes)
        recent_attempts = QuizAttempt.objects.filter(
            user=user,
            completed=True
        ).select_related('topic').order_by('-completed_at')[:6]
        
        recent_activity = []
        for attempt in recent_attempts:
            time_ago = self._time_ago(attempt.completed_at)
            # Use actual topic icon URL if available, fallback to hardcoded icon name
            topic_icon = self._get_topic_icon(attempt.topic.name)
            if attempt.topic.icon_file:
                topic_icon = request.build_absolute_uri(attempt.topic.icon_file.url)
            
            recent_activity.append({
                'id': str(attempt.id),
                'type': 'quiz',
                'topic': attempt.topic.name,
                'score': f"{attempt.score}/{attempt.total_questions}",
                'xp': attempt.xp_earned,
                'time': time_ago,
                'icon': topic_icon,
            })
        
        # Daily challenges
        daily_challenges = [
            {
                'id': 1,
                'title': 'Quick Learner',
                'description': 'Complete 3 quizzes today',
                'progress': min(quizzes_completed_today, 3),
                'total': 3,
                'xpReward': 150,
                'icon': 'Target',
                'color': 'from-blue-500 to-cyan-500',
            },
            {
                'id': 2,
                'title': 'Perfect Score',
                'description': 'Get 100% on any quiz',
                'progress': min(perfect_scores_today, 1),
                'total': 1,
                'xpReward': 200,
                'icon': 'Star',
                'color': 'from-yellow-500 to-orange-500',
            },
            {
                'id': 3,
                'title': 'Streak Master',
                'description': 'Answer 5 questions correctly in a row',
                'progress': min(best_streak_today, 5),
                'total': 5,
                'xpReward': 100,
                'icon': 'Flame',
                'color': 'from-orange-500 to-red-500',
            },
        ]
        
        # Calculate hours until midnight reset
        now = timezone.now()
        midnight = now.replace(hour=0, minute=0, second=0, microsecond=0) + timezone.timedelta(days=1)
        hours_until_reset = int((midnight - now).total_seconds() / 3600)
        
        return Response({
            'quizzes_completed_today': quizzes_completed_today,
            'perfect_scores_today': perfect_scores_today,
            'best_streak_today': best_streak_today,
            'daily_challenges': daily_challenges,
            'recent_activity': recent_activity,
            'hours_until_reset': hours_until_reset,
        })
    
    def _time_ago(self, dt):
        if not dt:
            return 'Unknown'
        now = timezone.now()
        diff = now - dt
        seconds = diff.total_seconds()
        
        if seconds < 60:
            return 'Just now'
        elif seconds < 3600:
            mins = int(seconds / 60)
            return f'{mins} minute{"s" if mins > 1 else ""} ago'
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f'{hours} hour{"s" if hours > 1 else ""} ago'
        elif seconds < 172800:
            return 'Yesterday'
        else:
            days = int(seconds / 86400)
            return f'{days} days ago'
    
    def _get_topic_icon(self, topic_name):
        icons = {
            'JavaScript': 'javascript',
            'Python': 'python',
            'HTML': 'html',
            'CSS': 'css',
            'React': 'react',
            'TypeScript': 'typescript',
            'Node.js': 'nodejs',
            'Java': 'java',
            'C++': 'cpp',
            'SQL': 'sql',
            'Bash': 'bash',
        }
        return icons.get(topic_name, 'code')


class UserCertificatesView(APIView):
    """Get all certificates (completed topics) for a user."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get all topics where user has completed all levels
        completed_topics = []
        
        user_progress_list = UserProgress.objects.filter(user=user).select_related('topic', 'topic__category', 'topic__certificate')
        
        for progress in user_progress_list:
            topic = progress.topic
            certificate = topic.certificate  # Get the certificate for this topic
            
            # Check if all levels are completed
            if progress.highest_level_completed >= topic.total_levels:
                # Get completion date (when final level was first passed)
                final_attempt = QuizAttempt.objects.filter(
                    user=user,
                    topic=topic,
                    level=topic.total_levels,
                    passed=True
                ).order_by('completed_at').first()
                
                completion_date = final_attempt.completed_at.isoformat() if final_attempt and final_attempt.completed_at else None
                
                # Best persisted stars per level
                level_stars = {}
                attempts = QuizAttempt.objects.filter(
                    user=user,
                    topic=topic,
                    passed=True,
                ).values('level', 'stars')

                for attempt in attempts:
                    level = attempt['level']
                    stars = attempt['stars']
                    if level not in level_stars or stars > level_stars[level]:
                        level_stars[level] = stars
                
                total_stars = sum(level_stars.values())
                
                # Get icon URL with fallback chain: certificate → topic → category
                icon_url = None
                if certificate.icon_file:
                    icon_url = request.build_absolute_uri(certificate.icon_file.url)
                elif topic.icon_file:
                    icon_url = request.build_absolute_uri(topic.icon_file.url)
                elif topic.category.icon_file:
                    icon_url = request.build_absolute_uri(topic.category.icon_file.url)
                
                # Get certificate title and description
                cert_title = certificate.get_title()
                cert_description = certificate.description or f"For successfully completing the {topic.name} course at CodeLogic Academy"
                
                completed_topics.append({
                    'id': str(topic.id),
                    'topicId': topic.slug,
                    'topicName': topic.name,
                    'topicIcon': icon_url,  # Now returns actual URL or None
                    'category': topic.category.name,
                    'categorySlug': topic.category.slug,
                    'completedAt': completion_date,
                    'totalStars': total_stars,
                    'maxStars': topic.total_levels * 3,
                    'totalLevels': topic.total_levels,
                    'totalXpEarned': progress.total_xp_earned,
                    'accentColor': topic.category.color,  # Use category color
                    'certificateTitle': cert_title,
                    'certificateDescription': cert_description,
                })
        
        # Sort by completion date (most recent first)
        completed_topics.sort(key=lambda x: x['completedAt'] or '', reverse=True)
        
        return Response({
            'certificates': completed_topics,
            'total': len(completed_topics),
        })


class LearningResourceListView(APIView):
    """List all active learning resources with filtering."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        resources = LearningResource.objects.filter(is_active=True)
        
        # Search filter
        search = request.query_params.get('search', '').strip()
        if search:
            resources = resources.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(language__icontains=search)
            )
        
        # Category filter
        category = request.query_params.get('category', '').strip()
        if category and category != 'all':
            resources = resources.filter(category=category)
        
        # Language filter
        language = request.query_params.get('language', '').strip()
        if language and language != 'all':
            resources = resources.filter(language__iexact=language)
        
        # Get unique values for filters
        all_resources = LearningResource.objects.filter(is_active=True)
        categories = list(all_resources.values_list('category', flat=True).distinct())
        languages = list(all_resources.values_list('language', flat=True).distinct())
        
        serializer = LearningResourceListSerializer(resources, many=True, context={'request': request})
        
        return Response({
            'resources': serializer.data,
            'total': resources.count(),
            'filters': {
                'categories': categories,
                'languages': sorted(languages),
            }
        })


class LearningResourceDetailView(APIView):
    """Get a single learning resource by slug."""
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        try:
            resource = LearningResource.objects.get(slug=slug, is_active=True)
        except LearningResource.DoesNotExist:
            return Response({'error': 'Resource not found'}, status=status.HTTP_404_NOT_FOUND)

        # Increment view count
        resource.increment_views()

        serializer = LearningResourceDetailSerializer(resource, context={'request': request})
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Django-admin helper: serve a verification photo as a JPEG response.
# Linking to a real URL avoids the long-data-URI bug in some browsers where
# new tabs render blank until reloaded.
# ---------------------------------------------------------------------------

@staff_member_required
@cache_control(private=True, max_age=300)
def admin_verification_photo(request, attempt_id):
    try:
        attempt = QuizAttempt.objects.only('verification_photo').get(pk=attempt_id)
    except QuizAttempt.DoesNotExist:
        raise Http404
    photo = attempt.verification_photo
    if not photo:
        raise Http404
    return HttpResponse(bytes(photo), content_type='image/jpeg')


# ---------------------------------------------------------------------------
# Django-admin: render a user's earned certificate as HTML.
# Mirrors the frontend cert template (frontend/src/lib/certTemplate.ts) so
# admins can preview / print any user's cert without leaving Django admin.
# ---------------------------------------------------------------------------

_SKILLS_BY_CATEGORY = {
    'frontend': ['HTML', 'CSS', 'JavaScript', 'Responsive Design', 'Accessibility'],
    'backend': ['APIs', 'Databases', 'Authentication', 'Server Logic', 'Security'],
    'data': ['Data Structures', 'Algorithms', 'Analysis', 'Visualisation', 'Problem Solving'],
    'mobile': ['UI Components', 'State Management', 'Navigation', 'Native APIs', 'App Lifecycle'],
    'ai': ['Models', 'Training', 'Inference', 'Evaluation', 'Ethics'],
    'ml': ['Models', 'Training', 'Inference', 'Evaluation', 'Ethics'],
}


def _skills_for_category(category_slug, topic_name):
    key = (category_slug or '').lower()
    for k, v in _SKILLS_BY_CATEGORY.items():
        if k in key:
            return v
    return ['Concepts', 'Syntax', 'Practical Application', 'Best Practices', topic_name]


class RenderPdfView(APIView):
    """
    Accepts a posted HTML document, returns the rendered PDF as an
    `application/pdf` download response.

    Strategy: shell out to a locally-installed Chrome/Chromium via
    `--headless --print-to-pdf`. Uses the user's existing browser - no
    GTK/WeasyPrint install needed on Windows, no extra Python package.
    Chrome's PDF output respects the cert's `@page` rules so the saved
    PDF is automatically A4 landscape with zero margins.

    Authenticated users only - keeps this from being abused as a public
    HTML-to-PDF service.
    """
    permission_classes = [IsAuthenticated]
    MAX_BYTES = 2_000_000

    # Common locations for Chrome / Chromium on each OS we care about.
    _CHROME_CANDIDATES = [
        # DigitalOcean App Platform - bin/post_compile installs Chrome here.
        os.path.expanduser('~/.local/chrome/chrome'),
        # Windows
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
        os.path.expanduser(r'~\AppData\Local\Google\Chrome\Application\chrome.exe'),
        # Linux (system installs)
        '/usr/bin/google-chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
        # macOS
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ]

    @classmethod
    def _find_chrome(cls):
        for c in cls._CHROME_CANDIDATES:
            if c and os.path.exists(c):
                return c
        return None

    @staticmethod
    def _render_with_chrome(chrome_path, html_bytes):
        """Run headless Chrome to render HTML -> PDF. Raises on failure."""
        with tempfile.TemporaryDirectory() as tmpdir:
            tmp = pathlib.Path(tmpdir)
            html_file = tmp / 'cert.html'
            pdf_file = tmp / 'cert.pdf'
            html_file.write_bytes(html_bytes)
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

    def post(self, request):
        html_bytes = request.body
        if not html_bytes:
            return Response({'error': 'Empty body'}, status=status.HTTP_400_BAD_REQUEST)
        if len(html_bytes) > self.MAX_BYTES:
            return Response({'error': 'HTML too large'}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

        chrome = self._find_chrome()
        pdf_bytes = None
        engine_used = None

        # Engine 1: local Chrome via subprocess. Best quality, used on dev
        # machines with Chrome installed and on any prod host where chromium
        # is reachable from PATH.
        if chrome is not None:
            try:
                pdf_bytes = self._render_with_chrome(chrome, html_bytes)
                engine_used = 'chrome'
            except Exception as exc:  # noqa: BLE001 - try the fallback
                chrome_error = str(exc)[:300]
            else:
                chrome_error = None
        else:
            chrome_error = 'chrome-not-found'

        # Engine 2: WeasyPrint server-side. Used on hosts where Chrome isn't
        # available (notably DigitalOcean App Platform's Ubuntu containers
        # where `chromium-browser` apt is unreliable). Renders direct from
        # HTML using libpango/libcairo from the Aptfile.
        if pdf_bytes is None:
            try:
                from weasyprint import HTML  # type: ignore[import-not-found]
                pdf_bytes = HTML(string=html_bytes.decode('utf-8')).write_pdf()
                engine_used = 'weasyprint'
            except ImportError:
                return Response(
                    {'error': 'No PDF engine available on this host.',
                     'code': 'NO_PDF_ENGINE',
                     'chrome_error': chrome_error},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
            except Exception as exc:  # noqa: BLE001
                return Response(
                    {'error': f'WeasyPrint render error: {exc}',
                     'chrome_error': chrome_error},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        if not pdf_bytes:
            return Response(
                {'error': 'PDF render produced no output.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        filename = request.GET.get('filename') or 'certificate.pdf'
        filename = ''.join(c for c in filename if c.isalnum() or c in '-_.')
        if not filename.lower().endswith('.pdf'):
            filename += '.pdf'

        response = HttpResponse(pdf_bytes, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


@staff_member_required
def admin_view_certificate(request, user_certificate_id):
    """
    Render the dark-purple cert for any UserCertificate row. Staff-only.
    Linked from the UserCertificate admin's "View" column.
    """
    uc = get_object_or_404(
        UserCertificate.objects.select_related(
            'user', 'certificate', 'certificate__topic', 'certificate__topic__category',
        ),
        pk=user_certificate_id,
    )
    user = uc.user
    topic = uc.certificate.topic
    category = topic.category

    icon_url = None
    if topic.icon_file:
        icon_url = request.build_absolute_uri(topic.icon_file.url)
    elif uc.certificate.icon_file:
        icon_url = request.build_absolute_uri(uc.certificate.icon_file.url)

    user_name = user.display_name or user.username

    context = {
        'user_name': user_name,
        'topic_name': topic.name,
        'topic_display': uc.certificate.title or topic.name,
        'topic_icon_url': icon_url,
        'category': category.name if category else 'programming',
        'completion_date_str': uc.completion_date.strftime('%B %d, %Y') if uc.completion_date else '',
        'certificate_id': uc.certificate_code or str(uc.id),
        'skills': _skills_for_category(
            category.slug if category else '', topic.name,
        ),
    }
    return render(request, 'game/admin_certificate.html', context)


