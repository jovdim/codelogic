"""
Views for user authentication and profile management.
"""

from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from django.utils import timezone

from .models import EmailVerificationToken, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    EmailVerificationSerializer,
    ResendVerificationSerializer,
    DeleteAccountSerializer,
)

User = get_user_model()


def send_verification_email(user, token):
    """Send email verification link to user."""
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token.token}"
    
    subject = 'Verify your CodeLogic account'
    
    # Plain text version (keep it short to avoid line wrapping issues)
    text_content = f"""Welcome to CodeLogic!

Verify your email: {verification_url}

This link expires in 24 hours.

- The CodeLogic Team"""
    
    # HTML version
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to CodeLogic!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <p style="margin: 20px 0;">
            <a href="{verification_url}" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
                Verify Email
            </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #7c3aed;">{verification_url}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, please ignore this email.</p>
        <p>- The CodeLogic Team</p>
    </body>
    </html>
    """
    
    msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)


def send_password_reset_email(user, token):
    """Send password reset link to user."""
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token.token}"
    
    subject = 'Reset your CodeLogic password'
    
    # Plain text version
    text_content = f"""Password Reset Request

Reset your password: {reset_url}

This link expires in 1 hour.

If you did not request this, please ignore this email.

- The CodeLogic Team"""
    
    # HTML version
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <p style="margin: 20px 0;">
            <a href="{reset_url}" 
               style="background-color: #7c3aed; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
            </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #7c3aed;">{reset_url}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        <p>- The CodeLogic Team</p>
    </body>
    </html>
    """
    
    msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [user.email])
    msg.attach_alternative(html_content, "text/html")
    msg.send(fail_silently=False)


