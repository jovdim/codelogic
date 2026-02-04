# 🚀 CodeLogic Deployment Guide

Complete step-by-step guide to deploy CodeLogic with:

- **Frontend**: Vercel
- **Backend**: Digital Ocean App Platform
- **Database**: Digital Ocean Managed PostgreSQL
- **Email**: Gmail SMTP

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Gmail App Password Setup](#2-gmail-app-password-setup)
3. [Digital Ocean Backend Setup](#3-digital-ocean-backend-setup)
4. [Vercel Frontend Setup](#4-vercel-frontend-setup)
5. [Connect Everything](#5-connect-everything)
6. [Post-Deployment Checklist](#6-post-deployment-checklist)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

### What You Need:

- [ ] GitHub account (with your code pushed to a repository)
- [ ] Digital Ocean account (sign up at digitalocean.com)
- [ ] Vercel account (sign up at vercel.com - free tier works)
- [ ] Gmail account for sending emails

### Push Code to GitHub:

```bash
# In the codelogic folder
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/codelogic.git
git push -u origin main
```

---

## 2. Gmail App Password Setup

Gmail requires an "App Password" for sending emails from applications.

### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **2-Step Verification**
3. Follow the steps to enable it

### Step 2: Generate App Password

1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "CodeLogic"
4. Click **Generate**
5. **COPY THE 16-CHARACTER PASSWORD** (you won't see it again!)
   - It looks like: `xxxx xxxx xxxx xxxx`
   - Remove spaces when using: `xxxxxxxxxxxxxxxx`

### Save These for Later:

```
EMAIL_HOST_USER=your-actual-email@gmail.com
EMAIL_HOST_PASSWORD=xxxxxxxxxxxxxxxx (the app password, no spaces)
```

---

## 3. Digital Ocean Backend Setup

### Step 1: Create a Digital Ocean Account

1. Go to [digitalocean.com](https://digitalocean.com)
2. Sign up and add a payment method

### Step 2: Create a Managed PostgreSQL Database

1. Click **Create** → **Databases**
2. Choose **PostgreSQL** (version 15 or 16)
3. Select datacenter region (closest to your users)
4. Choose plan: **Basic** → **$15/mo** (1GB RAM) is enough to start
5. Name it: `codelogic-db`
6. Click **Create Database Cluster**
7. Wait for it to be ready (takes 2-3 minutes)

### Step 3: Get Database Connection String

1. Go to your database dashboard
2. Click **Connection Details**
3. Select **Connection String**
4. Copy the connection string - it looks like:
   ```
   postgresql://doadmin:PASSWORD@db-xxx.ondigitalocean.com:25060/defaultdb?sslmode=require
   ```
5. **SAVE THIS** - you'll need it for the backend

### Step 4: Create App Platform Application

1. Click **Create** → **Apps**
2. Choose **GitHub** as source
3. Authorize Digital Ocean to access your GitHub
4. Select your `codelogic` repository
5. Select branch: `main`
6. **IMPORTANT**: Set source directory to `/backend`

### Step 5: Configure the App

1. **Resources**:
   - Type: **Web Service**
   - Plan: **Basic** → **$5/mo** (512MB RAM) works for starting
2. Click **Edit** on your component and configure:
   - **Run Command**: `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`

### Step 6: Add Environment Variables

Click **Settings** → **App-Level Environment Variables** and add:

| Variable               | Value                                                       |
| ---------------------- | ----------------------------------------------------------- |
| `DEBUG`                | `False`                                                     |
| `SECRET_KEY`           | (generate a random 50+ character string)                    |
| `DATABASE_URL`         | (paste your PostgreSQL connection string)                   |
| `ALLOWED_HOSTS`        | `your-app-name.ondigitalocean.app`                          |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` (add after Vercel setup) |
| `FRONTEND_URL`         | `https://your-frontend.vercel.app` (add after Vercel setup) |
| `EMAIL_BACKEND`        | `django.core.mail.backends.smtp.EmailBackend`               |
| `EMAIL_HOST`           | `smtp.gmail.com`                                            |
| `EMAIL_PORT`           | `587`                                                       |
| `EMAIL_USE_TLS`        | `True`                                                      |
| `EMAIL_HOST_USER`      | `your-email@gmail.com`                                      |
| `EMAIL_HOST_PASSWORD`  | `your-gmail-app-password`                                   |

### Generate a Secret Key:

Run this in Python to generate a secret key:

```python
import secrets
print(secrets.token_urlsafe(50))
```

### Step 7: Deploy

1. Click **Review** → **Create Resources**
2. Wait for the build to complete (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://codelogic-xxxxx.ondigitalocean.app`

### Step 8: Create Admin User (One-time)

1. Go to your app in Digital Ocean
2. Click **Console**
3. Run:
   ```bash
   python manage.py createsuperuser
   ```
4. Follow the prompts to create an admin account

---

## 4. Vercel Frontend Setup

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/log in
2. Click **Add New** → **Project**
3. **Import Git Repository** → Select your `codelogic` repo
4. **IMPORTANT**: Set **Root Directory** to `frontend`

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: Leave default
- **Install Command**: `npm install` (or leave default)

### Step 3: Add Environment Variables

In Vercel project settings → **Environment Variables**, add:

| Name                  | Value                                         |
| --------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.ondigitalocean.app/api` |

Replace with your actual Digital Ocean backend URL.

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. You'll get a URL like: `https://codelogic-xxxxx.vercel.app`

---

## 5. Connect Everything

Now update the environment variables to connect frontend and backend:

### Update Digital Ocean Backend:

Go to your Digital Ocean app → Settings → Environment Variables and update:

| Variable               | Value                              |
| ---------------------- | ---------------------------------- |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `FRONTEND_URL`         | `https://your-frontend.vercel.app` |

Click **Save** and it will auto-redeploy.

### Verify Vercel Frontend:

Make sure `NEXT_PUBLIC_API_URL` points to your Digital Ocean backend URL:

```
https://codelogic-xxxxx.ondigitalocean.app/api
```

---

## 6. Post-Deployment Checklist

### Test Everything:

- [ ] Can you access the frontend? `https://your-frontend.vercel.app`
- [ ] Can you register a new user?
- [ ] Did you receive verification email?
- [ ] Can you verify email and log in?
- [ ] Can you play quizzes?
- [ ] Does the leaderboard work?
- [ ] Can you access admin? `https://your-backend.ondigitalocean.app/admin/`

### Seed the Database:

After deployment, you need to add questions. Use the admin panel or:

1. Go to Digital Ocean → App → Console
2. Run: `python manage.py seed_questions`

### Custom Domain (Optional):

**Vercel:**

1. Go to Project Settings → Domains
2. Add your domain (e.g., `codelogic.com`)
3. Follow DNS instructions

**Digital Ocean:**

1. Go to App Settings → Domains
2. Add your API domain (e.g., `api.codelogic.com`)
3. Follow DNS instructions

---

## 7. Troubleshooting

### "CORS Error" in Browser Console

- Check `CORS_ALLOWED_ORIGINS` in backend includes your frontend URL
- Make sure there's no trailing slash
- URL must match exactly (https vs http, www vs non-www)

### "500 Internal Server Error"

- Check Digital Ocean app logs (App → Runtime Logs)
- Common issues: missing environment variable, database connection error

### Emails Not Sending

1. Verify Gmail App Password is correct (no spaces)
2. Check `EMAIL_BACKEND` is set to `django.core.mail.backends.smtp.EmailBackend`
3. Check `EMAIL_HOST_USER` is your full Gmail address

### Database Errors

- Ensure `DATABASE_URL` is correctly formatted
- Check if the database allows connections from App Platform (should by default)

### Build Failing

- Check the build logs for specific errors
- Common issue: missing dependencies in `requirements.txt`

---

## 📊 Cost Summary (Estimated Monthly)

| Service                | Plan          | Cost        |
| ---------------------- | ------------- | ----------- |
| Digital Ocean Database | Basic (1GB)   | $15/mo      |
| Digital Ocean App      | Basic (512MB) | $5/mo       |
| Vercel Frontend        | Hobby (Free)  | $0/mo       |
| Gmail SMTP             | Free          | $0/mo       |
| **Total**              |               | **~$20/mo** |

_You can scale up as needed._

---

## 🎉 You're Live!

Your CodeLogic platform is now deployed and accessible to the world!

**Frontend**: `https://your-frontend.vercel.app`  
**Backend API**: `https://your-backend.ondigitalocean.app/api`  
**Admin Panel**: `https://your-backend.ondigitalocean.app/admin/`

---

## Quick Reference: Environment Variables

### Backend (.env)

```env
DEBUG=False
SECRET_KEY=your-generated-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
ALLOWED_HOSTS=your-backend.ondigitalocean.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-no-spaces
```

### Frontend (Vercel Environment Variables)

```env
NEXT_PUBLIC_API_URL=https://your-backend.ondigitalocean.app/api
```
