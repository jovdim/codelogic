"""Add teacher-role scaffolding + year-level / section / department fields
on the User model, plus the teachers M2M for student->teacher assignment.

Background: client wants a Teacher role distinct from full admin.
Teachers create + manage their own students (only the students they're
assigned to); superadmin can do everything via Django admin. Students
are scoped to a department + year level + section; their game dashboard
shows only their own year level's content.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0005_login_face_snapshot_history'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[('student', 'Student'), ('teacher', 'Teacher'), ('admin', 'Admin')],
                default='student',
                max_length=16,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='department',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Department label (e.g. "IT", "Computer Engineering"). Free text - use anything that matches your school.',
                max_length=80,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='year_level',
            field=models.PositiveSmallIntegerField(
                blank=True,
                choices=[(1, '1st Year'), (2, '2nd Year'), (3, '3rd Year'), (4, '4th Year')],
                help_text='Year level for students (1-4). Optional for teachers/admin.',
                null=True,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='section',
            field=models.CharField(
                blank=True,
                default='',
                help_text='Section label (e.g. "A", "1B", "Block 3"). Optional for teachers/admin.',
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='teachers',
            field=models.ManyToManyField(
                blank=True,
                help_text='For students: the teachers who can manage this student.',
                limit_choices_to={'role': 'teacher'},
                related_name='students',
                to='accounts.user',
            ),
        ),
    ]
