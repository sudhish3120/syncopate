"""
Test cases for concert views.
"""

# pylint: disable=W0621,R0801

import json
import os
from datetime import datetime
from io import BytesIO
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from requests import Response

from ..models import Concert, FavoriteConcert, Matching, UserProfile

User = get_user_model()


@pytest.mark.django_db
class TestConcertsView:
    """Test cases for concert fetching flow"""

    res_body = {}

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setting up tests"""

        file_path = os.path.join(
            os.path.dirname(__file__), "ticketmaster_response.json"
        )
        with open(file_path, encoding="utf-8") as f:
            self.res_body = json.load(f)

    @patch("api.views.concert_views.requests.get")
    def test_concerts(self, mocked_get, authenticated_client):
        """Test basic GET concerts API call"""

        res = Response()
        res.status_code = 200
        res.raw = BytesIO(
            str(json.dumps(self.res_body["populated_response"])).encode("ascii")
        )

        mocked_get.return_value = res
        url = reverse("concerts")
        response = authenticated_client.get(url, format="json")

        assert response.status_code == 200
        assert "concerts" in response.data
        assert (
            response.data["concerts"]
            == self.res_body["populated_response"]["_embedded"]["events"]
        )

    @patch("api.views.concert_views.requests.get")
    def test_nonpopulated_concerts(self, mocked_get, authenticated_client):
        """Test basic GET concerts API call when Ticketmaster returns nothing"""

        res = Response()
        res.raw = BytesIO(
            str(json.dumps(self.res_body["nonpopulated_response"])).encode("ascii")
        )
        res.status_code = 200

        mocked_get.return_value = res
        url = reverse("concerts")
        response = authenticated_client.get(url, format="json")

        assert response.status_code == 200
        assert "concerts" in response.data
        assert response.data["concerts"] == []

    @patch("api.views.concert_views.requests.get")
    def test_concerts_with_query(self, mocked_get, authenticated_client):
        """Test GET concerts API call with search query and location"""

        res = Response()
        res.raw = BytesIO(
            str(json.dumps(self.res_body["populated_response"])).encode("ascii")
        )
        res.status_code = 200

        request_params = {
            "apikey": os.environ["TICKETMASTER_KEY"],
            "radius": "20",
            "unit": "km",
            "classificationName": "Music",
            "includeTest": "no",
            "keyword": "hello",
            "sort": "date,asc",
        }

        mocked_get.return_value = res
        url = reverse("concerts") + "?query=hello"
        response = authenticated_client.get(url, format="json")

        mocked_get.assert_called_once_with(
            f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
            params=request_params,
            timeout=10,
        )

        assert response.status_code == 200
        assert "concerts" in response.data
        assert (
            response.data["concerts"]
            == self.res_body["populated_response"]["_embedded"]["events"]
        )

    @patch("api.views.concert_views.requests.get")
    def test_concerts_with_onsale(self, mocked_get, authenticated_client):
        """Test GET concerts API call with search query and location"""

        res = Response()
        res.raw = BytesIO(
            str(json.dumps(self.res_body["populated_response"])).encode("ascii")
        )
        res.status_code = 200

        today = datetime.today().strftime("%Y-%m-%dT00:00:00Z")
        request_params = {
            "apikey": os.environ["TICKETMASTER_KEY"],
            "radius": "20",
            "unit": "km",
            "classificationName": "Music",
            "includeTest": "no",
            "sort": "date,asc",
            "onsaleStartDateTime": today,
            "startDateTime": today,
        }

        mocked_get.return_value = res
        url = reverse("concerts") + "?onsaleSoon=true"
        response = authenticated_client.get(url, format="json")

        mocked_get.assert_called_once_with(
            f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
            params=request_params,
            timeout=10,
        )

        assert response.status_code == 200
        assert "concerts" in response.data
        assert (
            response.data["concerts"]
            == self.res_body["populated_response"]["_embedded"]["events"]
        )

    @patch("api.views.concert_views.requests.get")
    def test_concerts_with_valid_location(self, mocked_get, authenticated_client):
        """Test GET concerts API call with search query and location"""

        res = Response()
        res.raw = BytesIO(
            str(json.dumps(self.res_body["populated_response"])).encode("ascii")
        )
        res.status_code = 200

        request_params = {
            "apikey": os.environ["TICKETMASTER_KEY"],
            "radius": "20",
            "unit": "km",
            "classificationName": "Music",
            "includeTest": "no",
            "latlong": "43.653225,-79.383186",
            "sort": "date,asc",
        }

        mocked_get.return_value = res
        url = reverse("concerts") + "?location=TO"
        response = authenticated_client.get(url, format="json")

        mocked_get.assert_called_once_with(
            f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
            params=request_params,
            timeout=10,
        )

        assert response.status_code == 200
        assert "concerts" in response.data
        assert (
            response.data["concerts"]
            == self.res_body["populated_response"]["_embedded"]["events"]
        )

    @patch("api.views.concert_views.requests.get")
    def test_concerts_with_invalid_location(self, mocked_get, authenticated_client):
        """Test GET concerts API call with search query and location"""

        res = Response()
        res.raw = BytesIO(
            str(json.dumps(self.res_body["populated_response"])).encode("ascii")
        )
        res.status_code = 200

        mocked_get.return_value = res
        url = reverse("concerts") + "?location=JKAHKJ"
        response = authenticated_client.get(url, format="json")

        assert response.status_code == 500
        assert "error" in response.data
        assert (
            response.data["error"]
            == "Unable to fetch concerts. Please try again later."
        )

    @patch("api.views.concert_views.requests.get")
    def test_concerts_with_query_and_location(self, mocked_get, authenticated_client):
        """Test GET concerts API call with search query and location"""

        res = Response()
        res.raw = BytesIO(
            str(json.dumps(self.res_body["populated_response"])).encode("ascii")
        )
        res.status_code = 200

        request_params = {
            "apikey": os.environ["TICKETMASTER_KEY"],
            "radius": "20",
            "unit": "km",
            "classificationName": "Music",
            "includeTest": "no",
            "keyword": "hello",
            "latlong": "43.653225,-79.383186",
            "sort": "date,asc",
        }

        mocked_get.return_value = res
        url = reverse("concerts") + "?query=hello&location=TO"
        response = authenticated_client.get(url, format="json")

        mocked_get.assert_called_once_with(
            f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
            params=request_params,
            timeout=10,
        )

        assert response.status_code == 200
        assert "concerts" in response.data
        assert (
            response.data["concerts"]
            == self.res_body["populated_response"]["_embedded"]["events"]
        )


@pytest.mark.django_db
class TestFavoriteView:
    """Test cases for favoriting flow"""

    def test_favorite(self, authenticated_client, test_user):
        """Test basic POST favorite API call"""

        assert len(Concert.objects.filter(concert_id="123")) == 0

        url = reverse("favorite")
        response = authenticated_client.post(
            url, format="json", data={"concert": "123"}
        )
        assert response.status_code == 201
        assert "message" in response.data
        assert response.data["message"] == "Concert favorited successfully"

        # concert object created
        concert_objects = Concert.objects.filter(concert_id="123")
        assert len(concert_objects) == 1
        assert concert_objects[0].concert_id == "123"

        # favorite concert object created
        fav_concert_objects = FavoriteConcert.objects.filter(
            concert__concert_id="123", user__id=test_user.id
        )
        assert len(fav_concert_objects) == 1
        assert concert_objects[0] == fav_concert_objects[0].concert

        # through table connected properly
        assert len(concert_objects[0].users_favorited.all()) == 1
        assert len(concert_objects[0].users_favorited.filter(id=test_user.id)) == 1

    def test_favoriting_same_concert(self, authenticated_client, test_user):
        """Test basic POST favorite API call"""

        concert = Concert.objects.create(concert_id="123")
        assert len(Concert.objects.filter(concert_id="123")) == 1

        FavoriteConcert.objects.create(concert=concert, user=test_user)
        assert (
            len(
                FavoriteConcert.objects.filter(
                    concert__concert_id="123", user__id=test_user.id
                )
            )
            == 1
        )

        url = reverse("favorite")
        response = authenticated_client.post(
            url, format="json", data={"concert": "123"}
        )
        assert response.status_code == 200
        assert "message" in response.data
        assert response.data["message"] == "Concert already favorited"

        # check that no other objects were created
        assert len(Concert.objects.filter(concert_id="123")) == 1
        assert (
            len(
                FavoriteConcert.objects.filter(
                    concert__concert_id="123", user__id=test_user.id
                )
            )
            == 1
        )

    def test_favoriting_concert_with_no_id(self, authenticated_client):
        """Test basic POST favorite API call"""

        url = reverse("favorite")
        response = authenticated_client.post(url, format="json")
        assert response.status_code == 500
        assert "error" in response.data
        assert response.data["error"] == "Failed to create/fetch concert"


@pytest.mark.django_db
class TestUserFavoritedConcertsView:
    """Test cases for user favorited concert flow"""

    res_body = {}

    @pytest.fixture(autouse=True)
    def setup(self):
        """Setting up tests"""

        file_path = os.path.join(
            os.path.dirname(__file__), "ticketmaster_response.json"
        )
        with open(file_path, encoding="utf-8") as f:
            self.res_body = json.load(f)

    @patch("api.views.concert_views.requests.get")
    def test_user_favorited_concerts(self, mocked_get, authenticated_client, test_user):
        """Test basic GET user favorited concerts API call"""

        concert = Concert.objects.create(concert_id="123")
        FavoriteConcert.objects.create(concert=concert, user=test_user)

        res = Response()
        res.raw = BytesIO(
            str(
                json.dumps(
                    {
                        "page": {"totalElements": 1},
                        "_embedded": {"events": [{"name": "hello"}]},
                    }
                )
            ).encode("ascii")
        )
        res.status_code = 200

        request_params = {
            "apikey": os.environ["TICKETMASTER_KEY"],
            "id": "123",
            "includeTest": "no",
        }
        mocked_get.return_value = res

        url = reverse("favorites")
        response = authenticated_client.get(url, format="json")

        mocked_get.assert_called_with(
            f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
            params=request_params,
            timeout=10,
        )

        assert response.status_code == 200
        assert "concerts" in response.data
        assert len(response.data["concerts"]) == 1
        assert response.data["concerts"][0] == {"name": "hello"}

    @patch("api.views.concert_views.requests.get")
    def test_user_favorited_concerts_with_no_concerts(
        self, mocked_get, authenticated_client
    ):
        """Test basic GET user favorited concerts API call"""

        url = reverse("favorites")
        response = authenticated_client.get(url, format="json")

        mocked_get.assert_not_called()

        assert response.status_code == 200
        assert "concerts" in response.data
        assert len(response.data["concerts"]) == 0

    @patch("api.views.concert_views.requests.get")
    def test_user_favorited_concerts_with_other_users(
        self, mocked_get, authenticated_client, other_user
    ):
        """Test basic GET user favorited concerts API call"""

        concert = Concert.objects.create(concert_id="123")
        FavoriteConcert.objects.create(concert=concert, user=other_user)

        url = reverse("favorites")
        response = authenticated_client.get(url, format="json")

        mocked_get.assert_not_called()

        assert response.status_code == 200
        assert "concerts" in response.data
        assert len(response.data["concerts"]) == 0


@pytest.mark.django_db
class TestReviewMatchingView:
    """Test cases for review matching flow"""

    def test_review_matching(self, authenticated_client, test_user, other_user):
        """Test basic POST review match API call"""

        matching = Matching.objects.create(
            user=test_user, target=other_user, decision="UNKNOWN"
        )

        url = reverse("review-matching")
        response = authenticated_client.post(
            url, format="json", data={"matchingId": matching.id, "decision": "YES"}
        )

        assert response.status_code == 200
        assert "message" in response.data
        assert response.data["message"] == "Matching processed successfully"

    def test_review_already_reviewed_matching(
        self, authenticated_client, test_user, other_user
    ):
        """Test basic POST review match API call"""

        matching = Matching.objects.create(
            user=test_user, target=other_user, decision="YES"
        )

        url = reverse("review-matching")
        response = authenticated_client.post(
            url, format="json", data={"matchingId": matching.id, "decision": "YES"}
        )

        assert response.status_code == 500
        assert "error" in response.data
        assert response.data["error"] == "Failed to process matching"

    def test_invalid_matching(self, authenticated_client, test_user, other_user):
        """Test basic POST review match API call"""

        matching = Matching.objects.create(
            user=test_user, target=other_user, decision="UNKNOWN"
        )

        url = reverse("review-matching")
        response = authenticated_client.post(
            url, format="json", data={"matchingId": matching.id + 1, "decision": "YES"}
        )

        assert response.status_code == 500
        assert "error" in response.data
        assert response.data["error"] == "Failed to process matching"

    def test_invalid_unknown_decision(
        self, authenticated_client, test_user, other_user
    ):
        """Test basic POST review match API call"""

        matching = Matching.objects.create(
            user=test_user, target=other_user, decision="UNKNOWN"
        )

        url = reverse("review-matching")
        response = authenticated_client.post(
            url, format="json", data={"matchingId": matching.id, "decision": "UNKNOWN"}
        )

        assert response.status_code == 500
        assert "error" in response.data
        assert response.data["error"] == "Failed to process matching"

    def test_invalid_decision_not_unknown(
        self, authenticated_client, test_user, other_user
    ):
        """Test basic POST review match API call"""

        matching = Matching.objects.create(
            user=test_user, target=other_user, decision="UNKNOWN"
        )

        url = reverse("review-matching")
        response = authenticated_client.post(
            url,
            format="json",
            data={"matchingId": matching.id, "decision": "kaldjlaldjla"},
        )

        assert response.status_code == 500
        assert "error" in response.data
        assert response.data["error"] == "Failed to process matching"

    def test_review_matching_with_no_matching_id(
        self, authenticated_client, test_user, other_user
    ):
        """Test basic POST review match API call"""

        Matching.objects.create(user=test_user, target=other_user, decision="UNKNOWN")

        url = reverse("review-matching")
        response = authenticated_client.post(
            url, format="json", data={"decision": "YES"}
        )

        assert response.status_code == 500
        assert "error" in response.data
        assert response.data["error"] == "Failed to process matching"

    def test_review_matching_with_no_decision(
        self, authenticated_client, test_user, other_user
    ):
        """Test basic POST review match API call"""

        matching = Matching.objects.create(
            user=test_user, target=other_user, decision="UNKNOWN"
        )

        url = reverse("review-matching")
        response = authenticated_client.post(
            url, format="json", data={"matchingId": matching.id}
        )

        assert response.status_code == 500
        assert "error" in response.data
        assert response.data["error"] == "Failed to process matching"


@pytest.mark.django_db
class TestMatchesView:
    """Test cases for matches flow"""

    def test_matches_with_no_matches(self, authenticated_client):
        """Test basic GET matches API call"""

        url = reverse("matches")
        response = authenticated_client.get(url, format="json")
        assert response.status_code == 200
        assert "matches" in response.data
        assert response.data["matches"] == []

    def test_matches_with_match(self, authenticated_client, test_user, other_user):
        """Test basic GET matches API call"""

        Matching.objects.create(user=test_user, target=other_user, decision="YES")
        Matching.objects.create(user=other_user, target=test_user, decision="YES")

        target_profile_photo = UserProfile.objects.filter(user=other_user).first().profile_photo
        target_name = UserProfile.objects.filter(user=other_user).first().first_name + " " + UserProfile.objects.filter(user=other_user).first().last_name
        target_faculty = UserProfile.objects.filter(user=other_user).first().faculty
        target_academic_term = UserProfile.objects.filter(user=other_user).first().term

        url = reverse("matches")
        response = authenticated_client.get(url, format="json")

        assert response.status_code == 200
        assert "matches" in response.data
        assert len(response.data["matches"]) == 1
        matched_concerts = Matching.objects.get(user=test_user, target=other_user).matched_concerts.values_list("concert_id", flat=True)
        print("Response Data:", response.data)
    # Check that the response matches the expected format and data
        assert response.data["matches"][0] == {
            "username": other_user.username,
            "profile_photo": target_profile_photo,
            "target_name": target_name,
            "target_faculty": target_faculty,
            "target_academic_term": target_academic_term,
            "concerts": list(matched_concerts)
        }

        
    def test_matches_with_other_user_rejection(
        self, authenticated_client, test_user, other_user
    ):
        """Test basic GET matches API call"""

        Matching.objects.create(user=test_user, target=other_user, decision="YES")
        Matching.objects.create(user=other_user, target=test_user, decision="NO")

        url = reverse("matches")
        response = authenticated_client.get(url, format="json")
        assert response.status_code == 200
        assert "matches" in response.data
        assert response.data["matches"] == []

    def test_matches_with_self_rejection(
        self, authenticated_client, test_user, other_user
    ):
        """Test basic GET matches API call"""

        Matching.objects.create(user=test_user, target=other_user, decision="NO")
        Matching.objects.create(user=other_user, target=test_user, decision="YES")

        url = reverse("matches")
        response = authenticated_client.get(url, format="json")
        assert response.status_code == 200
        assert "matches" in response.data
        assert response.data["matches"] == []

    def test_matches_with_undecided(self, authenticated_client, test_user, other_user):
        """Test basic GET matches API call"""

        self_decision = Matching.objects.create(
            user=test_user, target=other_user, decision="UNKNOWN"
        )
        other_decision = Matching.objects.create(
            user=other_user, target=test_user, decision="UNKNOWN"
        )

        url = reverse("matches")
        response = authenticated_client.get(url, format="json")
        assert response.status_code == 200
        assert "matches" in response.data
        assert response.data["matches"] == []

        self_decision.decision = "YES"
        self_decision.save()

        url = reverse("matches")
        response = authenticated_client.get(url, format="json")
        assert response.status_code == 200
        assert "matches" in response.data
        assert response.data["matches"] == []

        other_decision.decision = "YES"
        other_decision.save()
        self_decision.decision = "UNKNOWN"
        self_decision.save()

        url = reverse("matches")
        response = authenticated_client.get(url, format="json")
        assert response.status_code == 200
        assert "matches" in response.data
        assert response.data["matches"] == []
