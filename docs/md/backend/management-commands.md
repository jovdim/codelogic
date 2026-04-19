# Helpful Commands

These are terminal commands you can run to set up or reset things on the server.

Run them from the `backend/` folder with your virtualenv active.

## Built-in Django Commands

### `python manage.py runserver`
Starts the server. Runs on http://localhost:8000.

### `python manage.py migrate`
Updates the database to match the latest code.

### `python manage.py makemigrations`
Make migration files after you changed a model.

### `python manage.py createsuperuser`
Make an admin account. You'll be asked for email, username, and password.

### `python manage.py collectstatic --noinput`
Gather all static files (CSS, JS) into one folder. Needed when deploying.

## Custom Commands (made for CodeLogic)

### `python manage.py seed_questions`
Wipes the quiz database and fills it with sample categories, topics, and questions.

**⚠️ Warning: this deletes all existing categories, topics, and questions.**

Run this when you want a clean set of sample data to test with.

### `python manage.py seed_lessons`
Adds lesson slides for each topic at each level.

### `python manage.py update_certificates`
Sets good default titles and descriptions for certificates that don't have them yet. Useful after creating many topics.

### `python manage.py create_test_user`
Makes a test user called `testuser` with:
- Email: `testuser@codelogic.com`
- Password: `TestUser123!`
- Email already verified
- Every topic completed
- 15,000 XP
- 30-day current streak, 45-day longest streak

Handy for testing without playing through every level.

## Typical First Run

After cloning the repo, this gets you a working site with sample data:

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_questions
python manage.py seed_lessons
python manage.py update_certificates
python manage.py create_test_user    # optional
python manage.py runserver
```
