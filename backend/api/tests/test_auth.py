"""Test cases for authentication flow"""

import base64
import os

import pyotp
import pytest
from django.urls import reverse
from django_otp.plugins.otp_totp.models import TOTPDevice


@pytest.mark.django_db
class TestAuthenticationFlow:
    """Test cases for general authentication"""

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

    def test_login_invalid_credentials(self, api_client):
        """Test login with invalid credentials"""
        url = reverse("login")
        data = {"username": "nonexistent", "password": "wrongpass"}
        response = api_client.post(url, data, format="json")

        assert response.status_code == 401
        assert "error" in response.data

    def test_login_with_2fa_valid(self, api_client, test_user):
        """Test login with valid credentials and valid TOTP code when 2FA is enabled"""
        # Create and configure TOTP device with proper secret
        secret = base64.b32encode(
            os.urandom(10)
        ).decode()  # Generate valid base32 secret
        TOTPDevice.objects.create(user=test_user, confirmed=True, key=secret)

        totp = pyotp.TOTP(secret)
        valid_code = totp.now()

        url = reverse("login")
        data = {
            "username": "testuser",
            "password": "testpass123",
            "totp_code": valid_code,
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == 200
        assert "user" in response.data
        assert "knox_token" in response.cookies

    def test_login_without_2fa(self, api_client):
        """Test login with valid credentials when 2FA is disabled"""
        url = reverse("login")
        data = {"username": "testuser", "password": "testpass123"}

        response = api_client.post(url, data, format="json")

        assert response.status_code == 200
        assert "user" in response.data
        assert "knox_token" in response.cookies

    def test_login_with_invalid_totp(self, api_client, test_user):
        """Test login with valid credentials but invalid TOTP code"""
        # Create and configure TOTP device with proper secret
        secret = base64.b32encode(os.urandom(10)).decode()
        TOTPDevice.objects.create(user=test_user, confirmed=True, key=secret)

        url = reverse("login")
        data = {
            "username": "testuser",
            "password": "testpass123",
            "totp_code": "123456",  # Wrong TOTP code
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == 401
        assert "error" in response.data
        assert response.data["error"] == "Invalid TOTP code"

    def test_logout(self, authenticated_client):
        """Test user logout"""
        url = reverse("logout")
        response = authenticated_client.post(url)

        assert response.status_code == 200
        # Check if cookie is present and has proper deletion attributes
        assert "knox_token" in response.cookies
        knox_cookie = response.cookies["knox_token"]
        assert knox_cookie["max-age"] == 0  # Cookie is expired
        assert knox_cookie.value == ""  # Cookie value is cleared