class RegisterView(APIView):
    """Handle user registration with email verification."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Create and send verification token
            token = EmailVerificationToken.create_token(user)
            try:
                send_verification_email(user, token)
            except Exception as e:
                # Log the error but don't fail registration
                print(f"Failed to send verification email: {e}")
            
            return Response({
                'message': 'Registration successful. Please check your email to verify your account.',
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'username': user.username,
                    'avatar': user.avatar,
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    """Verify user email with token."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Debug: Print the received data
        print(f"DEBUG: Received data: {request.data}")
        
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            token_string = serializer.validated_data['token']
            
            # Debug: Print the token
            print(f"DEBUG: Token received: '{token_string}'")
            print(f"DEBUG: Token length: {len(token_string)}")
            
            # List all tokens in database for debugging
            all_tokens = EmailVerificationToken.objects.filter(is_used=False)
            for t in all_tokens:
                print(f"DEBUG: DB token: '{t.token}' (length: {len(t.token)})")
            
            try:
                token = EmailVerificationToken.objects.get(token=token_string)
            except EmailVerificationToken.DoesNotExist:
                print(f"DEBUG: Token not found in database!")
                return Response({
                    'error': 'Invalid verification token.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not token.is_valid():
                return Response({
                    'error': 'Verification token has expired or already been used.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify the user's email
            user = token.user
            user.is_email_verified = True
            user.save()
            
            # Mark token as used
            token.is_used = True
            token.save()
            
            return Response({
                'message': 'Email verified successfully. You can now log in.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationView(APIView):
    """Resend email verification link."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                # Don't reveal if user exists
                return Response({
                    'message': 'If an account with this email exists, a verification link has been sent.'
                }, status=status.HTTP_200_OK)
            
            if user.is_email_verified:
                return Response({
                    'message': 'This email is already verified.'
                }, status=status.HTTP_200_OK)
            
            # Create new token and send email
            token = EmailVerificationToken.create_token(user)
            try:
                send_verification_email(user, token)
            except Exception as e:
                print(f"Failed to send verification email: {e}")
            
            return Response({
                'message': 'If an account with this email exists, a verification link has been sent.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Handle user login and return JWT tokens."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({
                    'error': 'Invalid email or password.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.check_password(password):
                return Response({
                    'error': 'Invalid email or password.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_active:
                return Response({
                    'error': 'This account has been deactivated.'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.is_email_verified:
                return Response({
                    'error': 'Please verify your email before logging in.',
                    'code': 'EMAIL_NOT_VERIFIED'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Login successful.',
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Handle user logout by blacklisting refresh token."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'message': 'Logout successful.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Invalid token.'
            }, status=status.HTTP_400_BAD_REQUEST)


HEART_REGEN_MINUTES = 2  # Same as game/views.py


class ProfileView(APIView):
    """Get and update user profile."""
    permission_classes = [IsAuthenticated]
    
    def _regenerate_hearts(self, user):
        """Regenerate hearts based on time passed."""
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
    
    def get(self, request):
        # Regenerate hearts before returning profile
        self._regenerate_hearts(request.user)
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def patch(self, request):
        # Check if trying to change display_name
        new_display_name = request.data.get('display_name')
        if new_display_name is not None and new_display_name != request.user.display_name:
            can_change, next_allowed = request.user.can_change_display_name()
            if not can_change:
                return Response({
                    'error': 'You can only change your display name once every 3 days.',
                    'next_change_allowed': next_allowed.isoformat() if next_allowed else None
                }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UserProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            # Update last_display_name_change if display name was changed
            if new_display_name is not None and new_display_name != request.user.display_name:
                request.user.last_display_name_change = timezone.now()
            serializer.save()
            return Response({
                'message': 'Profile updated successfully.',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """Change user password."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            if not user.check_password(serializer.validated_data['current_password']):
                return Response({
                    'error': 'Current password is incorrect.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': 'Password changed successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """Request password reset email."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                token = PasswordResetToken.create_token(user)
                try:
                    send_password_reset_email(user, token)
                except Exception as e:
                    print(f"Failed to send password reset email: {e}")
            except User.DoesNotExist:
                pass  # Don't reveal if user exists
            
            return Response({
                'message': 'If an account with this email exists, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token."""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token_string = serializer.validated_data['token']
            
            try:
                token = PasswordResetToken.objects.get(token=token_string)
            except PasswordResetToken.DoesNotExist:
                return Response({
                    'error': 'Invalid or expired reset token.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not token.is_valid():
                return Response({
                    'error': 'Invalid or expired reset token.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset the password
            user = token.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            # Mark token as used
            token.is_used = True
            token.save()
            
            return Response({
                'message': 'Password has been reset successfully. You can now log in with your new password.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ValidateResetTokenView(APIView):
    """Validate if a reset token is still valid."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        token_string = request.query_params.get('token')
        
        if not token_string:
            return Response({
                'valid': False,
                'error': 'Token is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = PasswordResetToken.objects.get(token=token_string)
            if token.is_valid():
                return Response({
                    'valid': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'valid': False,
                    'error': 'Token has expired or already been used.'
                }, status=status.HTTP_200_OK)
        except PasswordResetToken.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Invalid token.'
            }, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    """Delete user account."""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = DeleteAccountSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            if not user.check_password(serializer.validated_data['password']):
                return Response({
                    'error': 'Password is incorrect.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Soft delete - deactivate account
            user.is_active = False
            user.save()
            
            # Or hard delete:
            # user.delete()
            
            return Response({
                'message': 'Account has been deleted successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CheckUsernameView(APIView):
    """Check if username is available."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        username = request.query_params.get('username', '')
        
        if len(username) < 3:
            return Response({
                'available': False,
                'message': 'Username must be at least 3 characters.'
            })
        
        exists = User.objects.filter(username__iexact=username).exists()
        
        return Response({
            'available': not exists,
            'message': 'Username is available.' if not exists else 'Username is already taken.'
        })


class CheckEmailView(APIView):
    """Check if email is available."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        email = request.query_params.get('email', '').lower()
        
        if not email or '@' not in email:
            return Response({
                'available': False,
                'message': 'Please enter a valid email address.'
            })
        
        exists = User.objects.filter(email__iexact=email).exists()
        
        return Response({
            'available': not exists,
            'message': 'Email is available.' if not exists else 'Email is already registered.'
        })


class UpdateAvatarView(APIView):
    """Update user avatar."""
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        avatar = request.data.get('avatar')
        
        if avatar is None:
            return Response({
                'error': 'Avatar is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            avatar = int(avatar)
        except (TypeError, ValueError):
            return Response({
                'error': 'Avatar must be a number between 1 and 5.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if avatar < 1 or avatar > 5:
            return Response({
                'error': 'Avatar must be between 1 and 5.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        request.user.avatar = avatar
        request.user.save(update_fields=['avatar'])
        
        return Response({
            'message': 'Avatar updated successfully.',
            'avatar': avatar
        }, status=status.HTTP_200_OK)
