# Generated by Django 5.1.7 on 2025-03-14 21:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_emailverificationcode'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='concert',
            name='artist',
        ),
        migrations.RemoveField(
            model_name='concert',
            name='venue',
        ),
        migrations.RemoveField(
            model_name='concert',
            name='date',
        ),
        migrations.RemoveField(
            model_name='concert',
            name='name',
        ),
        migrations.RemoveField(
            model_name='concert',
            name='ticket_url',
        ),
        migrations.AddField(
            model_name='concert',
            name='concert_id',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
        migrations.DeleteModel(
            name='Artist',
        ),
        migrations.DeleteModel(
            name='Venue',
        ),
    ]
