"""
Provides some arithmetic functions
"""

import secrets
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone

MATCHING_DECISIONS = [("YES", "YES"), ("NO", "NO"), ("UNKNOWN", "UNKNOWN")]

User = get_user_model()


class EmailVerificationToken(models.Model):
    """Model to store email verification tokens"""

    email = models.EmailField()
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    @property
    def is_expired(self):
        """Check if the token is expired"""
        expiry_time = self.created_at + timedelta(hours=24)
        return timezone.now() > expiry_time

    @classmethod
    def generate_token(cls, email):
        """Generate a new token for the given email"""
        token = secrets.token_urlsafe(32)
        return cls.objects.create(email=email, token=token)


class Concert(models.Model):
    """Model to store concert details"""

    concert_id = models.CharField(max_length=200, null=True, blank=True)
    users_favorited = models.ManyToManyField(
        User, through="FavoriteConcert", related_name="favourite_concerts"
    )


class FavoriteConcert(models.Model):
    """Model to store favorite concerts"""

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    concert = models.ForeignKey(Concert, on_delete=models.CASCADE)
    date_favorited = models.DateTimeField(auto_now_add=True)

    class Meta:
        """Meta class for FavoriteConcert"""

        unique_together = ("user", "concert")


class TemporaryRegistration(models.Model):
    """Model to store temporary registration details"""

    setup_token = models.CharField(max_length=64, unique=True)
    username = models.CharField(max_length=150)
    email = models.EmailField()
    password = models.CharField(max_length=128)  # Will store hashed password
    created_at = models.DateTimeField(auto_now_add=True)
    totp_secret = models.CharField(max_length=64, null=True)  # Increased from 32 to 64

    @property
    def is_expired(self):
        """Check if the token is expired"""
        expiry_time = self.created_at + timedelta(minutes=15)
        return timezone.now() > expiry_time


class Matching(models.Model):
    """Model to store matching decisions"""

    user = models.ForeignKey(User, related_name="user", on_delete=models.CASCADE)
    target = models.ForeignKey(User, related_name="target", on_delete=models.CASCADE)
    decision = models.CharField(max_length=7, choices=MATCHING_DECISIONS)
    matched_concerts = models.ManyToManyField(Concert, related_name="matched_users")
    class Meta:
        """Meta class for Matching"""

        unique_together = ("user", "target")


class UserProfile(models.Model):
    """Extended user profile model"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_photo = models.CharField(max_length=200, default='/avatars/1.jpg')
    favorite_artists = models.ManyToManyField('Artist', related_name='favorited_by')
    favorite_genres = models.ManyToManyField('Genre', related_name='favorited_by')

    def __str__(self):
        return f"{self.user.username}'s profile"

class Artist(models.Model):
    """Artist model"""
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.name

class Genre(models.Model):
    """Genre model"""
    name = models.CharField(max_length=200, unique=True)

    def __str__(self):
        return self.name
