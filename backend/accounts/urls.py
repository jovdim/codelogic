"""
URL configuration for accounts app.
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    VerifyEmailView,
    ResendVerificationView,
    ProfileView,
    ChangePasswordView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    ValidateResetTokenView,
    DeleteAccountView,
    CheckUsernameView,
    CheckEmailView,
    UpdateAvatarView,
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Email verification
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend_verification'),
    
    # Password management
    path('password/change/', ChangePasswordView.as_view(), name='change_password'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password/reset/validate/', ValidateResetTokenView.as_view(), name='validate_reset_token'),
    
    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('avatar/', UpdateAvatarView.as_view(), name='update_avatar'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),
    
    # Utilities
    path('check-username/', CheckUsernameView.as_view(), name='check_username'),
    path('check-email/', CheckEmailView.as_view(), name='check_email'),
]
