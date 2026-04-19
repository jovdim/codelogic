# Admin Panel Guide

The admin panel is where you add quizzes, topics, users, and settings. No coding needed.

URL (local): http://localhost:8000/admin/

You log in with the superuser account you made with `createsuperuser`.

## Home Pages

- **`/admin/`** — The normal Django admin home.
- **`/admin/dashboard/`** — A custom page that shows counts (users, topics, questions) and lists of recent items.

## Adding a Quiz (Step by Step)

### 1. Create a Category

**Game → Categories → Add**

- **Name** — like "Frontend"
- **Slug** — auto-fills from the name (like `frontend`)
- **Description** — a short sentence
- **Icon** — upload an image
- **Color** — a hex code (like `#7c3aed`)
- **Order** — lower numbers show first
- **Active** — uncheck to hide it

### 2. Create a Topic

**Game → Topics → Add**

- Pick the category
- Name, slug, description
- Upload an icon (or leave blank to use the category's)
- **Total levels** — default 15

A **certificate** for this topic gets created automatically.

Inside the topic edit page, you'll see:

- **Lessons** section — add lesson slides right here.
- **Existing Questions** — a list with links to edit each one.
- **Add Question** button — pre-fills the topic field.

### 3. Add Questions

**Game → Questions → Add**

- **Topic** — which topic?
- **Level** — 1 to 15
- **Question type** — multiple-choice, find-error, fill-blank, output
- **Question text** — the prompt
- **Code snippet** (optional) — code shown below the question
- **Highlight line** (for find-error) — which line has the bug
- **Options** — type a JSON list: `["A", "B", "C", "D"]`
- **Correct answer** — the index (0, 1, 2, or 3)
- **Explanation** — shown after answering
- **XP reward** — default 10

Bulk actions: Activate, Deactivate, Duplicate, ±10 XP.

### 4. Add Lessons

**Game → Lessons → Add**

- Topic, level, title
- **Content** — the main teaching text
- **Code example** (optional)
- **Tip** (optional)
- **Order** — what order within this level

## Managing Users

**Accounts → Users**

Shows email, username, level badge, XP, hearts, streak.

Bulk actions:
- Verify email
- Reset hearts to max
- Add 100 XP / 500 XP
- Reset XP to 0
- Activate / Deactivate

You can also edit a user's XP, hearts, and streak directly.

## Certificates

**Game → Certificates**

You **cannot add** these — they're auto-created with topics. You **can edit**:

- Title
- Description
- Icon

**Game → User certificates** — list of awarded certificates (read-only).

## Learning Resources (PDFs)

**Game → Learning resources → Add**

- Title, slug, description
- Language, category, difficulty
- Upload the PDF file
- Upload a thumbnail image
- Pages, read time (like "2 hours")
- Active, featured (featured ones show first)

## Site Settings

**Game → Site settings**

Only one row. You edit it. Can't add more.

Sections:
- **Site Branding** — name, tagline, description, contact email
- **Game Mechanics** — max hearts, regen time, XP values
- **Level System** — XP per level
- **Social Links** — GitHub, Twitter, Discord, LinkedIn
- **Feature Toggles** — maintenance mode, registration on/off, etc.

## Announcements

**Game → Announcements**

News items. Each one has a type, title, content, and optional expiry date. Pinned ones show first.
