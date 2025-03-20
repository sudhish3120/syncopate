""" 
Test cases for authentication flow 
"""

import pytest
from django.urls import reverse
from rest_framework import status


# marker required for test db access
@pytest.mark.django_db
class TestAuthenticationFlow:
    """Test cases for authentication flow"""

    def test_magic_link_generation(self, api_client):
        """Test magic link generation"""
        # to generates url given name (in urls.py)
        url = reverse("send_magic_link")
        data = {"email": "test@uwaterloo.ca"}

        response = api_client.post(url, data, format="json")

        assert response.status_code == 200
        assert "message" in response.data
        assert response.data["message"] == "Verification email sent"

    def test_invalid_email_magic_link(self, api_client):
        """Test magic link generation with invalid email"""
        url = reverse("send_magic_link")
        data = {"email": "invalid@gmail.com"}

        response = api_client.post(url, data, format="json")

        assert response.status_code == 400
        assert "error" in response.data
        assert "Must be a UWaterloo email address" in response.data["error"]

    def test_user_registration(self, api_client, test_verification_token):
        """Test user registration"""
        # Email should be verified if we want to register user
        test_verification_token.is_used = True
        test_verification_token.save()

        url = reverse("register-init")
        data = {
            "username": "newuser",
            "password": "testpass123",
            "email": test_verification_token.email,
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == 200
        assert "setup_token" in response.data

    def test_protected_endpoint_access(self, authenticated_client):
        """Test access to protected endpoint with authentication"""
        url = reverse("user-details")
        response = authenticated_client.get(url)

        assert response.status_code == 200
        assert "user" in response.data

    def test_unauthorized_access(self, api_client):
        """Test access to protected endpoint without authentication"""
        url = reverse("user-details")
        response = api_client.get(url)

        assert response.status_code == 401
