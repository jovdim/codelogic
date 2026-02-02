"""
Serializers for game API.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Topic, Question, QuizAttempt, UserProgress, LearningResource

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color']


class TopicSerializer(serializers.ModelSerializer):
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    icon = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = ['id', 'name', 'slug', 'description', 'icon', 'total_levels', 'category_slug']
    
    def get_icon(self, obj):
        # Return icon field if set, otherwise use slug as fallback
        return obj.icon if obj.icon else obj.slug


class TopicWithProgressSerializer(serializers.ModelSerializer):
    """Topic serializer with user progress included."""
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    icon = serializers.SerializerMethodField()
    user_progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Topic
        fields = ['id', 'name', 'slug', 'description', 'icon', 'total_levels', 'category_slug', 'user_progress']
    
    def get_icon(self, obj):
        # Return icon field if set, otherwise use slug as fallback
        return obj.icon if obj.icon else obj.slug
    
    def get_user_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                progress = UserProgress.objects.get(user=request.user, topic=obj)
                
                # Get completion date (when the final level was first passed)
                completion_date = None
                if progress.highest_level_completed >= obj.total_levels:
                    final_attempt = QuizAttempt.objects.filter(
                        user=request.user,
                        topic=obj,
                        level=obj.total_levels,
                        passed=True
                    ).order_by('completed_at').first()
                    if final_attempt and final_attempt.completed_at:
                        completion_date = final_attempt.completed_at.isoformat()
                
                # Get level stars (best stars per level)
                level_stars = {}
                attempts = QuizAttempt.objects.filter(
                    user=request.user,
                    topic=obj,
                    passed=True
                ).values('level', 'score', 'total_questions')
                
                for attempt in attempts:
                    level = attempt['level']
                    # Calculate stars: 3 stars = 100%, 2 stars = 80%+, 1 star = passed
                    score_pct = attempt['score'] / attempt['total_questions'] if attempt['total_questions'] > 0 else 0
                    if score_pct >= 1.0:
                        stars = 3
                    elif score_pct >= 0.8:
                        stars = 2
                    else:
                        stars = 1
                    # Keep the best stars for each level
                    if level not in level_stars or stars > level_stars[level]:
                        level_stars[level] = stars
                
                total_stars = sum(level_stars.values())
                
                return {
                    'current_level': progress.current_level,
                    'highest_level_completed': progress.highest_level_completed,
                    'total_xp_earned': progress.total_xp_earned,
                    'total_stars': total_stars,
                    'level_stars': level_stars,
                    'completion_date': completion_date,
                }
            except UserProgress.DoesNotExist:
                pass
        return {
            'current_level': 1,
            'highest_level_completed': 0,
            'total_xp_earned': 0,
            'total_stars': 0,
            'level_stars': {},
            'completion_date': None,
        }


class QuestionSerializer(serializers.ModelSerializer):
    """Question serializer - includes all fields for quiz."""
    class Meta:
        model = Question
        fields = ['id', 'question_type', 'question_text', 'code_snippet', 'options', 'highlight_line', 'xp_reward', 'correct_answer', 'explanation']


class LeaderboardUserSerializer(serializers.ModelSerializer):
    """Serializer for leaderboard entries."""
    rank = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'avatar', 'xp', 'level', 'current_streak', 'rank']


class LearningResourceListSerializer(serializers.ModelSerializer):
    """Serializer for learning resource list view."""
    thumbnail_url = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningResource
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'language',
            'difficulty', 'pages', 'read_time', 'views',
            'thumbnail_url', 'pdf_url', 'is_featured', 'created_at'
        ]
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None
    
    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None


class LearningResourceDetailSerializer(serializers.ModelSerializer):
    """Serializer for learning resource detail view."""
    thumbnail_url = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningResource
        fields = [
            'id', 'title', 'slug', 'description', 'category', 'language',
            'difficulty', 'pages', 'read_time', 'views',
            'thumbnail_url', 'pdf_url', 'is_featured', 'created_at', 'updated_at'
        ]
    
    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None
    
    def get_pdf_url(self, obj):
        if obj.pdf_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.pdf_file.url)
            return obj.pdf_file.url
        return None
