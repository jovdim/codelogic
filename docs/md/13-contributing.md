# 13. Working on the Code

A short guide for working on CodeLogic.

## Getting Set Up

See [How to Set It Up](./04-setup-guide.md).

## Commit Messages

Use a short prefix followed by a plain description.

- `feat:` — a new feature
- `fix:` — a bug fix
- `refactor:` — tidying up code
- `docs:` — docs changes

Example: `feat: add cooldown to resend button`

## Branches

The main branch is `main`. Make changes on a new branch and open a pull request.

## Adding New Quiz Content

The easy way: use the admin panel at `/admin/`. See [Admin Panel Guide](./backend/admin-panel.md).

The code way (for bigger imports): edit the seed files in `backend/game/management/commands/`, then run:

```bash
python manage.py seed_questions
python manage.py seed_lessons
```

## Adding a New API Endpoint

1. Open `backend/game/views.py` or `backend/accounts/views.py`.
2. Add a new view class.
3. Add a URL for it in the same app's `urls.py`.
4. Add a matching function in `frontend/src/lib/api.ts`.
5. Call it from a page or component.

## Adding a New Page

Next.js uses the folder structure. To make `/my-page`:

1. Make the folder `frontend/src/app/my-page/`.
2. Make a file inside called `page.tsx`.
3. Export a React component from it.

Needs login? Wrap the page with `<ProtectedRoute>` and `<Sidebar>`.

Public? Wrap with `<Navbar>`.

## Adding a New Database Table

1. Add a model class in `backend/game/models.py` (or `models_settings.py`).
2. Run `python manage.py makemigrations` and `python manage.py migrate`.
3. Add an entry in `admin.py` so it shows in the admin panel.
4. If it needs an API, add a view and URL.

## Style Rules

- TypeScript on the frontend — don't use `any` without a reason.
- Use the color variables (like `var(--primary)`) instead of hard-coded hex codes.
- Icons: Lucide first. Use `react-icons/di` for language logos.
- Don't make your own `<audio>` tags — use the sound effect hook.

## Testing

There are no automated tests yet. Before a pull request, test by hand:

- Register → verify → login → dashboard
- Play a quiz and finish it (try both passing and failing)
- Lose all hearts and check the message
- Finish a full topic and check the certificate
- Toggle music and navigate pages — it should keep playing
