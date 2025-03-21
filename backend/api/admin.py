"""setup the admin panel in the admin site/interface"""

from django.contrib import admin

from .models import Concert, EmailVerificationToken, FavoriteConcert

admin.site.register(Concert)
admin.site.register(FavoriteConcert)
admin.site.register(EmailVerificationToken)
