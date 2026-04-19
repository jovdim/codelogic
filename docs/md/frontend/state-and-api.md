# Talking to the Server

How the website gets and saves data.

## The API Helper

File: `src/lib/api.ts`

It uses **Axios** — a small library for making HTTP requests.

It exports two grouped helpers:

### `authAPI`
Functions for login/signup/account stuff.

```ts
authAPI.register({ email, username, password, password_confirm })
authAPI.login({ email, password })
authAPI.logout(refreshToken)
authAPI.verifyEmail(token)
authAPI.resendVerification(email)
authAPI.getProfile()
authAPI.updateProfile({ display_name, bio })
authAPI.updateAvatar(1)
authAPI.changePassword({ current_password, new_password, new_password_confirm })
authAPI.requestPasswordReset(email)
authAPI.validateResetToken(token)
authAPI.confirmPasswordReset({ token, new_password, new_password_confirm })
authAPI.deleteAccount({ password, confirm_text: "DELETE" })
authAPI.checkUsername(username)
authAPI.checkEmail(email)
```

### `gameAPI`
Functions for quiz stuff.

```ts
gameAPI.getCategories()
gameAPI.getTopic(categorySlug, topicSlug)
gameAPI.getQuizQuestions(categorySlug, topicSlug, level)
gameAPI.submitAnswer({ question_id, answer, attempt_id })
gameAPI.completeQuiz({ category_slug, topic_slug, level, score, total_questions, hearts_lost })
gameAPI.getLeaderboard()
gameAPI.getUserStats()
gameAPI.getDailyStats()
gameAPI.getCertificates()
gameAPI.getResources({ search?, category?, language? })
gameAPI.getResource(slug)
```

## How the Token Works

When you log in, the server sends two tokens:

- `access_token` — used on every request
- `refresh_token` — used when the access one expires

Both are saved in `localStorage`.

Every request gets the access token added automatically:

```
Authorization: Bearer <access_token>
```

If the server responds with **401 Unauthorized**, the Axios helper:

1. Uses the refresh token to ask for a new access token.
2. Retries the failed request with the new one.
3. If the refresh also fails → clears tokens → redirects to `/login`.

## The Auth Context

File: `src/contexts/AuthContext.tsx`

Every page can do:

```tsx
const {
  user,              // the current user (or null)
  isLoading,         // true while checking the token on page load
  isAuthenticated,   // true if user is not null
  login,             // (email, password) => Promise
  logout,            // () => Promise
  register,          // (email, username, password, passwordConfirm) => Promise
  updateUser,        // set user in state (no server call)
  updateUserHearts,  // update just hearts
  refreshUser,       // re-fetch the profile from server
} = useAuth();
```

When the site loads:

1. Check localStorage for an access token.
2. If found, call `authAPI.getProfile()`.
3. Save the user in state.

## The Cache

File: `src/lib/dataCache.ts`

A tiny in-memory object that lives as long as the tab is open.

```ts
setCache("leaderboard", data);
const cached = getCached<LeaderboardEntry[]>("leaderboard");  // returns null if missing or expired
invalidateCache("leaderboard");  // force-refresh next time
invalidateCache();                // clear everything
```

Default lifetime: 60 seconds. Pages that fetch the leaderboard, topic list, or category list use this so navigating back to them is instant.

## When to Refresh the User

Anywhere XP, hearts, or streak might have changed. The quiz runtime does this:

- After losing a heart → `updateUserHearts(newCount)`.
- After finishing a quiz → `refreshUser()` so the sidebar shows the new XP/level/streak.
