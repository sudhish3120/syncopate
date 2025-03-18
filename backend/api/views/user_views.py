from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import permissions, status
from ..authentication import CookieTokenAuthentication
from ..serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)

@api_view(['GET'])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_user(request):
    try:
        serializer = UserSerializer(request.user)
        return Response({
            "user": serializer.data,
            "status": "success"
        })
    except Exception as e:
        logger.error(f"User authentication error: {str(e)}")
        return Response({
            "error": "Could not fetch user details"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
