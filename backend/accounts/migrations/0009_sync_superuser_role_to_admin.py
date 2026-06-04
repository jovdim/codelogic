"""One-shot data migration: any user with `is_superuser=True` but
`role != 'admin'` is updated to `role='admin'`.

Before this migration the role field could drift out of sync with the
is_superuser flag for users that pre-dated the `role` field (added in
0006). Those users showed the "Admin" pill in the admin list (because
the pill checks is_superuser first) yet still matched the "Role:
Student" filter, which was confusing.

After this migration the `role` column is the single source of truth
for who is an admin, and `User.save()` keeps it that way going forward.
"""

from django.db import migrations


def sync_role_for_superusers(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(is_superuser=True).exclude(role='admin').update(role='admin')


def noop(apps, schema_editor):
    # Reverse intentionally does nothing: we don't know which of the
    # rows touched by the forward migration ORIGINALLY had role='student'
    # vs role='teacher', and either way superusers should be 'admin'.
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0008_replace_face_encoding_with_base_photo'),
    ]

    operations = [
        migrations.RunPython(sync_role_for_superusers, noop),
    ]
