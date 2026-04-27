"""
Serializers for user authentication and profile management.
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import EmailVerificationToken, PasswordResetToken

User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm']
    
    def validate_email(self, value):
        """Validate email is unique."""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value.lower()
    
    def validate_username(self, value):
        """Validate username is unique and follows rules."""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('A user with this username already exists.')
        if len(value) < 3:
            raise serializers.ValidationError('Username must be at least 3 characters long.')
        if not value.isalnum() and '_' not in value:
            raise serializers.ValidationError('Username can only contain letters, numbers, and underscores.')
        return value
    
    def validate_password(self, value):
        """Validate password strength."""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, attrs):
        """Validate passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs
    
    def create(self, validated_data):
        """Create user with validated data."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            is_active=True,
            is_email_verified=False
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate_email(self, value):
        return value.lower()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile viewing and updating."""
    member_since = serializers.SerializerMethodField()
    days_since_joined = serializers.SerializerMethodField()
    can_change_display_name = serializers.SerializerMethodField()
    next_display_name_change = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'display_name',
            'last_display_name_change',
            'can_change_display_name',
            'next_display_name_change',
            'avatar',
            'bio',
            'is_email_verified',
            'is_staff',
            'date_joined',
            'member_since',
            'days_since_joined',
            'last_active',
            'xp',
            'level',
            'current_hearts',
            'max_hearts',
            'last_heart_update',
            'current_streak',
            'longest_streak',
        ]
        read_only_fields = [
            'id',
            'email',
            'is_email_verified',
            'is_staff',
            'date_joined',
            'last_active',
            'xp',
            'level',
            'current_hearts',
            'max_hearts',
            'last_heart_update',
            'current_streak',
            'longest_streak',
        ]
    
    def get_member_since(self, obj):
        """Return formatted join date."""
        return obj.date_joined.strftime('%B %d, %Y')
    
    def get_days_since_joined(self, obj):
        """Return number of days since user joined."""
        from django.utils import timezone
        delta = timezone.now() - obj.date_joined
        return delta.days
    
    def get_can_change_display_name(self, obj):
        """Check if user can change display name."""
        can_change, _ = obj.can_change_display_name()
        return can_change
    
    def get_next_display_name_change(self, obj):
        """Return when user can next change display name."""
        _, next_allowed = obj.can_change_display_name()
        return next_allowed.isoformat() if next_allowed else None


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate_new_password(self, value):
        """Validate new password strength."""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, attrs):
        """Validate new passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'New passwords do not match.'
            })
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset."""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        return value.lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset."""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, write_only=True)
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate_new_password(self, value):
        """Validate new password strength."""
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, attrs):
        """Validate new passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords do not match.'
            })
        return attrs


class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification."""
    token = serializers.CharField(required=True)


class ResendVerificationSerializer(serializers.Serializer):
    """Serializer for resending verification email."""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        return value.lower()


class DeleteAccountSerializer(serializers.Serializer):
    """Serializer for account deletion confirmation."""
    password = serializers.CharField(required=True, write_only=True)
    confirm_text = serializers.CharField(required=True)
    
    def validate_confirm_text(self, value):
        """Validate user typed DELETE to confirm."""
        if value != 'DELETE':
            raise serializers.ValidationError('Please type DELETE to confirm account deletion.')
        return value
