"""Test cases for user registration flow"""

from unittest.mock import patch

import pytest
from django.urls import reverse

from ..models import TemporaryRegistration


@pytest.mark.django_db
class TestRegistrationFlow:
    """Test cases for registration process"""

    def test_magic_link_generation(self, api_client):
        """Test magic link generation"""
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
        test_verification_token.is_used = True
        test_verification_token.save()

        url = reverse("register-init")
        data = {
            "username": "newuser",
            "password": "Testpass123!",
            "email": test_verification_token.email,
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == 200
        assert "setup_token" in response.data

    def test_user_registration_with_invalid_password(
        self, api_client, test_verification_token
    ):
        """Test user registration"""
        test_verification_token.is_used = True
        test_verification_token.save()

        url = reverse("register-init")
        data = {
            "username": "newuser",
            "password": "testpass123",
            "email": test_verification_token.email,
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == 400
        assert "error" in response.data
        assert response.data["error"] == "Registration failed. Please try again."

    def test_user_registration_email_not_verified(self, api_client):
        """Test registration attempt with unverified email"""
        url = reverse("register-init")
        data = {
            "username": "newuser",
            "password": "Testpass123!",
            "email": "unverified@uwaterloo.ca",
        }

        response = api_client.post(url, data, format="json")

        assert response.status_code == 400
        assert "error" in response.data
        assert response.data["error"] == "Email not verified"

    # TOTP Setup Tests
    def test_totp_setup_success(self, api_client):
        """Test successful TOTP setup"""
        temp_reg = TemporaryRegistration.objects.create(
            setup_token="valid_token",
            username="testuser",
            email="test@uwaterloo.ca",
            password="testpass123",
        )

        response = api_client.get(
            reverse("totp-setup"), HTTP_AUTHORIZATION=f"Bearer {temp_reg.setup_token}"
        )

        assert response.status_code == 200
        assert "qr_url" in response.data
        assert response.data["qr_url"].startswith("data:image/svg+xml;base64,")

    def test_totp_setup_invalid_token(self, api_client):
        """Test TOTP setup with invalid token"""
        response = api_client.get(
            reverse("totp-setup"), HTTP_AUTHORIZATION="Bearer invalid_token"
        )

        assert response.status_code == 400
        assert "error" in response.data
        assert response.data["error"] == "Invalid setup token"

    # TOTP Verification Tests
    @patch("pyotp.TOTP.verify")
    def test_totp_verify_success(self, mock_verify, api_client):
        """Test successful TOTP verification"""
        mock_verify.return_value = True
        temp_reg = TemporaryRegistration.objects.create(
            setup_token="valid_token",
            username="testuser",
            email="test@uwaterloo.ca",
            password="testpass123",
            totp_secret="test_secret",
        )

        response = api_client.post(
            reverse("totp-verify"),
            {"code": "123456"},
            HTTP_AUTHORIZATION=f"Bearer {temp_reg.setup_token}",
        )

        assert response.status_code == 200
        assert "user" in response.data
        assert "message" in response.data
        assert response.data["message"] == "TOTP setup successful"

    def test_totp_verify_no_code(self, api_client):
        """Test TOTP verification without code"""
        temp_reg = TemporaryRegistration.objects.create(
            setup_token="valid_token",
            username="testuser",
            email="test@uwaterloo.ca",
            password="testpass123",
            totp_secret="test_secret",
        )

        response = api_client.post(
            reverse("totp-verify"),
            {},
            HTTP_AUTHORIZATION=f"Bearer {temp_reg.setup_token}",
        )

        assert response.status_code == 400
        assert "error" in response.data
        assert response.data["error"] == "No code provided"
