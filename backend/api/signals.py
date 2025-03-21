from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile

@receiver(post_save, sender=User)
def create_or_get_user_profile(sender, instance, created, **kwargs):
    """Create or get user profile when user is created/saved"""
    UserProfile.objects.get_or_create(user=instance)
