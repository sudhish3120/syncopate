# Generated by Django 5.1.7 on 2025-03-29 19:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_userprofile_user_socials'),
    ]

    operations = [
        migrations.AddField(
            model_name='matching',
            name='matched_concerts',
            field=models.ManyToManyField(related_name='matched_users', to='api.concert'),
        ),
    ]
