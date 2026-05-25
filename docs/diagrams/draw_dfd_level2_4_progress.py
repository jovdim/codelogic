"""DFD Level 2 - decomposition of Process 4.0 Progress & Gamification.

Sub-processes derived from game/views.py and accounts/views.py:
heart regeneration (ProfileView._regenerate_hearts), XP / streak /
progress updates (inside CompleteQuizView), plus the read-only
UserStatsView, UserDailyStatsView, and LeaderboardView dashboards.
"""
from pathlib import Path
from _dfd_lib import render_dfd

OUT = Path(__file__).parent / "04_dfd_level2_4_progress.png"

render_dfd(
    OUT,
    title=("4.0", "Progress & Gamification"),
    rows=[
        {
            "proc_num": "4.1",
            "proc_lines": ["Regenerate Hearts", "(time-based)"],
            "entities": [
                ("Student", "Profile / Quiz-Start Request", "Refreshed Hearts"),
            ],
            "stores": [
                ("D1", "Users", "Read last_heart_update + current_hearts",
                 "Updated Hearts + Timestamp"),
            ],
        },
        {
            "proc_num": "4.2",
            "proc_lines": ["Award XP", "(per quiz)"],
            "entities": [
                ("Process 3.4", "Score + hearts_lost", "XP Awarded"),
            ],
            "stores": [
                ("D1", "Users", "Add XP (10/correct + 50 perfect + 25 no-hearts-lost)",
                 "Updated XP"),
                ("D7", "User Progress", "Add to total_xp_earned", None),
            ],
        },
        {
            "proc_num": "4.3",
            "proc_lines": ["Update Daily", "Streak"],
            "entities": [
                ("Process 3.4", "Completion Date", "Streak + Longest Streak"),
            ],
            "stores": [
                ("D1", "Users",
                 "Compare last_activity_date vs today / yesterday",
                 "Streak Row"),
            ],
        },
        {
            "proc_num": "4.4",
            "proc_lines": ["Update Topic", "Progress"],
            "entities": [
                ("Process 3.4", "Level + passed flag", "New current_level"),
            ],
            "stores": [
                ("D7", "User Progress",
                 "Bump current_level / highest_level_completed",
                 "Progress Row"),
            ],
        },
        {
            "proc_num": "4.5",
            "proc_lines": ["View User Stats"],
            "entities": [
                ("Student", "Stats Request", "XP / Level / Streak / Accuracy"),
            ],
            "stores": [
                ("D1", "Users", "Read XP / Hearts / Streak", "User Row"),
                ("D7", "User Progress", "Aggregate Levels + Accuracy", "Progress Rows"),
            ],
        },
        {
            "proc_num": "4.6",
            "proc_lines": ["View Daily Stats", "& Challenges"],
            "entities": [
                ("Student", "Daily Stats Request",
                 "Today's Attempts + Challenges + Recent Activity"),
            ],
            "stores": [
                ("D10", "Quiz Attempts",
                 "Today's + Recent Attempts", "Attempt Rows"),
            ],
        },
        {
            "proc_num": "4.7",
            "proc_lines": ["View Leaderboard"],
            "entities": [
                ("Guest", "Leaderboard Request", "Ranked User List"),
                ("Student", "Leaderboard Request", "Ranked User List"),
            ],
            "stores": [
                ("D1", "Users",
                 "Read Verified Non-Staff Users (sorted by XP)",
                 "User Rows"),
            ],
        },
    ],
)

print(f"Wrote {OUT}")
