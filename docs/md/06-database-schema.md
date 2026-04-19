# 6. Database

The database is where all info is saved — users, quiz questions, scores, etc. Think of it like a set of spreadsheets (called tables).

The full map is in [../erd.dbml](../../erd.dbml). You can paste that file at https://dbdiagram.io to see a picture.

## User Tables

### `users`
This is where accounts are saved.

Important columns:
- `email`, `username`, `password` (hidden/scrambled)
- `display_name` — the name shown on your profile
- `avatar` — a number 1 to 5
- `is_email_verified` — if your email is confirmed
- `xp`, `level` — your points and level
- `current_hearts`, `max_hearts` — your lives
- `current_streak`, `longest_streak` — days in a row played

### `email_verification_tokens`
Short-lived codes emailed to you when you sign up. They last 24 hours.

### `password_reset_tokens`
Short-lived codes emailed when you forget your password. They last 1 hour.

## Quiz Tables

### `categories`
Groups of topics. For example "Frontend", "Backend", "DevOps".

### `topics`
Things you can learn. Like JavaScript, Python, CSS. Each one belongs to a category.

### `questions`
The actual quiz questions. Each one belongs to a topic and a level. Has the question, 4 options, the correct answer, and an explanation.

### `lessons`
Short teaching slides shown before the quiz questions at a level.

## Progress Tables

### `user_progress`
Tracks how far each user has gone in each topic. Stores highest level they've finished.

### `quiz_attempts`
One row every time a user plays a quiz. Saves their score, XP earned, hearts lost, etc.

## Certificate Tables

### `certificates`
One per topic. Created automatically when a topic is added. Describes what the certificate is.

### `user_certificates`
When a user finishes all 15 levels of a topic, a row here is added. Each gets a unique code like `CL-JAVA-A1B2C3D4`.

## Other Tables

### `learning_resources`
The PDF guides in the Learn section. Has title, description, language, a PDF file, and a view count.

### `site_settings`
One row for site-wide settings. Things like site name, max hearts, feature switches. Only admins can edit it.

### `announcements`
News items shown on the site. Can be pinned, and can have an expiry date.

## Relationships (a quick chart)

```
User ────────< UserProgress >──── Topic ────< Question
 │                                  │
 │                                  └───< Lesson
 │
 └────────< QuizAttempt >──── Topic
 │
 └────────< UserCertificate >──── Certificate ──1:1── Topic
                                  
Topic ────> Category

LearningResource (standalone)
SiteSettings (just one row)
Announcement (standalone)
```
