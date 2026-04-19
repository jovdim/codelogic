# 10. Playing a Quiz

Step by step, what happens when a user plays.

## 1. Pick a Topic

User clicks **Play** in the sidebar.

- They see all categories (Frontend, Backend, etc.).
- They click a category and see its topics.
- They click a topic and see the **level map** (levels 1–15).

Levels they've already finished show stars (1, 2, or 3). Future levels are locked until they pass the one before.

## 2. Start a Level

User clicks an unlocked level. The website asks the server for the quiz. The server:

1. **Refills hearts** based on how long it's been since the last heart update (1 heart every 2 minutes).
2. If the user has 0 hearts → it blocks the quiz and sends back an error.
3. Picks the questions for this level, **shuffles** them, and takes up to 10.
4. Starts a "quiz attempt" record (used for saving the result later).
5. Sends back: the lessons, the questions, how many hearts the user has, and the attempt ID.

## 3. Lessons First

Before the questions, the user sees a few lesson slides. Each slide has:

- A short title
- Explanation text
- Sometimes a code example
- Sometimes a quick tip

User clicks Next to go through them. Then the quiz starts.

## 4. Answer Questions

For each question:

1. The question appears with a code block (if the question needs one).
2. User picks an answer (or types it for fill-in-the-blank).
3. The site sends the answer to the server.
4. The server checks it.

**If correct:** the user earns XP. A "correct" sound plays.

**If wrong:** the user loses 1 heart. A "wrong" sound plays. The correct answer and explanation are shown.

The hearts counter in the sidebar updates right away.

## 5. Finish the Quiz

When all questions are done (or when hearts hit 0), the website sends the final result to the server. The server:

1. Checks if the user **passed** (50% or more).
2. Calculates **XP earned**:
   - 10 XP for each correct answer
   - **+50 bonus** for a perfect score
   - **+25 bonus** for finishing with no hearts lost
3. Updates the **streak**:
   - First time today? → streak goes up by 1.
   - Already played today? → no change.
   - Missed a day? → streak resets to 1.
4. Adds XP to the user's total (and levels them up if they crossed 500 XP).
5. **Unlocks the next level** if they passed.
6. Saves the final result.

Then the user sees a results screen. Confetti for a perfect run. Fail screen (with a Retry button) if they didn't pass.

## 6. Certificates

If a user passes **all 15 levels** of a topic, they get a certificate. It shows up in **/certificates**. They can click it to open a printable version.

Each certificate has a unique code (like `CL-JAVA-A1B2C3D4`) that can be used to verify it.

## 7. Dashboard Updates

The dashboard also shows:

- **Daily Challenges** — three goals per day (finish 3 quizzes, get 100%, answer 5 in a row right). Finish them for bonus XP. Reset at midnight.
- **Recent Activity** — your last 6 quizzes.
- **Recommended Topics** — topics you haven't tried yet.
- **Achievements** — badges you unlock at levels 2, 4, 7, 10, 15.

## 8. Leaderboard

The top 15 players are shown on the leaderboard. Ranked by XP. If two have the same XP, the one with the bigger streak wins. Admin users are hidden from this list.
