""" 
Test cases for concert views.
"""

# pylint: disable=W0621

from requests import Response
import json
import os
import pytest
from unittest.mock import patch, Mock
from django.urls import reverse


@pytest.mark.django_db
class TestConcertViews:
    """Test cases for authentication flow"""

    @pytest.fixture(autouse=True)
    def setup(self):
        self.res_body = {}
        file_path = os.path.join(
            os.path.dirname(__file__), "ticketmaster_response.json"
        )
        with open(file_path, encoding="utf-8") as f:
            self.res_body = json.load(f)

    @patch("api.views.concert_views.requests.get")
    def test_concerts(self, mocked_get, authenticated_client):
        """Test magic link generation"""
        
        res = Response()
        res._content = str(json.dumps(self.res_body["populated_response"])).encode("ascii")
        res.status_code = 200

        mocked_get.return_value = res
        url = reverse("concerts")
        response = authenticated_client.get(url, format="json")

        assert response.status_code == 200
        assert "concerts" in response.data
        assert response.data["concerts"] == self.res_body["populated_response"]["_embedded"]["events"]
