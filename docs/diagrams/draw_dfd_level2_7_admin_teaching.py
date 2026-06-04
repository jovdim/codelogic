"""DFD Level 2 - decomposition of Process 7.0 User Administration & Teaching.

Sub-processes derived from accounts/admin.py (Django admin UserAdmin: role /
status / gamification edits, bulk actions, CSV import, face-snapshot review),
accounts/teacher_views.py (the /teacher/ portal: list / create / view / edit /
toggle / reset-password / delete assigned students + scoped report PDFs), and
core/urls.py (admin dashboard + superuser-only report PDFs).

Two privileged actors:
  * Teacher  - server-rendered /teacher/ portal, scoped to assigned students
               (the student<->teacher M2M on the Users table).
  * Admin    - Django admin, full reach over every user + content model.
"""
from pathlib import Path
from _dfd_lib import render_dfd

OUT = Path(__file__).parent / "04_dfd_level2_7_admin_teaching.png"

render_dfd(
    OUT,
    title=("7.0", "User Administration & Teaching"),
    rows=[
        {
            "proc_num": "7.1",
            "proc_lines": ["Admin: Manage Users", "Roles & Status"],
            "entities": [
                ("Admin", "Edit Role / Status / Gamification, Bulk + CSV Import", "Users Saved"),
            ],
            "stores": [
                ("D1", "Users", "Insert / Update (role, is_active, XP, teachers M2M)", "User Rows"),
            ],
        },
        {
            "proc_num": "7.2",
            "proc_lines": ["Teacher: List /", "Search Students"],
            "entities": [
                ("Teacher", "Search + Year / Section Filter", "Assigned Student List"),
            ],
            "stores": [
                ("D1", "Users", "Read Students via teachers M2M", "Scoped Student Rows"),
            ],
        },
        {
            "proc_num": "7.3",
            "proc_lines": ["Teacher: Create Student", "(+ Reference Face)"],
            "entities": [
                ("Teacher", "New Student Form + Face Photo", "Student Created"),
                ("Browser Camera", "Webcam / Upload JPEG", "Capture Trigger"),
            ],
            "stores": [
                ("D1", "Users", "Create Student, Save base_face_photo, Auto-Assign Teacher", None),
            ],
        },
        {
            "proc_num": "7.4",
            "proc_lines": ["View Student Detail", "& Face Review"],
            "entities": [
                ("Teacher", "Open Assigned Student", "Profile + Stats + Face Grid"),
                ("Admin", "Open Any User", "Profile + Stats + Face Grid"),
            ],
            "stores": [
                ("D1", "Users", "Read Profile + Reference Photo", "User Row"),
                ("D5", "Login Face Snapshots", "Read Snapshot History", "Snapshot Rows"),
                ("D10", "Quiz Attempts", "Read Last 20 Attempts", "Attempt Rows"),
            ],
        },
        {
            "proc_num": "7.5",
            "proc_lines": ["Edit Student / Toggle", "Status / Reset Password"],
            "entities": [
                ("Teacher", "Profile / Stats Edits, Toggle, Reset", "Student Updated"),
                ("Email Service", "Password Reset Link", None),
            ],
            "stores": [
                ("D1", "Users", "Update Profile / Stats / is_active / verified", "User Row"),
                ("D3", "Reset Tokens", "Issue Reset Token (rate-limited)", None),
            ],
        },
        {
            "proc_num": "7.6",
            "proc_lines": ["Generate Quiz", "Report PDF"],
            "entities": [
                ("Teacher", "Scoped Report Request (mine / per-student)", "PDF Report"),
                ("Admin", "All-Students Report Request", "PDF Report"),
                ("PDF Engine", "Render Command", "PDF Bytes"),
            ],
            "stores": [
                ("D10", "Quiz Attempts", "Read Completed Attempts (scoped)", "Attempt Rows"),
                ("D1", "Users", "Resolve Student Names", "User Rows"),
            ],
        },
        {
            "proc_num": "7.7",
            "proc_lines": ["Admin Dashboard", "& Trends"],
            "entities": [
                ("Admin", "Open Dashboard", "Totals + 30-Day Trend Charts"),
            ],
            "stores": [
                ("D1", "Users", "Count + Signup Trend", "User Rows"),
                ("D10", "Quiz Attempts", "Attempt Trend Series", "Attempt Rows"),
            ],
        },
    ],
)

print(f"Wrote {OUT}")
