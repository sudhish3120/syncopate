"""api app setup"""

from django.apps import AppConfig


class ApiConfig(AppConfig):
    """configs for api"""

    default_auto_field = "django.db.models.BigAutoField"
    name = "api"
