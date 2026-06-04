"""Add face_encoding (128-D vector) + face_enrolled_at fields on User
for biometric login.

The browser uses @vladmandic/face-api to compute the 128-float embedding
client-side. We just store the vector and compare new ones against it
via Euclidean distance at login time.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_teacher_role_and_scoping'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='face_encoding',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='face_enrolled_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
