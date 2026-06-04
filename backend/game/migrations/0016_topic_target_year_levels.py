"""Add Topic.target_year_levels (JSONField list of year_level ints).
Empty list = visible to ALL year levels, so existing topics keep their
current reach with no admin action required.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0015_topic_language_version'),
    ]

    operations = [
        migrations.AddField(
            model_name='topic',
            name='target_year_levels',
            field=models.JSONField(
                blank=True,
                default=list,
                help_text=(
                    'Year levels this topic is for. Empty list = all years. '
                    'Example: [1, 2] means only 1st- and 2nd-year students see it.'
                ),
            ),
        ),
    ]
