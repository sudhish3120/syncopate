from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.gis.measure import D
from .models import Concert, FavoriteConcert
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(style={'input_type': 'password'}, trim_whitespace=False)

# class ArtistSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Artist
#         fields = ['id', 'name']

# class VenueSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Venue
#         fields = ['id', 'name', 'address']

class ConcertSerializer(serializers.ModelSerializer):
    # artist = ArtistSerializer()
    # venue = VenueSerializer()
    users_favorited = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Concert
        fields = ['id', 'concert_id', 'users_favorited']

class FavoriteConcertSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoriteConcert
        fields = ['id', 'user', 'concert', 'date_favorited']
