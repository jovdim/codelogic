"""Add Topic.language_version - free-form label like "HTML5", "CSS3",
"Python 3.12", ".NET 8". Surfaced on the topic page so students can see
which spec their lessons target. Blank by default; admins fill it in
per topic via the Topic admin form.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0014_typed_answers'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='language_version',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Optional language/spec version label shown to students, e.g. "HTML5", "CSS3", "Python 3.12", "C11", ".NET 8". Leave blank to hide.',
                max_length=40,
            ),
        ),
    ]
