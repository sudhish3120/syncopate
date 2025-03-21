"""
This module is responsible for returning user data
"""

import logging

from rest_framework import permissions, status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response
from rest_framework import permissions, status
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.serializers import ValidationError

from ..models import Artist, Genre, UserProfile
from ..authentication import CookieTokenAuthentication
from ..serializers import UserSerializer

logger = logging.getLogger(__name__)

name_validator = RegexValidator(
    regex=r'^[a-zA-Z0-9\s&\'-]{0,50}$',
    message='Contains invalid characters'
)

@api_view(["GET"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_user(request):
    """fetching user data"""
    try:
        logger.info("Getting user data for: %s", request.user.username)
        serializer = UserSerializer(request.user)
        return Response({"user": serializer.data, "status": "success"})
    except Exception as e:
        logger.error("User authentication error: %s", str(e))
        return Response(
            {"error": "Could not fetch user details"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    '''Update user profile'''
    try:
        user = request.user
        profile, created = UserProfile.objects.get_or_create(user=user)
        data = request.data

        # Validate profile photo
        allowed_avatars = ['/avatars/1.jpg', '/avatars/2.jpg', '/avatars/3.jpg', '/avatars/4.jpg']
        if 'profile_photo' in data:
            if data['profile_photo'] not in allowed_avatars:
                raise ValidationError('Invalid avatar selection')
            profile.profile_photo = data['profile_photo']
            profile.save()

        # Update favorite artists with validation
        if 'favorite_artists' in data:
            artists = data['favorite_artists']
            if not isinstance(artists, list) or len(artists) > 3:
                raise ValidationError('Invalid artists format or too many artists')
                
            profile.favorite_artists.clear()
            for artist_name in artists:
                if artist_name and isinstance(artist_name, str):
                    try:
                        name_validator(artist_name.strip())
                    except DjangoValidationError:
                        raise ValidationError(f"Invalid characters for artist name")
                    artist, _ = Artist.objects.get_or_create(
                        name=artist_name.strip()[:50]  # Enforce max length
                    )
                    profile.favorite_artists.add(artist)

        # Update favorite genres with validation
        if 'favorite_genres' in data:
            genres = data['favorite_genres']
            if not isinstance(genres, list) or len(genres) > 3:
                raise ValidationError('Invalid genres format or too many genres')
                
            profile.favorite_genres.clear()
            for genre_name in genres:
                if genre_name and isinstance(genre_name, str):
                    try:
                        name_validator(genre_name.strip())
                    except DjangoValidationError:
                        raise ValidationError(f"Invalid characters for Genre name")
                    genre, _ = Genre.objects.get_or_create(
                        name=genre_name.strip()[:30]  # Enforce max length
                    )
                    profile.favorite_genres.add(genre)

        user.refresh_from_db()
        serializer = UserSerializer(user)
        return Response({"user": serializer.data}, status=status.HTTP_200_OK)

    except ValidationError as e:
        logger.warning(f"Validation error for user {user.username}: {str(e)}")
        return Response(
            {"error":" Invalid Input"},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}", exc_info=True)
        return Response(
            {"error": "Failed to update profile"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
