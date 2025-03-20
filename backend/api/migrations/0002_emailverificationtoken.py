"""
Migration to create EmailVerificationToken model
"""

# Generated by Django 5.1.7 on 2025-03-16 19:03

from django.db import migrations, models


class Migration(migrations.Migration):
    """Migration to create EmailVerificationToken model"""

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="EmailVerificationToken",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("email", models.EmailField(max_length=254)),
                ("token", models.CharField(max_length=64, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("is_used", models.BooleanField(default=False)),
            ],
        ),
    ]
