from knox.auth import TokenAuthentication
import logging

logger = logging.getLogger(__name__)

# We want to modify the request right before Django's Token Authentication is called 
# so created this class to fill in the required fields before its authentication happens :D
class CookieTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        knox_token = request.COOKIES.get('knox_token')
        if not knox_token:
            return None
            
        request.META['HTTP_AUTHORIZATION'] = f'Token {knox_token}'
        return super().authenticate(request)
