# List of API URLs

Every URL the website uses to talk to the server.

Base URL (local): `http://localhost:8000/api`

**Auth** means the user must be logged in. **Public** means anyone can use it.

## Login / Accounts

### `POST /api/auth/register/` — Public
Make a new account.
```
Body: { email, username, password, password_confirm }
```
Sends a verification email.

### `POST /api/auth/verify-email/` — Public
Confirm an email using the token from the email.
```
Body: { token }
```

### `POST /api/auth/resend-verification/` — Public
Send the verification email again.
```
Body: { email }
```

### `POST /api/auth/login/` — Public
Log in.
```
Body: { email, password }
Returns: { tokens: { access, refresh }, user: {...} }
```

### `POST /api/auth/logout/` — Auth
Log out.
```
Body: { refresh }
```

### `POST /api/auth/token/refresh/` — Public
Get a new access token.
```
Body: { refresh }
Returns: { access, refresh }
```

### `GET /api/auth/profile/` — Auth
See your profile. Also refills hearts.

### `PATCH /api/auth/profile/` — Auth
Change display name or bio.
```
Body: { display_name?, bio? }
```

### `PATCH /api/auth/avatar/` — Auth
Change your avatar.
```
Body: { avatar: 1-5 }
```

### Password URLs

| URL | Method | Auth | Body |
|---|---|---|---|
| `/api/auth/password/change/` | POST | Yes | `{ current_password, new_password, new_password_confirm }` |
| `/api/auth/password/reset/` | POST | No | `{ email }` |
| `/api/auth/password/reset/validate/?token=` | GET | No | — |
| `/api/auth/password/reset/confirm/` | POST | No | `{ token, new_password, new_password_confirm }` |

### `POST /api/auth/delete-account/` — Auth
Delete your account (soft delete).
```
Body: { password, confirm_text: "DELETE" }
```

### Name checks (live while typing)
- `GET /api/auth/check-username/?username=abc`
- `GET /api/auth/check-email/?email=x@y.com`

## Game

### `GET /api/game/categories/` — Public
All categories with a list of topic names in each.

### `GET /api/game/categories/<slug>/` — Public
One category with every topic inside it.

### `GET /api/game/topics/<cat>/<topic>/` — Public
One topic. If you're logged in, it includes your progress.

### `GET /api/game/quiz/<cat>/<topic>/<level>/` — Auth
Start a quiz. Refills hearts first. Rejects if you have 0 hearts.
```
Returns: {
  lessons: [...],
  questions: [...up to 10...],
  topic, level,
  hearts,
  attempt_id
}
```

### `POST /api/game/answer/` — Auth
Submit one answer.
```
Body: { question_id, answer, attempt_id }
Returns: { correct, correct_answer, explanation, xp_earned, heart_lost, hearts_remaining }
```

### `POST /api/game/complete/` — Auth
Finish a quiz. Updates XP, streak, progress.
```
Body: { category_slug, topic_slug, level, score, total_questions, hearts_lost }
Returns: { passed, xp_earned, new_level, total_xp, current_streak }
```

### `GET /api/game/leaderboard/` — Public
Top 15 players.

### `GET /api/game/stats/` — Auth
Your overall stats (XP, level, hearts, accuracy).

### `GET /api/game/daily-stats/` — Auth
Today's numbers + daily challenges + recent activity.

### `GET /api/game/certificates/` — Auth
Your earned certificates.

### Learning Resources
- `GET /api/game/resources/?search=&category=&language=` — Public
- `GET /api/game/resources/<slug>/` — Auth (increments view count)
