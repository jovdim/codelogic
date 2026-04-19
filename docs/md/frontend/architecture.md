# How the Frontend is Built

## The Shell

When you open any page, this is the layout:

1. `src/app/layout.tsx` — the root shell. Sets up fonts, wraps everything in the `AuthProvider` (so the site knows who's logged in), and adds a global click sound.
2. The page component runs inside that.

Pages are either:

- **Public** (landing, login, register, leaderboard) — wrapped with `<Navbar>`
- **Private** (dashboard, play, settings, certificates) — wrapped with `<Sidebar>` and `<ProtectedRoute>`

## Who's Logged In?

The `AuthProvider` (in `src/contexts/AuthContext.tsx`) keeps track of the current user. Any component can use:

```tsx
const { user, isAuthenticated, login, logout } = useAuth();
```

When the site loads, it looks for an access token in localStorage. If found, it asks the server `/api/auth/profile/` to get the user info. If that fails, the tokens are wiped.

## Route Guards

Two small components control access:

- `<ProtectedRoute>` — if not logged in, sends you to `/login`.
- `<PublicRoute>` — if already logged in, sends you to `/dashboard` (used on login and register).

## Talking to the Server

All server calls go through **Axios** in `src/lib/api.ts`. Every request automatically:

1. Attaches the access token.
2. If the server says "401 Unauthorized", the Axios interceptor tries to refresh the token and retries.
3. If the refresh also fails, it sends the user to `/login`.

Two grouped objects are exported:
- `authAPI` — register, login, profile, password stuff.
- `gameAPI` — categories, topics, quiz, leaderboard, resources.

## Cache

`src/lib/dataCache.ts` is a tiny in-memory cache. Pages that fetch the same data more than once (like the leaderboard) use it to avoid extra requests. The cache lives for 60 seconds by default.

## Music and Sound

Two custom hooks:

- `useBackgroundMusic()` — plays the loop. Shared across pages (singleton audio).
- `useSoundEffects()` — plays the right/wrong/click sounds for the quiz.

See [Music and Sound](./audio-system.md).

## Styling

- **Tailwind CSS 4** — used for most classes.
- **Design tokens** — main colors, borders, gradients are defined as CSS variables in `src/app/globals.css`. Use `var(--primary)` etc. to stay consistent.
- **Fonts** — Geist (body), Geist Mono (code), Space Grotesk (display titles), all loaded by Next.js.

## Icons

- **Lucide React** — general icons (hearts, arrows, stars).
- **React Icons** — language logos (JavaScript, HTML, Python, etc.) via `react-icons/di`.

## Types

`src/types/index.ts` has TypeScript shapes for:

- `User`
- `AuthTokens`
- `LoginResponse`
- `RegisterResponse`
- `ApiError`

Good to import in pages so TypeScript can catch bad code.
