import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from ..models import EmailVerificationToken, TemporaryRegistration


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user():
    user = User.objects.create_user(
        username="testuser", password="testpass123", email="test@uwaterloo.ca"
    )
    return user


@pytest.fixture
def test_verification_token(test_user):
    return EmailVerificationToken.generate_token(test_user.email)


@pytest.fixture
def authenticated_client(api_client, test_user):
    # basically skips the entire token auth process and assumes user is authenticated
    api_client.force_authenticate(user=test_user)
    return api_client
