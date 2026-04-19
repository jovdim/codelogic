# 11. Putting It Online

This explains how to put CodeLogic on the internet so other people can use it.

Full step-by-step guide (with detail): [../DEPLOYMENT.md](../../DEPLOYMENT.md). This file is the short version.

## What You'll Use

- **Vercel** — free, hosts the website.
- **Digital Ocean** — hosts the server and the database. Around $20/month.
- **Gmail** — sends emails (sign-up link, password reset).

## Part 1 — Server on Digital Ocean

1. **Make a database.**
   - On Digital Ocean → Create → Databases → PostgreSQL.
   - Copy the long connection string it gives you (starts with `postgresql://`).

2. **Make an app.**
   - On Digital Ocean → Create → Apps.
   - Pick your GitHub repo.
   - Set the folder to `/backend`.
   - Leave the run command as is (it's in the `Procfile`).

3. **Add the secret settings** (in the app's Environment Variables):

```
DEBUG=False
SECRET_KEY=<a long random string>
DATABASE_URL=<paste the connection string from step 1>
ALLOWED_HOSTS=<your-app-name>.ondigitalocean.app
CORS_ALLOWED_ORIGINS=https://<your-site-name>.vercel.app
FRONTEND_URL=https://<your-site-name>.vercel.app
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=you@gmail.com
EMAIL_HOST_PASSWORD=<Gmail app password>
```

4. **Deploy it.** After it's running, open the app's Console and type:

```bash
python manage.py createsuperuser
python manage.py seed_questions
```

## Part 2 — Gmail App Password

Gmail won't let you use your normal password for this. You need an **App Password**.

1. Turn on 2-Step Verification on your Google account.
2. Go to https://myaccount.google.com/apppasswords
3. Pick "Mail" → "Other" → type "CodeLogic".
4. Copy the 16-character password. Remove the spaces. That's your `EMAIL_HOST_PASSWORD`.

## Part 3 — Website on Vercel

1. Go to https://vercel.com and sign in.
2. New Project → import your GitHub repo.
3. Set the **Root Directory** to `frontend`.
4. Add an environment variable:

```
NEXT_PUBLIC_API_URL=https://<your-app-name>.ondigitalocean.app/api
```

5. Click Deploy. When done, you'll get a URL like `https://your-site.vercel.app`.

## Part 4 — Connect Them

Go back to Digital Ocean → your app → Settings. Update these to your Vercel URL:

```
CORS_ALLOWED_ORIGINS=https://<your-site>.vercel.app
FRONTEND_URL=https://<your-site>.vercel.app
```

Save. It redeploys automatically.

## Part 5 — Test It

- Open your Vercel URL.
- Register. Did you get the email?
- Click the link in the email. Can you log in?
- Play a quiz. Does the score save?
- Admin panel at `https://<your-app>.ondigitalocean.app/admin/` — can you log in?

## Common Problems

| What you see | What to try |
|---|---|
| "CORS error" in browser | Make sure `CORS_ALLOWED_ORIGINS` matches your Vercel URL exactly. No trailing slash. |
| 500 error | Check Digital Ocean app logs. Often a missing setting. |
| No emails arriving | Make sure `EMAIL_BACKEND=...smtp.EmailBackend`. Check the Gmail App Password has no spaces. |
| Uploaded files disappear | Digital Ocean App Platform wipes files on every deploy. Use Spaces (see Environment Variables doc) if you need permanent storage. |

## Cost

| Service | Monthly |
|---|---|
| Digital Ocean Database | ~$15 |
| Digital Ocean App | ~$5 |
| Vercel | $0 (free tier) |
| Gmail | $0 |
| **Total** | **~$20** |
