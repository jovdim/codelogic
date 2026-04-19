# Colors and Style

How the site looks.

## Tailwind

The site uses **Tailwind CSS v4**. You write classes directly in the JSX.

```tsx
<div className="flex items-center gap-2 p-4 rounded-lg bg-white/5">
  ...
</div>
```

The `postcss.config.mjs` file loads the Tailwind plugin.

## Design Tokens

All main colors and sizes are defined in `src/app/globals.css` at the top. Use these instead of hard-coded colors.

Main colors:

```css
--primary: #7c3aed;         /* purple */
--primary-light: #a78bfa;
--secondary: #10b981;       /* green */
--accent: #f59e0b;          /* amber */
--danger: #ef4444;          /* red */
--success: #22c55e;
--warning: #eab308;
--info: #3b82f6;
```

Backgrounds:

```css
--background: #0f0f1a;          /* page background */
--background-secondary: #1a1a2e;
--card-bg: #1a1a2e;
```

Text:

```css
--foreground: #e2e2f0;          /* main text */
--foreground-secondary: #a1a1b5;
--muted: #6b7280;
```

To use one in JSX:

```tsx
<div style={{ color: "var(--primary)" }}>Purple text</div>
```

Or in a CSS class (globals.css):

```css
.btn-primary {
  background: var(--primary);
  color: white;
}
```

## Fonts

Three fonts loaded in `src/app/layout.tsx` using `next/font/google`:

- **Geist** — main body text.
- **Geist Mono** — code blocks.
- **Space Grotesk** — display/titles.

Each is wired up as a CSS variable: `--font-geist-sans`, `--font-geist-mono`, `--font-display`.

## Pixel Style

There are some custom utility classes in `globals.css` for the pixel-art look:

- `.pixel-box` — boxes with sharp corners, pixel-art-style border.
- `.btn-primary`, `.btn-secondary` — main button styles.
- `.input-field` — text inputs.

Check `globals.css` for the full list.

## Icons

- **Lucide React** (`lucide-react`) — the default icon pack. Example: `<Heart className="w-5 h-5" />`.
- **React Icons** (`react-icons/di`) — for language logos: DiPython, DiJavascript1, etc.
- **TopicIcon** component — use this when you need a topic icon with automatic fallbacks.

## Responsive

The site works on mobile. Key classes:

- `md:hidden` — hide on medium screens and up.
- `md:flex` — show as flex on medium screens and up.
- `max-w-7xl mx-auto` — center content with a max width.

The sidebar turns into a slide-out menu on mobile (uses the hamburger icon).

## Animations

Done with CSS transitions (`transition-all`, `duration-300`) or the `ScrollAnimations` components for reveal-on-scroll effects.

`canvas-confetti` is used for celebratory confetti when you finish a level.
