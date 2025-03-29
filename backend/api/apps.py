"""api app setup"""

from django.apps import AppConfig


class ApiConfig(AppConfig):
    """configs for api"""

    default_auto_field = "django.db.models.BigAutoField"
    name = "api"

    def ready(self):
        import api.signals  # noqa: E402, F401
        # E402: Module level import not at top of file
        # F401: Imported but unused
