"""
This module contains all serializers (JSON <-> object).
"""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Artist, Concert, FavoriteConcert, Genre, UserProfile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    """register serializer"""

    class Meta:
        model = User
        fields = ("id", "username", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"], password=validated_data["password"]
        )
        return user


class LoginSerializer(serializers.Serializer):
    """login serializer"""

    username = serializers.CharField()
    password = serializers.CharField(
        style={"input_type": "password"}, trim_whitespace=False
    )

    def create(self, validated_data):
        pass

    def update(self, instance, validated_data):
        pass


class ConcertSerializer(serializers.ModelSerializer):
    """concert serializer"""

    users_favorited = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Concert
        fields = ["id", "concert_id", "users_favorited"]


class FavoriteConcertSerializer(serializers.ModelSerializer):
    """favorite concert serializer"""

    class Meta:
        model = FavoriteConcert
        fields = [
            "name",
            "id",
            "images",
            "dates",
        ]


class ArtistSerializer(serializers.ModelSerializer):
    """artist serializer"""

    class Meta:
        model = Artist
        fields = ["id", "name"]


class GenreSerializer(serializers.ModelSerializer):
    """genre serializer"""

    class Meta:
        model = Genre
        fields = ["id", "name"]


class UserProfileSerializer(serializers.ModelSerializer):
    """user profile serializer"""

    favorite_artists = ArtistSerializer(many=True, read_only=True)
    favorite_genres = GenreSerializer(many=True, read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "first_name",
            "last_name",
            "faculty",
            "term",
            "profile_photo",
            "favorite_artists",
            "favorite_genres",
        ]


class UserSerializer(serializers.ModelSerializer):
    """user serializer"""

    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ("id", "username", "email", "profile")
