# Backend: Accounts (Users + Login)

This folder handles everything about user accounts.

Location: [backend/accounts/](../../../backend/accounts/)

## Tables

### `User`
The main user table. Login is by **email**, not username.

Important fields:
- `email`, `username`, `password`
- `display_name` — the name you want to show
- `avatar` — a number 1 to 5
- `bio` — a short description
- `is_active` — is the account on?
- `is_email_verified` — did they confirm their email?
- `xp`, `level`
- `current_hearts`, `max_hearts`
- `current_streak`, `longest_streak`, `last_activity_date`

### `EmailVerificationToken`
A short code that gets emailed to new users. Lasts 24 hours.

### `PasswordResetToken`
A short code for resetting passwords. Lasts 1 hour.

## What Each View Does

| URL | What it does |
|---|---|
| `POST /api/auth/register/` | Make a new account and send a verification email. |
| `POST /api/auth/verify-email/` | Confirm the email using the token from the email. |
| `POST /api/auth/resend-verification/` | Send the verification email again. |
| `POST /api/auth/login/` | Log in and get tokens. |
| `POST /api/auth/logout/` | Log out (marks the refresh token invalid). |
| `POST /api/auth/token/refresh/` | Get a new access token using the refresh token. |
| `GET /api/auth/profile/` | See your profile. Also refills hearts. |
| `PATCH /api/auth/profile/` | Change your display name or bio. |
| `PATCH /api/auth/avatar/` | Change your avatar (1–5). |
| `POST /api/auth/password/change/` | Change your password. |
| `POST /api/auth/password/reset/` | Request a password reset email. |
| `GET /api/auth/password/reset/validate/` | Check if a reset token is still valid. |
| `POST /api/auth/password/reset/confirm/` | Set a new password using the token. |
| `POST /api/auth/delete-account/` | Delete your account. Type the password and `DELETE` to confirm. |
| `GET /api/auth/check-username/` | See if a username is free (used while typing). |
| `GET /api/auth/check-email/` | See if an email is free. |

## Hearts Auto-Refill

Every time a user reads their profile or starts a quiz, the server checks: "How long since their hearts were updated?". If it's been more than 2 minutes, it adds back hearts — 1 per 2 minutes, up to the max (10).

## Display Name Cooldown

Users can only change their display name **once every 3 days**. The server tracks `last_display_name_change` and rejects changes within that window.

## Delete Account = Soft Delete

Deleting doesn't actually erase data. It just sets `is_active = False`. The user can't log in anymore, but the admin can bring the account back.

## Admin Panel Extras

The admin panel's user list has extras:

- Colored "Level" badge
- Hearts counter (like `8/10`)
- Streak (like `6 days`)
- Bulk actions: verify email, reset hearts, add XP, reset XP, activate/deactivate
