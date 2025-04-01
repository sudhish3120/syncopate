"""
This module contains all the views related with concert interractions
"""

# pylint: disable=W0719

import json
import logging
import os
from datetime import datetime

import requests
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from rest_framework.decorators import (api_view, authentication_classes,
                                       permission_classes)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from ..authentication import CookieTokenAuthentication
from ..models import (MATCHING_DECISIONS, Concert, FavoriteConcert, Matching,
                      UserProfile)

logger = logging.getLogger(__name__)
User = get_user_model()

LOCATIONS = {"KW": "43.449791,-80.489090", "TO": "43.653225,-79.383186"}
VENUES = {"HISTORY": "KovZ917AJ4f"}


@api_view(["GET"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def concerts(request):
    """fetch all concerts based on query passed in"""
    try:
        request_params = {
            "apikey": os.environ["TICKETMASTER_KEY"],
            "radius": "20",
            "unit": "km",
            "classificationName": "Music",
            "includeTest": "no",
            "sort": "date,asc",
        }

        search_params = request.GET.get("query", None)
        location_params = request.GET.get("location", "ALL")
        venue_params = request.GET.get("venue", None)
        onsale_params = request.GET.get("onsaleSoon", False)

        if search_params:
            request_params["keyword"] = search_params
        if location_params != "ALL":
            request_params["latlong"] = LOCATIONS[location_params]
        if venue_params:
            request_params["venueId"] = VENUES[venue_params]
        if onsale_params:
            today = datetime.today().strftime("%Y-%m-%dT00:00:00Z")
            request_params["onsaleStartDateTime"] = today
            request_params["startDateTime"] = today

        response = requests.get(
            f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
            params=request_params,
            timeout=10,
        ).json()

        events = []
        logger.info(
            "total retrieved events: %s",
            response.get("page", {}).get("totalElements", 0),
        )
        if "page" in response and response["page"]["totalElements"] > 0:
            events = response["_embedded"]["events"]

        return Response({"concerts": events}, status=200)
    except Exception as e:
        logger.error("Concert fetch error: %s", str(e))
        return Response(
            {"error": "Unable to fetch concerts. Please try again later."}, status=500
        )


@api_view(["POST"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def favorite(request):
    """user favoriting a concert"""
    try:
        user = request.user
        concert_id = request.data.get("concert")

        if not concert_id:
            raise Exception()

        # Ensure the concert exists and add it if it does not
        concert, created = Concert.objects.get_or_create(concert_id=concert_id)
    except Exception:
        return Response({"error": "Failed to create/fetch concert"}, status=500)
    # Favourite a concert logic
    try:
        _favorite, created = FavoriteConcert.objects.get_or_create(
            user=user, concert=concert
        )
        if created:
            return Response({"message": "Concert favourited successfully"}, status=201)
        return Response({"message": "Concert already favourited"}, status=200)

    except Exception:
        return Response({"error": "Failed to favorite concert"}, status=500)


@api_view(["GET"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def user_favourite_concerts(request):
    """fetching all the concerts that users favorited"""
    try:
        fav_concerts = FavoriteConcert.objects.filter(user_id=request.user.id)
        tm_concert_ids = Concert.objects.filter(
            id__in=fav_concerts.values_list("concert_id")
        ).values_list("concert_id", flat=True)

        fetched_concerts = []
        for concert_id in tm_concert_ids:
            request_params = {
                "apikey": os.environ["TICKETMASTER_KEY"],
                "id": concert_id,
                "includeTest": "no",
            }

            response = requests.get(
                f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
                params=request_params,
                timeout=10,
            ).json()

            if response["page"]["totalElements"] > 0:
                fetched_concerts.append(response["_embedded"]["events"][0])

        return Response({"concerts": fetched_concerts}, status=200)
    except Exception:
        return Response({"error": "Unable to fetch favourited concerts"}, status=500)


@api_view(["GET"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def matchings(request):
    """get all the matchings associated with user"""
    try:
        user_matchings = []
        current_user = request.user
        fav_concerts = FavoriteConcert.objects.filter(user_id=current_user.id)
        user_concerts = Concert.objects.filter(
            id__in=fav_concerts.values_list("concert_id")
        )

        all_other_users = User.objects.exclude(id=request.user.id)
        for other_user in all_other_users:
            other_fav_concerts = FavoriteConcert.objects.filter(user_id=other_user.id)
            other_concerts = Concert.objects.filter(
                id__in=other_fav_concerts.values_list("concert_id")
            )
            # has at least 1 common concert
            if (user_concerts & other_concerts).exists():
                preexisting_match = Matching.objects.filter(
                    user=current_user, target=other_user
                ).exclude(decision="UNKNOWN")
                target_profile_photo = (
                    UserProfile.objects.filter(user=other_user).first().profile_photo
                )
                target_name = (
                    UserProfile.objects.filter(user=other_user).first().first_name
                    + " "
                    + UserProfile.objects.filter(user=other_user).first().last_name
                )
                target_faculty = (
                    UserProfile.objects.filter(user=other_user).first().faculty
                )
                target_academic_term = (
                    UserProfile.objects.filter(user=other_user).first().term
                )
                if not preexisting_match:
                    matching, _created = Matching.objects.get_or_create(
                        user=current_user, target=other_user, decision="UNKNOWN"
                    )
                    user_matchings.append(
                        {
                            "id": matching.id,
                            "username": matching.target.username,
                            "profile_photo": target_profile_photo,
                            "target_name": target_name,
                            "target_faculty": target_faculty,
                            "target_academic_term": target_academic_term,
                        }
                    )

        return Response({"matchings": user_matchings}, status=200)
    except Exception:
        return Response({"error": "Error fetching matchings"}, status=500)


@api_view(["POST"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def review_matching(request):
    """process user's decision on a specific matching"""
    try:
        content = json.loads(request.body.decode("utf-8"))
        matching_id = content.get("matchingId")
        if not matching_id:
            raise Exception()
        matching = Matching.objects.get(
            id=matching_id, user=request.user, decision="UNKNOWN"
        )

        decision = content.get("decision")
        if decision in dict(MATCHING_DECISIONS) and decision != "UNKNOWN":
            matching.decision = decision
            matching.save()
        else:
            raise Exception()

        return Response({"message": "Matching processed successfully"}, status=200)
    except Exception:
        return Response({"error": "Failed to process matching"}, status=500)


@api_view(["GET"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def matches(request):
    """get all the matches for user"""
    try:
        user_matches = Matching.objects.filter(
            user=request.user, decision="YES"
        ).values_list("target_id", flat=True)
        other_matches = Matching.objects.filter(
            user_id__in=user_matches, target=request.user, decision="YES"
        )

        other_matches_json = []
        for match in other_matches:
            target_user = match.user
            target_profile = UserProfile.objects.filter(user=target_user).first()
            other_matches_json.append({
                "username": target_user.username,
                "profile_photo": target_profile.profile_photo if target_profile else None,
                "target_name": f"{target_profile.first_name} {target_profile.last_name}" if target_profile else None,
                "target_faculty": target_profile.faculty if target_profile else None,
                "target_academic_term": target_profile.term if target_profile else None,
            })

        return Response({"matches": other_matches_json}, status=200)
    except Exception as e:
        return Response({"error": "Failed to fetch matching"}, status=e)
