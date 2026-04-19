# 2. Tech Stack

The tools used to build CodeLogic. Don't worry if you don't recognize them — just think of it as the ingredients list.

## The Website (Frontend)

This is the part users see and click on.

| Tool | What it does |
|---|---|
| **Next.js 16** | The main framework. It builds the website. |
| **React 19** | Lets us build the site in small pieces called components. |
| **TypeScript** | JavaScript with extra rules to catch mistakes. |
| **Tailwind CSS 4** | An easy way to style things (colors, spacing, etc.). |
| **Axios** | Used to talk to the server. |
| **Lucide React** | A pack of icons (arrows, hearts, stars, etc.). |
| **canvas-confetti** | Shoots confetti when you finish a level. |

## The Server (Backend)

This is the brain. It stores users, questions, scores, etc.

| Tool | What it does |
|---|---|
| **Python** | The language the server is written in. |
| **Django** | The main framework. Handles URLs, the admin panel, and the database. |
| **Django REST Framework** | Lets the website talk to the server using APIs. |
| **Simple JWT** | Handles login tokens so you stay logged in. |
| **PostgreSQL** | The database (where all data is saved). |
| **SQLite** | A smaller database for testing on your own computer. |
| **Gunicorn** | Runs the Django app when it's online. |
| **Whitenoise** | Serves the website's files (images, CSS, etc.) when online. |
| **Pillow** | Handles uploaded images. |

## Where It Lives Online

| Service | Used for |
|---|---|
| **Vercel** | Hosts the website (frontend). |
| **Digital Ocean** | Hosts the server (backend). |
| **Digital Ocean Postgres** | Hosts the database. |
| **Gmail** | Sends emails (sign-up, password reset). |
| **Digital Ocean Spaces** (optional) | Stores uploaded files like PDFs. |
