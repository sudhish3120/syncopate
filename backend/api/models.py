from django.db import models
from django.contrib.auth.models import User
from django.db.models.fields.related import ManyToManyField
from django.db.models.fields.related import ForeignKey
from django.forms.fields import CharField

# Create your models here.
class Venue(models.Model):
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Artist(models.Model):
    name = models.CharField(max_length=255)
    def __str__(self):
        return self.name

class Concert(models.Model):
    name = models.CharField(max_length=255)
    artist = models.ForeignKey(Artist, on_delete=models.CASCADE)
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE)
    date = models.DateTimeField()
    ticket_url = models.URLField()
    users_favorited = models.ManyToManyField(User, through='FavoriteConcert', related_name='favourite_concerts')
    def __str__(self):
         return f"{self.name} - {self.artist.name} at {self.venue.name}"

class FavoriteConcert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    concert = models.ForeignKey(Concert, on_delete=models.CASCADE)
    date_favorited = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user', 'concert')
