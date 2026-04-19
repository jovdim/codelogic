# 4. How to Set It Up on Your Computer

This gets CodeLogic running on your own computer so you can play with it. If you want to put it on the internet instead, see [Putting It Online](./11-deployment.md).

## What You Need First

- **Python 3.10 or newer**
- **Node.js 20 or newer**
- **Git**
- (Optional) **PostgreSQL**. If you don't install it, the app uses a simple file-based database called SQLite instead.

## Step 1 — Get the Code

```bash
git clone <your-repo-url> codelogic
cd codelogic
```

## Step 2 — Set Up the Backend

```bash
cd backend

# Make a safe spot for Python packages
python -m venv venv

# Turn it on
# On Windows:
venv\Scripts\activate
# On Mac or Linux:
source venv/bin/activate

# Install the packages
pip install -r requirements.txt
```

Now create a file called `.env` inside the `backend` folder. Paste this in:

```env
DEBUG=True
SECRET_KEY=dev-secret-change-me
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
FRONTEND_URL=http://localhost:3000

# This prints emails to the terminal so you don't need a real email setup.
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

Now run:

```bash
python manage.py migrate              # Build the database tables
python manage.py createsuperuser      # Make yourself an admin user
python manage.py seed_questions       # Optional: fills the database with sample quizzes
python manage.py seed_lessons         # Optional: fills it with sample lessons
python manage.py runserver            # Start the server
```

The server is now at **http://localhost:8000**. The admin panel is at **http://localhost:8000/admin/**.

## Step 3 — Set Up the Frontend

Open a second terminal window and run:

```bash
cd frontend
npm install
```

Create a file called `.env.local` inside the `frontend` folder. Paste this in:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Then start it:

```bash
npm run dev
```

The website is now at **http://localhost:3000**.

## Step 4 — Try It Out

1. Go to http://localhost:3000
2. Click **Register** and make an account.
3. Look at the backend terminal. The "verification email" is printed there. Copy the link and open it in your browser.
4. Log in. You should land on the dashboard.
5. Click **Play** and start a quiz.

## Useful Commands

**Backend:**

| Command | What it does |
|---|---|
| `python manage.py runserver` | Start the server |
| `python manage.py migrate` | Update the database after model changes |
| `python manage.py makemigrations` | Create migration files from model changes |
| `python manage.py seed_questions` | Load sample quiz questions |
| `python manage.py create_test_user` | Make a test user with everything unlocked |

**Frontend:**

| Command | What it does |
|---|---|
| `npm run dev` | Start the website |
| `npm run build` | Build it for the internet |
| `npm run start` | Run the built version |
| `npm run lint` | Check for mistakes in the code |
