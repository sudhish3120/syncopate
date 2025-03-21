import logging

from django.utils import timezone
from knox.auth import TokenAuthentication
from knox.settings import knox_settings

logger = logging.getLogger(__name__)


# We want to modify the request right before Django's Token Authentication is called
# so created this class to fill in the required fields before its authentication happens :D
class CookieTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        knox_token = request.COOKIES.get("knox_token")
        if not knox_token:
            return None

        request.META["HTTP_AUTHORIZATION"] = f"Token {knox_token}"

        # Get user and token from parent class
        auth_result = super().authenticate(request)
        if not auth_result:
            return None

        user, auth_token = auth_result

        # Check token expiry
        token_ttl = knox_settings.TOKEN_TTL
        if token_ttl:
            now = timezone.now()
            expiry = auth_token.created + token_ttl
            if expiry < now:
                # Delete expired token
                auth_token.delete()
                logger.warning("Expired token used for user: %s", user.username)
                return None

        return auth_result
