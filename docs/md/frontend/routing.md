# Pages and URLs

Every page on the site, what it does, and who can see it.

## Public Pages (no login needed)

| URL | File | What it does |
|---|---|---|
| `/` | `app/page.tsx` | Landing page. Has the hero, typewriter text, demo quiz, feature list, footer. |
| `/login` | `app/login/page.tsx` | Login form. Shows "Resend verification" button if needed. |
| `/register` | `app/register/page.tsx` | Register form. Checks username/email live. |
| `/verify-email` | `app/verify-email/page.tsx` | Opens with `?token=...` from the email. Calls the server to verify. |
| `/forgot-password` | `app/forgot-password/page.tsx` | Type your email to get a reset link. |
| `/reset-password` | `app/reset-password/page.tsx` | Opens with `?token=...`. Form to pick a new password. |
| `/about` | `app/about/page.tsx` | About the project and team. |
| `/how-to-play` | `app/how-to-play/page.tsx` | Explains the game rules to new users. |
| `/leaderboard` | `app/leaderboard/page.tsx` | Top 15 players. |
| `/learn` | `app/learn/page.tsx` | PDF guides. Search + filter. |
| `/learn/[id]` | `app/learn/[id]/page.tsx` | One PDF guide. |

## Private Pages (login needed)

| URL | File | What it does |
|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Personal home. XP, hearts, streak, daily challenges, recent activity, topic list. |
| `/play` | `app/play/page.tsx` | Shows all categories. |
| `/play/[category]` | `app/play/[category]/page.tsx` | Topics in a category. |
| `/play/[category]/[topic]` | `app/play/[category]/[topic]/page.tsx` | Topic detail + level map (1–15). |
| `/play/[category]/[topic]/level/[level]` | `.../level/[level]/page.tsx` | The actual quiz. Lessons → questions → result. |
| `/certificates` | `app/certificates/page.tsx` | Your earned certificates. Clicking one opens a printable version. |
| `/settings` | `app/settings/page.tsx` | Three tabs: Profile, Password, Account. |

## How URLs with `[brackets]` Work

Next.js uses `[name]` to make a variable URL part.

- Folder `[category]` → the URL can be any word → use `params.category` in the code.
- Folder `[topic]` → any word → use `params.topic`.
- Folder `[level]` → a number → use `params.level`.

Example URL: `/play/frontend/javascript/level/3`
- category = `frontend`
- topic = `javascript`
- level = `3`

## Layout Wrappers

Each page starts by choosing a wrapper:

- **Public page** → `<Navbar>` around the content.
- **Login/register/verify pages** → `<AuthLayout>` (minimal, centered card).
- **Private page** → `<ProtectedRoute>` outside → `<Sidebar>` inside.

## Verified + Login States

Some pages redirect automatically:

- `/login` and `/register` use `<PublicRoute>`. If you're already logged in, they send you to `/dashboard`.
- Any `<ProtectedRoute>` page sends you to `/login` if you're not signed in.
