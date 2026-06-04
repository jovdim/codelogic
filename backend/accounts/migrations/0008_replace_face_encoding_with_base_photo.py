"""Drop face_encoding + face_enrolled_at (the failed biometric login
experiment) and replace with base_face_photo + base_face_photo_at - a
teacher-uploaded JPEG used only for human-eye verification."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_user_face_encoding'),
    ]

    operations = [
        migrations.RemoveField(model_name='user', name='face_encoding'),
        migrations.RemoveField(model_name='user', name='face_enrolled_at'),
        migrations.AddField(
            model_name='user',
            name='base_face_photo',
            field=models.BinaryField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='base_face_photo_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
