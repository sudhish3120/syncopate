# Generated by Django 5.1.7 on 2025-04-01 05:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_remove_userprofile_program_userprofile_faculty'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='user_socials',
            field=models.JSONField(default=dict),
        ),
    ]
