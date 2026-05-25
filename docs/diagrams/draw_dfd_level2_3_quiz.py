"""DFD Level 2 - decomposition of Process 3.0 Quiz Engine.

Sub-processes are derived from game/views.py: QuizQuestionsView (start),
SubmitAnswerView (per-question), QuestionTimeoutView (30s timer expiry),
and CompleteQuizView (final scoring + XP + progress + streak update).
"""
from pathlib import Path
from _dfd_lib import render_dfd

OUT = Path(__file__).parent / "04_dfd_level2_3_quiz.png"

render_dfd(
    OUT,
    title=("3.0", "Quiz Engine"),
    rows=[
        {
            "proc_num": "3.1",
            "proc_lines": ["Start Quiz Attempt", "(Serve Questions)"],
            "entities": [
                ("Student", "Topic + Level Selection", "Questions + Lessons + attempt_id"),
            ],
            "stores": [
                ("D1", "Users", "Read Hearts (regenerate)", "current_hearts"),
                ("D8", "Questions", "Pick + Shuffle 10 Questions", "Question Rows"),
                ("D9", "Lessons", "Read Lessons for Level", "Lesson Rows"),
                ("D10", "Quiz Attempts", "Create Attempt Row", None),
            ],
        },
        {
            "proc_num": "3.2",
            "proc_lines": ["Validate & Score", "Answer"],
            "entities": [
                ("Student", "question_id, attempt_id, answer / answer_text", "Correct? + Explanation + XP + Hearts"),
            ],
            "stores": [
                ("D8", "Questions", "Read Question + Correct Answer", "Question Row"),
                ("D10", "Quiz Attempts", "Validate Attempt Ownership", "Attempt Row"),
                ("D11", "User Answers", "Persist Answer (idempotent)", None),
                ("D1", "Users", "Deduct Heart on Wrong Answer", "current_hearts"),
            ],
        },
        {
            "proc_num": "3.3",
            "proc_lines": ["Handle Question", "Timeout (30s)"],
            "entities": [
                ("Student", "attempt_id (timer expired)", "Heart Lost + Remaining"),
            ],
            "stores": [
                ("D10", "Quiz Attempts", "Increment hearts_lost", "Attempt Row"),
                ("D1", "Users", "Deduct Heart", "current_hearts"),
            ],
        },
        {
            "proc_num": "3.4",
            "proc_lines": ["Complete Quiz", "(Final Scoring)"],
            "entities": [
                ("Student", "attempt_id, hearts_lost", "Passed? + Score + Stars + XP"),
            ],
            "stores": [
                ("D11", "User Answers", "Count Correct Answers", "Authoritative Score"),
                ("D10", "Quiz Attempts", "Mark completed + Persist Stars / XP", "Attempt Row"),
                ("D7", "User Progress", "Bump current_level / highest_level", "Progress Row"),
                ("D1", "Users", "Award XP + Update Streak", "User Row"),
            ],
        },
    ],
)

print(f"Wrote {OUT}")
