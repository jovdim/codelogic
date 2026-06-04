"""DFD Level 2 - decomposition of Process 1.0 User & Auth Management.

Sub-processes are derived from accounts/views.py: RegisterView,
VerifyEmailView, ResendVerificationView, LoginView, RequestUnlockView,
LogoutView, PasswordResetRequestView + PasswordResetConfirmView,
ProfileView / ChangePasswordView / UpdateAvatarView, LoginFaceVerifyView.
"""
from pathlib import Path
from _dfd_lib import render_dfd

OUT = Path(__file__).parent / "04_dfd_level2_1_auth.png"

render_dfd(
    OUT,
    title=("1.0", "User & Auth Management"),
    rows=[
        {
            "proc_num": "1.1",
            "proc_lines": ["Register", "Account"],
            "entities": [
                ("Guest", "Registration Form", "Account Created Msg"),
                ("Email Service", "Verification Email Sent", "Email Address"),
            ],
            "stores": [
                ("D1", "Users", "Insert User Row", "Email Uniqueness Check"),
                ("D2", "Email Tokens", "Issue Verify Token", None),
            ],
        },
        {
            "proc_num": "1.2",
            "proc_lines": ["Verify Email", "/ Reactivate"],
            "entities": [
                ("Guest", "Verification Token", "Verified / Activated Msg"),
            ],
            "stores": [
                ("D2", "Email Tokens", "Lookup Token", "Token Record"),
                ("D1", "Users", "Set is_email_verified=true", "User Lookup"),
            ],
        },
        {
            "proc_num": "1.3",
            "proc_lines": ["Resend", "Verification Email"],
            "entities": [
                ("Guest", "Email Address", "Generic Response"),
                ("Email Service", "Verification Link Email", None),
            ],
            "stores": [
                ("D2", "Email Tokens", "Issue New Token", None),
                ("D1", "Users", "Find by Email", "User State"),
            ],
        },
        {
            "proc_num": "1.4",
            "proc_lines": ["Authenticate", "& Issue JWT"],
            "entities": [
                ("Guest", "Email + Password", "Access + Refresh Tokens"),
                ("Student", "Login Request", "JWT Pair / Profile"),
                ("Teacher", "Login Request", "Session (via /admin/login/)"),
                ("Admin", "Login Request", "Session / JWT Pair"),
            ],
            "stores": [
                ("D1", "Users", "Update failed_login_attempts", "Password Hash + Status"),
                ("D2", "Email Tokens", "Issue Lockout Token", None),
            ],
        },
        {
            "proc_num": "1.5",
            "proc_lines": ["Request Account", "Unlock"],
            "entities": [
                ("Guest", "Locked Account Email", "Generic Response"),
                ("Email Service", "Reactivation Email", None),
            ],
            "stores": [
                ("D1", "Users", "Find Locked Account", "Account Status"),
                ("D2", "Email Tokens", "Issue Reactivation Token", None),
            ],
        },
        {
            "proc_num": "1.6",
            "proc_lines": ["Reset", "Password"],
            "entities": [
                ("Guest", "Email / New Password + Token", "Reset Confirmation"),
                ("Email Service", "Password Reset Link", None),
            ],
            "stores": [
                ("D3", "Reset Tokens", "Issue / Lookup Token", "Token Record"),
                ("D1", "Users", "Update Password Hash", None),
            ],
        },
        {
            "proc_num": "1.7",
            "proc_lines": ["Logout"],
            "entities": [
                ("Student", "Refresh Token", "Logout Confirmation"),
                ("Teacher", "End Session", "Logout Confirmation"),
                ("Admin", "Refresh Token", "Logout Confirmation"),
            ],
            "stores": [
                ("D4", "Blacklist Tokens", "Blacklist Refresh Token", None),
            ],
        },
        {
            "proc_num": "1.8",
            "proc_lines": ["Update Profile", "/ Password / Avatar"],
            "entities": [
                ("Student", "Profile / Password / Avatar Changes", "Updated Profile"),
            ],
            "stores": [
                ("D1", "Users", "Update Profile Fields", "Current Profile"),
            ],
        },
        {
            "proc_num": "1.9",
            "proc_lines": ["Record Login-Face", "Snapshot"],
            "entities": [
                ("Student", "JPEG Face Snapshot", "Capture Confirmation"),
            ],
            "stores": [
                ("D5", "Face Snapshots", "Append Snapshot Row", None),
                ("D1", "Users", "Mirror Latest Snapshot", None),
            ],
        },
    ],
)

print(f"Wrote {OUT}")
