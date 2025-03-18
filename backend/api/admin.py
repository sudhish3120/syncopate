from django.contrib import admin
from .models import Concert, FavoriteConcert
from .models import EmailVerificationToken

admin.site.register(Concert)
admin.site.register(FavoriteConcert)
admin.site.register(EmailVerificationToken)
