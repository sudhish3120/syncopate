"""
This module is responsible for returning user data
"""

# pylint: disable=R0912

import logging
import re

from django.core.exceptions import ValidationError
from rest_framework import permissions, status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.response import Response

from ..authentication import CookieTokenAuthentication
from ..models import Artist, Genre, UserProfile
from ..serializers import UserSerializer

logger = logging.getLogger(__name__)


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
    """Update user profile"""
    try:
        user = request.user
        profile, _created = UserProfile.objects.get_or_create(user=user)
        data = request.data

        print(data)

        # Validate profile photo
        allowed_avatars = [
            "/avatars/1.jpg",
            "/avatars/2.jpg",
            "/avatars/3.jpg",
            "/avatars/4.jpg",
        ]

        allowed_terms = [
            "1A",
            "1B",
            "2A",
            "2B",
            "3A",
            "3B",
            "4A",
            "4B",
            "Masters",
            "Graduate",
            "PhD",
            "Undergraduate",
            "Exchange Student",
            "Prefer not to say",
        ]

        allowed_faculties = [
            "Arts",
            "Engineering",
            "Environment",
            "Health",
            "Mathematics",
            "Science",
        ]

        if "profile_photo" in data:
            if data["profile_photo"] not in allowed_avatars:
                raise ValidationError("Invalid avatar selection")
            profile.profile_photo = data["profile_photo"]
        if "first_name" in data:
            profile.first_name = data["first_name"].strip()
        if "last_name" in data:
            profile.last_name = data["last_name"].strip()
        if "term" in data:
            if data["term"] not in allowed_terms:
                raise ValidationError("Invalid term selection")
            profile.term = data["term"]
        if "faculty" in data:
            if data["faculty"] not in allowed_faculties:
                raise ValidationError("Invalid faculty selection")
            profile.faculty = data["faculty"]
        profile.save()

        input_regex = r"^[a-zA-Z0-9\s&\'-]{0,50}$"

        # Update favorite artists with validation
        if "favorite_artists" in data:
            artists = data["favorite_artists"]
            if not isinstance(artists, list) or len(artists) > 3:
                raise ValidationError("Invalid artists format or too many artists")

            profile.favorite_artists.clear()
            for artist_name in artists:
                if isinstance(artist_name, str) and re.match(
                    input_regex, artist_name.strip()
                ):
                    artist, _ = Artist.objects.get_or_create(
                        name=artist_name.strip()[:50]  # Enforce max length
                    )
                    profile.favorite_artists.add(artist)
                else:
                    raise ValidationError("Invalid artist name")

        # Update favorite genres with validation
        if "favorite_genres" in data:
            genres = data["favorite_genres"]
            if not isinstance(genres, list) or len(genres) > 3:
                raise ValidationError("Invalid genres format or too many genres")

            profile.favorite_genres.clear()
            for genre_name in genres:
                if isinstance(genre_name, str) and re.match(
                    input_regex, genre_name.strip()
                ):
                    genre, _ = Genre.objects.get_or_create(
                        name=genre_name.strip()[:30]  # Enforce max length
                    )
                    profile.favorite_genres.add(genre)
                else:
                    raise ValidationError("Invalid genre name")

        user.refresh_from_db()
        serializer = UserSerializer(user)
        return Response({"user": serializer.data}, status=status.HTTP_200_OK)

    except ValidationError as e:
        logger.warning("Validation error for user %s: %s", user.username, str(e))
        return Response({"error": " Invalid Input"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error("Profile update error: %s", str(e), exc_info=True)
        return Response(
            {"error": "Failed to update profile"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
