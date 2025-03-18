from django.contrib import admin
from .models import Artist, Venue, Concert, FavoriteConcert

admin.site.register(Artist)
admin.site.register(Venue)
admin.site.register(Concert)
admin.site.register(FavoriteConcert)
