"""Test fixtures for the API tests."""

# pylint: disable=W0621
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from ..models import EmailVerificationToken

User = get_user_model()

@pytest.fixture
def api_client():
    """Return a Django REST framework APIClient instance."""
    return APIClient()

@pytest.fixture
def test_user():
    """Create and return a test user."""
    user = User.objects.create_user(
        username="testuser", password="testpass123", email="test@uwaterloo.ca"
    )
    return user

@pytest.fixture
def test_verification_token(test_user):
    """Create and return a test verification token."""
    return EmailVerificationToken.generate_token(test_user.email)

@pytest.fixture
def authenticated_client(api_client, test_user):
    """Return an authenticated API client."""
    api_client.force_authenticate(user=test_user)
    return api_client
