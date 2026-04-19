# 3. Project Folders

A quick tour of what's in the project.

## The Big Picture

```
codelogic/
├── backend/       The server (Django, Python)
├── frontend/      The website (Next.js, React)
├── docs/          These docs
├── README.md      A short intro
├── DEPLOYMENT.md  How to put it online
└── erd.dbml       A map of the database tables
```

## Backend folder

```
backend/
├── manage.py              The command you use to run Django.
├── requirements.txt       List of Python packages needed.
├── Procfile               Tells the server how to start.
├── media/                 Uploaded files (images, PDFs) go here.
├── templates/             Custom admin pages.
│
├── core/                  Main Django settings.
│   ├── settings.py        All the settings.
│   ├── urls.py            Tells Django which URL goes where.
│   └── wsgi.py            Used to run the server.
│
├── accounts/              Everything about users and login.
│   ├── models.py          Defines the User table.
│   ├── views.py           The code that runs when you log in, register, etc.
│   ├── serializers.py     Turns user data into JSON.
│   ├── urls.py            URLs like /api/auth/login/.
│   └── admin.py           How users show in the admin panel.
│
└── game/                  Everything about the quiz.
    ├── models.py          Tables for topics, questions, progress, etc.
    ├── models_settings.py Site-wide settings (singleton).
    ├── views.py           Code that runs when you play the quiz.
    ├── serializers.py     Turns quiz data into JSON.
    ├── urls.py            URLs like /api/game/categories/.
    ├── admin.py           How quiz data shows in the admin panel.
    └── management/
        └── commands/      Helpful commands (like adding sample data).
```

## Frontend folder

```
frontend/
├── package.json           List of JavaScript packages needed.
├── next.config.ts         Next.js settings.
│
├── public/                Files served as-is (images, sounds).
│   ├── logo/              The CodeLogic logo.
│   ├── avatars/           The 5 user avatars.
│   ├── team/              Team photos (for the About page).
│   └── sound-effects/     Music and sounds.
│
└── src/
    ├── app/               All the pages of the website.
    │   ├── page.tsx           Home page.
    │   ├── layout.tsx         Shell shared by every page.
    │   ├── globals.css        Main styles and colors.
    │   ├── login/             /login
    │   ├── register/          /register
    │   ├── verify-email/      /verify-email
    │   ├── forgot-password/   /forgot-password
    │   ├── reset-password/    /reset-password
    │   ├── dashboard/         /dashboard (after login)
    │   ├── play/              /play (pick a topic, take a quiz)
    │   ├── learn/             /learn (PDF guides)
    │   ├── leaderboard/       /leaderboard
    │   ├── certificates/      /certificates
    │   ├── settings/          /settings
    │   ├── about/             /about
    │   └── how-to-play/       /how-to-play
    │
    ├── components/        Reusable pieces of the site.
    │   ├── auth/              Login box, route guards.
    │   ├── layout/            Navbar, sidebar, footer.
    │   └── ui/                Modal, icons, scroll effects.
    │
    ├── contexts/          Shared state.
    │   └── AuthContext.tsx    Keeps track of the logged-in user.
    │
    ├── hooks/             Custom React hooks.
    │   ├── useBackgroundMusic.ts
    │   └── useSoundEffects.ts
    │
    ├── lib/               Helpers.
    │   ├── api.ts             Sends requests to the server.
    │   ├── constants.ts       Nav links, stats shown on the home page.
    │   ├── dataCache.ts       Simple in-memory cache.
    │   └── certTemplate.ts    The printable certificate design.
    │
    └── types/             TypeScript types.
```
