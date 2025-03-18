from django.db import models
import secrets
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.models import User
from django.db.models.fields.related import ManyToManyField
from django.db.models.fields.related import ForeignKey
from django.forms.fields import CharField

class EmailVerificationToken(models.Model):
    email = models.EmailField()
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    @property
    def is_expired(self):
        expiry_time = self.created_at + timedelta(hours=24)
        return timezone.now() > expiry_time

    @classmethod
    def generate_token(cls, email):
        token = secrets.token_urlsafe(32)
        return cls.objects.create(email=email, token=token)

# Create your models here.

# class Venue(models.Model):
#     name = models.CharField(max_length=200)
#     address = models.CharField(max_length=200)

#     def __str__(self):
#         return self.name

# class Artist(models.Model):
#     name = models.CharField(max_length=200)

#     def __str__(self):
#         return self.name

class Concert(models.Model):
    concert_id = models.CharField(max_length=200, null=True, blank=True)
    users_favorited = models.ManyToManyField(User, through='FavoriteConcert', related_name='favourite_concerts')

class FavoriteConcert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    concert = models.ForeignKey(Concert, on_delete=models.CASCADE)
    date_favorited = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'concert')

class TemporaryRegistration(models.Model):
    setup_token = models.CharField(max_length=64, unique=True)
    username = models.CharField(max_length=150)
    email = models.EmailField()
    password = models.CharField(max_length=128)  # Will store hashed password
    created_at = models.DateTimeField(auto_now_add=True)
    totp_secret = models.CharField(max_length=64, null=True)  # Increased from 32 to 64

    @property
    def is_expired(self):
        expiry_time = self.created_at + timedelta(minutes=15)
        return timezone.now() > expiry_time
