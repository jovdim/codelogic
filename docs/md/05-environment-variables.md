# 5. Environment Variables

These are the secret settings the app needs. You put them in a `.env` file. The app reads them when it starts.

## Backend (`backend/.env`)

### Basic

| Name | Default | What it does |
|---|---|---|
| `DEBUG` | `True` | Keep as `True` when testing. Set to `False` when online. |
| `SECRET_KEY` | (insecure) | A secret string. Make a new one when going online. |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | The addresses the server will respond to. |

### Database

| Name | Default | What it does |
|---|---|---|
| `DATABASE_URL` | empty | A long string pointing to your PostgreSQL database. If empty, the app uses SQLite (a file). |

### Frontend Connection

| Name | Default | What it does |
|---|---|---|
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | The websites that are allowed to talk to this server. |
| `CSRF_TRUSTED_ORIGINS` | same | Trusted websites for form submissions. |

### Email

| Name | Default | What it does |
|---|---|---|
| `EMAIL_BACKEND` | `...console.EmailBackend` | While testing, prints emails to the terminal. Online, use `...smtp.EmailBackend`. |
| `EMAIL_HOST` | `smtp.gmail.com` | The email server. |
| `EMAIL_PORT` | `587` | The email server port. |
| `EMAIL_USE_TLS` | `True` | Keep as True. |
| `EMAIL_HOST_USER` | empty | Your full Gmail address. |
| `EMAIL_HOST_PASSWORD` | empty | A Gmail **App Password** (not your regular password). |
| `FRONTEND_URL` | `http://localhost:3000` | Used in email links like the verification link. |

### Optional — Cloud Storage

These are only needed if you want uploaded files (PDFs, icons) to go to the cloud instead of the server's hard drive.

| Name | What it does |
|---|---|
| `USE_SPACES` | Set to `True` to use Digital Ocean Spaces. |
| `DO_SPACES_ACCESS_KEY` | Your key. |
| `DO_SPACES_SECRET_KEY` | Your secret. |
| `DO_SPACES_BUCKET_NAME` | The bucket name. |
| `DO_SPACES_REGION` | The region (default `sgp1`). |

## Frontend (`frontend/.env.local`)

Only one variable is needed.

| Name | What it does |
|---|---|
| `NEXT_PUBLIC_API_URL` | The address of the backend. For example `http://localhost:8000/api` when testing, or your real backend URL when online. |
