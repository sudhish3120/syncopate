# Generated by Django 5.1.7 on 2025-03-29 17:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_artist_genre_userprofile'),
    ]

    operations = [
        migrations.AddField(
            model_name='matching',
            name='matched_concerts',
            field=models.ManyToManyField(related_name='matched_users', to='api.concert'),
        ),
    ]
