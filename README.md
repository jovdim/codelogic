# CodeLogic - Gamified Coding Quiz Platform

A pixel-art styled gamified quiz platform for learning programming concepts.

## Features

- **Interactive Quizzes**: Multiple choice, find the error, what's the output, fill-in-the-blank
- **Gamification**: XP system, levels, streaks, hearts/lives
- **Leaderboards**: Compete with other learners
- **Certificates**: Earn certificates for completing topics
- **Learning Resources**: PDF guides and tutorials
- **User Profiles**: Customizable avatars, display names

## Tech Stack

**Frontend:**

- Next.js 16 (React 19)
- TypeScript
- Tailwind CSS 4
- Lucide Icons

**Backend:**

- Django 4.2
- Django REST Framework
- PostgreSQL
- JWT Authentication

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

**Quick Summary:**

- Frontend: Vercel
- Backend: Digital Ocean App Platform
- Database: Digital Ocean Managed PostgreSQL
- Email: Gmail SMTP

## Local Development

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit with your values
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_questions  # Optional: add sample questions
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local  # Edit with your values
npm run dev
```

### URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- Admin: http://localhost:8000/admin

## Environment Variables

### Backend

| Variable               | Description                             |
| ---------------------- | --------------------------------------- |
| `DEBUG`                | Set to `False` in production            |
| `SECRET_KEY`           | Django secret key                       |
| `DATABASE_URL`         | PostgreSQL connection string            |
| `ALLOWED_HOSTS`        | Comma-separated list of allowed hosts   |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed origins |
| `FRONTEND_URL`         | Frontend URL for email links            |
| `EMAIL_HOST_USER`      | Gmail address                           |
| `EMAIL_HOST_PASSWORD`  | Gmail app password                      |

### Frontend

| Variable              | Description     |
| --------------------- | --------------- |
| `NEXT_PUBLIC_API_URL` | Backend API URL |

