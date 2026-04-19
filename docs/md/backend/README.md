# Backend (The Server)

The backend is the brain. It saves users, questions, scores, and everything else. It also has the admin panel where admins add new quizzes.

It's built with **Django** (a Python framework). It exposes data at `/api/`. It has an admin page at `/admin/`.

## What's Inside

- [How it's built](./architecture.md) — The pieces and how they fit.
- [Accounts (users + login)](./accounts-app.md) — Signup, login, profile.
- [Game (quizzes)](./game-app.md) — Topics, questions, progress.
- [List of API URLs](./api-endpoints.md) — Every URL the website can call.
- [Admin Panel Guide](./admin-panel.md) — How to add content without coding.
- [Helpful Commands](./management-commands.md) — Things you can run from the terminal.
- [Game Rules](./gamification-mechanics.md) — The exact math for XP, hearts, streaks.

## Main Folders

```
backend/
├── core/        Django settings and main URL list.
├── accounts/    Users, login, password.
├── game/        Quizzes, progress, certificates.
├── templates/   Custom admin pages.
├── media/       Uploaded files.
├── manage.py    Used to run Django commands.
├── Procfile     Used when deploying.
└── requirements.txt
```

## Running It

```bash
python manage.py runserver          # start the server
python manage.py migrate            # update the database
python manage.py createsuperuser    # make an admin account
python manage.py seed_questions     # load sample quizzes
```
