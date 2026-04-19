# Components

Reusable pieces of the site. Lives in `src/components/`.

## Layout

### `Navbar.tsx`
The top bar shown on public pages. Has:

- Logo (links to home)
- Nav links (Learn, Leaderboard, How to Play, About)
- Right side: login/register buttons (or avatar + XP + streak if logged in)
- Music on/off button
- Mobile menu (hamburger)

### `Sidebar.tsx`
The side menu for logged-in users. Has:

- Dashboard, Play, Certificates (private links)
- Learn, Leaderboard, How to Play, About (public links)
- Settings, Log out at the bottom
- Avatar + hearts + streak at the top
- Heart countdown (time till next heart)
- Can be collapsed to icons only
- Becomes a slide-out menu on mobile

### `Footer.tsx`
Simple footer. Shown at the bottom of every public page. Links and copyright.

## Auth

### `AuthLayout.tsx`
A minimal page shell for login/register/verify pages. Centered card with the logo on top.

### `RouteGuards.tsx`
Two components:
- `<ProtectedRoute>` — blocks unauthenticated users.
- `<PublicRoute>` — redirects authenticated users away.

Both show a loading spinner while checking.

### `LoginOverlay.tsx`
A modal shown on the landing page. When guests click "Start Playing", it asks them to log in or register.

## UI

### `Modal.tsx`
A generic pop-up modal. Exports:

- `<Modal>` — the container.
- `<ModalButton>` — styled button to use inside.

Used for logout confirmation, level failed, level complete, etc.

### `ScrollAnimations.tsx`
Three small components:
- `<ScrollReveal>` — fades elements in as you scroll to them.
- `<ScrollProgressBar>` — a bar at the top of the page that fills as you scroll.
- `<ScrollToTop>` — a button bottom-right that scrolls to top.

### `TopicIcon.tsx`
Inline SVG icons for each programming language. Fallback to a generic code icon.

Supported names: `javascript`, `python`, `html`, `css`, `react`, `typescript`, `nodejs`, `java`, `cpp`, `sql`, `bash`.

Used when the backend doesn't have an icon uploaded for a topic.

## Other

### `GlobalClickSound.tsx`
Attaches a click listener to the whole document. Plays a click sound on any button. Added in the root layout so it's active everywhere.

## Reading Order

If you're new, start with:

1. `layout/Navbar.tsx` — to see how the public shell works.
2. `layout/Sidebar.tsx` — for the logged-in shell.
3. `auth/RouteGuards.tsx` — for how pages are protected.
4. `ui/Modal.tsx` — for how popups work.
