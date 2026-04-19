# Frontend (The Website)

The website is what users see and click. It's built with **Next.js** and **React**.

## What's Inside

- [How it's built](./architecture.md) — The main parts.
- [Pages and URLs](./routing.md) — Every page and what it does.
- [Components](./components.md) — Reusable pieces.
- [Talking to the server](./state-and-api.md) — How data goes back and forth.
- [Music and sound](./audio-system.md) — The audio system.
- [Colors and style](./styling.md) — Theme and design.

## Main Folders

```
frontend/
├── public/              Images, sounds, logos.
├── src/
│   ├── app/             All the pages.
│   ├── components/      Reusable pieces (Navbar, Modal, etc.).
│   ├── contexts/        Shared state (who is logged in).
│   ├── hooks/           Custom React hooks (music, sound).
│   ├── lib/             Helper files (API, cache).
│   └── types/           TypeScript types.
├── package.json         List of packages.
├── next.config.ts       Next.js settings.
└── tsconfig.json        TypeScript settings.
```

## Running It

```bash
npm install          # install packages (first time)
npm run dev          # start the site at http://localhost:3000
npm run build        # build it for the internet
npm run start        # run the built version
```

## How Pages Work

Next.js uses the folder name as the URL.

- `src/app/page.tsx` → `/`
- `src/app/login/page.tsx` → `/login`
- `src/app/play/[category]/page.tsx` → `/play/frontend` (the `[category]` is a variable)

Each page file exports a React component.
