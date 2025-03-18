from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from django.db.models.fields.related import ManyToManyField
from django.db.models.fields.related import ForeignKey
from django.forms.fields import CharField

class EmailVerificationCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    @property
    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=10)

    def __str__(self):
        return f"{self.email} - {self.code}"

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
