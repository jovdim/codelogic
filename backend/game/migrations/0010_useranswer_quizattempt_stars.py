from django.db import migrations, models
import django.db.models.deletion
import uuid


def backfill_stars(apps, schema_editor):
    """Recompute stars for every existing completed attempt using the canonical rule."""
    QuizAttempt = apps.get_model('game', 'QuizAttempt')
    for attempt in QuizAttempt.objects.filter(completed=True):
        total = attempt.total_questions
        if not total:
            attempt.stars = 0
        else:
            pct = attempt.score / total
            if pct >= 0.9:
                attempt.stars = 3
            elif pct >= 0.7:
                attempt.stars = 2
            elif pct >= 0.5:
                attempt.stars = 1
            else:
                attempt.stars = 0
        attempt.save(update_fields=['stars'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0009_lesson'),
    ]

    operations = [
        migrations.AddField(
            model_name='quizattempt',
            name='stars',
            field=models.PositiveSmallIntegerField(default=0),
        ),
        migrations.CreateModel(
            name='UserAnswer',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('selected_answer', models.IntegerField()),
                ('is_correct', models.BooleanField()),
                ('answered_at', models.DateTimeField(auto_now_add=True)),
                ('attempt', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='game.quizattempt')),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='game.question')),
            ],
            options={
                'db_table': 'user_answers',
                'unique_together': {('attempt', 'question')},
            },
        ),
        migrations.RunPython(backfill_stars, noop_reverse),
    ]
