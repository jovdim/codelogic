# How the Backend is Built

## What Happens on Each Request

When someone visits an API URL, this is roughly what happens:

1. The request arrives.
2. Django checks if CORS is okay (can this website talk to us?).
3. If logged in, it checks the access token.
4. Django looks up which "view" handles this URL.
5. The view does the work (asks the database, etc.).
6. It sends back JSON.

## URL Map

All URL routes are listed in [core/urls.py](../../../backend/core/urls.py):

| URL | What it does |
|---|---|
| `/admin/` | Django admin panel. |
| `/admin/dashboard/` | Custom overview page for admins. |
| `/api/auth/...` | All the login / account stuff. |
| `/api/game/...` | All the quiz stuff. |

## Apps

Django groups related code into "apps". This project has two:

### `accounts`
Everything about users: sign up, log in, change password, delete account.

### `game`
Everything about the quiz: categories, topics, questions, lessons, progress, certificates, and site settings.

## Login System

Login is done with **JWT tokens** — two small strings:

- **Access token** — works for 60 minutes.
- **Refresh token** — works for 7 days. Used to get a new access token.

Both are made by a library called `djangorestframework-simplejwt`. Every logged-in API call sends the access token in the `Authorization` header.

## Database

- Uses **PostgreSQL** when online.
- Uses **SQLite** (a local file) when testing.
- Every table has a UUID as its ID (a long random string).

## Files and Images

Uploaded files (icons, PDFs) are saved in the `backend/media/` folder by default. If you set `USE_SPACES=True`, they go to cloud storage instead.

## Admin Panel

The admin panel is the built-in Django one, with extra customization:

- Title changed to "CodeLogic Admin".
- Custom templates for the dashboard and the topic edit page.
- Each model has a friendly list view with colors, icons, and bulk actions.

## Site Settings

There's a single `SiteSettings` row in the database. Admins edit it to change site-wide things like:

- Site name and tagline
- Max hearts per user
- XP per correct answer
- Feature on/off switches (maintenance mode, registration, leaderboard)

## Debug Mode

When `DEBUG=True`:

- You see a "Debug Toolbar" at the side of the page.
- Errors show full details.

When `DEBUG=False` (for online):

- Errors show a simple page.
- No debug toolbar.
