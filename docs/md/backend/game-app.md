# Backend: Game (Quizzes)

This folder handles everything about the quiz: topics, questions, scores, certificates.

Location: [backend/game/](../../../backend/game/)

## Tables

### `Category`
A top-level group like "Frontend" or "Backend". Has a name, color, and icon.

### `Topic`
A subject like JavaScript or Python. Belongs to a category. Default: 15 levels. Has its own icon (or falls back to the category's).

### `Question`
A quiz question. Belongs to a topic and a level. Has:

- `question_type` — one of: `multiple-choice`, `find-error`, `fill-blank`, `output`
- `question_text`
- `code_snippet` (optional) — code shown below the question
- `options` — a list of 4 choices
- `correct_answer` — the index of the right option (0, 1, 2, or 3)
- `explanation` — shown after answering
- `xp_reward` — default 10

### `Lesson`
A teaching slide shown before the quiz starts for a level. Has a title, content, an optional code example, and an optional tip.

### `UserProgress`
Tracks how far each user has gone in each topic. Saves `current_level`, `highest_level_completed`, and totals.

### `QuizAttempt`
A record of each time a user plays a quiz. Saves score, XP earned, hearts lost, etc.

### `Certificate`
One for each topic. Created automatically when a topic is added. Has an optional custom title, description, and icon.

### `UserCertificate`
Created when a user finishes all 15 levels of a topic. Has a unique code like `CL-JAVA-A1B2C3D4`.

### `LearningResource`
A PDF guide shown in the **Learn** section. Has title, description, language, category, difficulty.

### `SiteSettings`
A single row for site-wide settings. Only admins touch it.

### `Announcement`
News items shown on the site. Can be pinned.

## Main Views (API URLs)

See the [full list](./api-endpoints.md). Quick summary:

| URL | What it does |
|---|---|
| `GET /api/game/categories/` | List all categories. |
| `GET /api/game/categories/<slug>/` | One category with all its topics. |
| `GET /api/game/topics/<cat>/<topic>/` | One topic + the user's progress. |
| `GET /api/game/quiz/<cat>/<topic>/<level>/` | Start a quiz. |
| `POST /api/game/answer/` | Submit one answer. |
| `POST /api/game/complete/` | Finish a quiz. |
| `GET /api/game/leaderboard/` | Top 15 players. |
| `GET /api/game/stats/` | Your personal stats. |
| `GET /api/game/daily-stats/` | Daily challenges + recent activity. |
| `GET /api/game/certificates/` | Your certificates. |
| `GET /api/game/resources/` | Learning resource list. |
| `GET /api/game/resources/<slug>/` | One learning resource. |

## The Numbers (XP, Hearts, etc.)

These are set in `backend/game/views.py`:

```
HEART_REGEN_MINUTES = 2      (1 heart per 2 minutes)
XP_PER_CORRECT = 10
XP_BONUS_PERFECT = 50
XP_BONUS_NO_HEARTS_LOST = 25
```

Full math in [Game Rules](./gamification-mechanics.md).

## Auto-Created Certificates

When an admin adds a new topic, a **certificate row is created automatically** via a signal. You don't need to make it by hand. You only need to edit its title/description/icon if you want custom ones.
