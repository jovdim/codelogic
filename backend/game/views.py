"""
Views for game API - quizzes, progress, hearts/XP management.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import F, Q, Count, Sum
import random

from .models import Category, Topic, Question, QuizAttempt, UserProgress, LearningResource
from .serializers import (
    CategorySerializer, TopicSerializer, TopicWithProgressSerializer,
    QuestionSerializer, LeaderboardUserSerializer,
    LearningResourceListSerializer, LearningResourceDetailSerializer
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
            topic_count=Count('topics', filter=Q(topics__is_active=True)),
            total_questions=Count('topics__questions', filter=Q(topics__questions__is_active=True))
        ).order_by('order', 'name')
        
        result = []
        for cat in categories:
            topics = cat.topics.filter(is_active=True).order_by('order', 'name')
            topic_names = [t.name for t in topics]
            
            # Calculate total XP for category (sum of all questions XP)
            total_xp = Question.objects.filter(
                topic__category=cat, 
                is_active=True
            ).aggregate(total=Sum('xp_reward'))['total'] or 0
            
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
                'topicCount': cat.topic_count,
                'totalQuestions': cat.total_questions,
                'totalXP': total_xp,
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
            question_count=Count('questions', filter=Q(questions__is_active=True))
        ).order_by('order', 'name')
        
        # Calculate total XP
        total_xp = Question.objects.filter(
            topic__category=category,
            is_active=True
        ).aggregate(total=Sum('xp_reward'))['total'] or 0
        
        # Build category icon URL
        category_icon_url = None
        if category.icon_file:
            category_icon_url = request.build_absolute_uri(category.icon_file.url)
        
        topics_data = []
        for topic in topics:
            topic_xp = topic.questions.filter(is_active=True).aggregate(
                total=Sum('xp_reward')
            )['total'] or 0
            
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
                'xpReward': topic_xp,
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
    """Get questions for a specific level."""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, category_slug, topic_slug, level):
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
        
        # Create a quiz attempt
        attempt = QuizAttempt.objects.create(
            user=user,
            topic=topic,
            level=level,
            total_questions=len(questions)
        )
        
        serializer = QuestionSerializer(questions, many=True)
        return Response({
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
    """Submit an answer and get result."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        question_id = request.data.get('question_id')
        answer = request.data.get('answer')
        
        if question_id is None or answer is None:
            return Response({'error': 'Missing question_id or answer'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)
        
        user = request.user
        is_correct = (answer == question.correct_answer)
        xp_earned = 0
        heart_lost = False
        
        if is_correct:
            xp_earned = question.xp_reward
        else:
            if user.current_hearts > 0:
                user.current_hearts -= 1
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
    """Complete a quiz and record results."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        category_slug = request.data.get('category_slug')
        topic_slug = request.data.get('topic_slug')
        level = request.data.get('level')
        score = request.data.get('score', 0)
        total_questions = request.data.get('total_questions', 0)
        hearts_lost = request.data.get('hearts_lost', 0)
        
        try:
            topic = Topic.objects.get(category__slug=category_slug, slug=topic_slug)
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)
        
        user = request.user
        passed = score >= (total_questions * 0.5)  # 50% to pass
        
        # Calculate XP (base 10 per correct + bonuses)
        xp_earned = score * XP_PER_CORRECT
        if score == total_questions and total_questions > 0:
            xp_earned += XP_BONUS_PERFECT  # +50 for perfect score
        if hearts_lost == 0 and score > 0:
            xp_earned += XP_BONUS_NO_HEARTS_LOST  # +25 for no hearts lost
        
        # Update streak (by calendar day at midnight)
        today = timezone.now().date()
        from datetime import timedelta
        yesterday = today - timedelta(days=1)
        
        if user.last_activity_date is None:
            # First activity ever (shouldn't happen, but handle it)
            user.current_streak = 1
            user.longest_streak = max(user.longest_streak, 1)
        elif user.last_activity_date == today:
            # Already played today, no streak change
            pass
        elif user.last_activity_date == yesterday:
            # Played yesterday, increment streak
            user.current_streak += 1
            user.longest_streak = max(user.longest_streak, user.current_streak)
        else:
            # Missed a day or more, reset streak to 1
            user.current_streak = 1
        
        user.last_activity_date = today
        
        # Update user XP (hearts already deducted during quiz via SubmitAnswerView)
        user.xp += xp_earned
        user.save()
        
        # Update progress
        progress, created = UserProgress.objects.get_or_create(
            user=user, topic=topic,
            defaults={'current_level': 1}
        )
        
        if passed and level >= progress.current_level:
            progress.highest_level_completed = max(progress.highest_level_completed, level)
            progress.current_level = level + 1
        progress.total_xp_earned += xp_earned
        progress.total_questions_answered += total_questions
        progress.correct_answers += score
        progress.save()
        
        # Record attempt
        QuizAttempt.objects.create(
            user=user, topic=topic, level=level,
            score=score, total_questions=total_questions,
            xp_earned=xp_earned, hearts_lost=hearts_lost,
            completed=True, passed=passed, completed_at=timezone.now()
        )
        
        return Response({
            'passed': passed,
            'xp_earned': xp_earned,
            'new_level': progress.current_level,
            'total_xp': user.xp,
            'current_streak': user.current_streak,
        })


class LeaderboardView(APIView):
    """Get leaderboard."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        limit = int(request.query_params.get('limit', 100))
        # Exclude staff and superusers from leaderboard
        users = User.objects.filter(
            is_active=True,
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
            recent_activity.append({
                'id': str(attempt.id),
                'type': 'quiz',
                'topic': attempt.topic.name,
                'score': f"{attempt.score}/{attempt.total_questions}",
                'xp': attempt.xp_earned,
                'time': time_ago,
                'icon': self._get_topic_icon(attempt.topic.name),
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
        
        user_progress_list = UserProgress.objects.filter(user=user).select_related('topic', 'topic__category')
        
        for progress in user_progress_list:
            topic = progress.topic
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
                
                # Calculate stars
                level_stars = {}
                attempts = QuizAttempt.objects.filter(
                    user=user,
                    topic=topic,
                    passed=True
                ).values('level', 'score', 'total_questions')
                
                for attempt in attempts:
                    level = attempt['level']
                    score_pct = attempt['score'] / attempt['total_questions'] if attempt['total_questions'] > 0 else 0
                    if score_pct >= 1.0:
                        stars = 3
                    elif score_pct >= 0.8:
                        stars = 2
                    else:
                        stars = 1
                    if level not in level_stars or stars > level_stars[level]:
                        level_stars[level] = stars
                
                total_stars = sum(level_stars.values())
                
                # Get icon URL with fallback chain: topic → category
                icon_url = None
                if topic.icon_file:
                    icon_url = request.build_absolute_uri(topic.icon_file.url)
                elif topic.category.icon_file:
                    icon_url = request.build_absolute_uri(topic.category.icon_file.url)
                
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
