from django.contrib import admin
from .models import Concert, FavoriteConcert
from .models import EmailVerificationCode

admin.site.register(Concert)
admin.site.register(FavoriteConcert)
admin.site.register(EmailVerificationCode)
