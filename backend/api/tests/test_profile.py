"""
This module tests profile API endpoints.
"""

import pytest
from django.urls import reverse

from ..models import UserProfile


@pytest.mark.django_db
class TestProfileAPI:
    """Test cases for profile management"""

    def test_get_user_profile(self, authenticated_client, test_user):
        """Test fetching user profile"""
        url = reverse("user-details")
        response = authenticated_client.get(url)

        assert response.status_code == 200
        assert "user" in response.data
        assert "profile" in response.data["user"]
        assert response.data["user"]["username"] == test_user.username

    def test_update_profile_photo(self, authenticated_client):
        """Test updating profile photo"""
        url = reverse("update-profile")
        data = {"profile_photo": "/avatars/2.jpg"}

        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == 200
        assert response.data["user"]["profile"]["profile_photo"] == "/avatars/2.jpg"

    def test_update_invalid_profile_photo(self, authenticated_client):
        """Test updating with invalid profile photo"""
        url = reverse("update-profile")
        data = {"profile_photo": "/invalid/path.jpg"}

        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == 400
        assert "error" in response.data

    def test_update_favorite_artists(self, authenticated_client):
        """Test updating favorite artists"""
        url = reverse("update-profile")
        data = {"favorite_artists": ["Artist 1", "Artist 2"]}

        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == 200
        assert len(response.data["user"]["profile"]["favorite_artists"]) == 2

    def test_update_too_many_artists(self, authenticated_client):
        """Test adding more than allowed artists"""
        url = reverse("update-profile")
        data = {"favorite_artists": ["Artist 1", "Artist 2", "Artist 3", "Artist 4"]}

        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == 400
        assert "invalid input" in response.data["error"].lower()

    def test_update_invalid_artist_name(self, authenticated_client):
        """Test adding artist with invalid characters"""
        url = reverse("update-profile")
        data = {"favorite_artists": ["Artist@123#"]}

        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == 400
        assert "invalid input" in response.data["error"].lower()

    def test_update_favorite_genres(self, authenticated_client):
        """Test updating favorite genres"""
        url = reverse("update-profile")
        data = {"favorite_genres": ["Indie Pop", "Alternative Pop"]}

        response = authenticated_client.post(url, data, format="json")
        assert response.status_code == 200
        assert len(response.data["user"]["profile"]["favorite_genres"]) == 2

    def test_profile_creation_on_user_creation(self, test_user):
        """Test profile is automatically created for new users"""
        assert hasattr(test_user, "profile")
        assert isinstance(test_user.profile, UserProfile)

    def test_concurrent_updates(self, authenticated_client):
        """Test handling concurrent profile updates"""
        url = reverse("update-profile")
        data1 = {"favorite_artists": ["Artist 1"]}
        data2 = {"favorite_genres": ["Genre 1"]}

        response1 = authenticated_client.post(url, data1, format="json")
        response2 = authenticated_client.post(url, data2, format="json")

        assert response1.status_code == 200
        assert response2.status_code == 200

        final_response = authenticated_client.get(reverse("user-details"))
        assert len(final_response.data["user"]["profile"]["favorite_artists"]) == 1
        assert len(final_response.data["user"]["profile"]["favorite_genres"]) == 1


@pytest.fixture
def profile_data():
    """Fixture for common profile test data"""
    return {
        "profile_photo": "/avatars/1.jpg",
        "favorite_artists": ["Artist 1", "Artist 2"],
        "favorite_genres": ["Genre 1", "Genre 2"],
    }
