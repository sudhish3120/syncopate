"""
Create or get user profile when user is created/saved
"""
from django.db.models.signals import post_save
from django.contrib.auth import get_user_model
from django.dispatch import receiver
from .models import UserProfile

User = get_user_model()


@receiver(post_save, sender=User)
def create_or_get_user_profile(_sender, instance, _created, **kwargs):
    """Create or get user profile when user is created/saved"""
    UserProfile.objects.get_or_create(user=instance)
