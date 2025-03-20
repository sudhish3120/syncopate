from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.status import status
from django.http import JsonResponse
from django.contrib.auth.models import User
import requests
import os
import logging
import json

from ..authentication import CookieTokenAuthentication
from ..models import Concert, FavoriteConcert, Matching, MATCHING_DECISIONS
from ..serializers import ConcertSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

logger = logging.getLogger(__name__)

LOCATIONS = {"KW": "43.449791,-80.489090", "TO": "43.653225,-79.383186"}


class ConcertPagination(PageNumberPagination):
    page_size = 10  # Number of concerts per page
    page_size_query_param = "page_size"
    max_page_size = 100


@api_view(["GET"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def get_concert_in_db(request):
    try:
        name = request.GET.get("artist", None)
        concerts = Concert.objects.all()
        if name:
            concerts = concerts.filter(artist__name__iscontains=name)
        paginator = ConcertPagination()
        paginated_concerts = paginator.paginate_queryset(concerts, request)
        serialized_concerts = ConcertSerializer(paginated_concerts, many=True)
        return paginator.get_paginated_response(serialized_concerts.data)
    except Exception as e:
        logger.error(f"Database query error: {str(e)}")
        return Response(
            {"error": "Unable to fetch concerts. Please try again later."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def concerts(request):
    try:
        request_params = {
            "apikey": os.environ["TICKETMASTER_KEY"],
            "radius": "20",
            "unit": "km",
            "classificationName": "Music",
            "includeTest": "no",
        }

        search_params = request.GET.get("query", None)
        location_params = request.GET.get("location", "ALL")

        if search_params:
            request_params["keyword"] = search_params
        if location_params != "ALL":
            request_params["latlong"] = LOCATIONS[location_params]

        response = requests.get(
            f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
            params=request_params,
            timeout=10,
        ).json()

        events = []
        if response["page"]["totalElements"] > 0:
            events = response["_embedded"]["events"]

        return JsonResponse(events, safe=False)
    except Exception as e:
        logger.error(f"Concert fetch error: {str(e)}")
        return JsonResponse(
            {"error": "Unable to fetch concerts. Please try again later."}, status=500
        )


@api_view(["POST"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def favorite(request):
    user = request.user
    concert_id = request.data.get("concert")
    # Ensure the concert exists add add it if it does not
    try:
        concert, created = Concert.objects.get_or_create(concert_id=concert_id)
    except Exception as e:
        return Response({"error: ": "Failed to create/fetch concert"}, status=e)
    # Favourite a concert logic
    try:
        favorite, created = FavoriteConcert.objects.get_or_create(
            user=user, concert=concert
        )
        if created:
            return Response(
                {"Concert favourited successfully"}, status=status.HTTP_201_CREATED
            )
        else:
            return Response({"Concert already favourited"}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"error: ": "Failed to favorite concert"}, status=e)


@api_view(["GET"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def user_favourite_concerts(request):
    try:
        concerts = FavoriteConcert.objects.filter(user_id=request.user.id)
        tm_concert_ids = Concert.objects.filter(
            id__in=concerts.values_list("concert_id")
        ).values_list("concert_id", flat=True)

        fetched_concerts = []
        for concert_id in tm_concert_ids:
            request_params = {
                "apikey": os.environ["TICKETMASTER_KEY"],
                "id": str(concert_id),
                "includeTest": "no",
            }

            response = requests.get(
                f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
                params=request_params,
                timeout=10,
            ).json()
            if response["page"]["totalElements"] > 0:
                fetched_concerts.append(response["_embedded"]["events"][0])

        return Response({"concerts": fetched_concerts})

    except Exception as e:
        print(f"ERROR {e}")
        return Response({"error", "Unable to fetch favourited concerts"})


@api_view(["GET"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def matchings(request):
    try:
        matchings = []

        current_user = request.user
        fav_concerts = FavoriteConcert.objects.filter(user_id=current_user.id)
        concerts = Concert.objects.filter(id__in=fav_concerts.values_list("concert_id"))

        all_other_users = User.objects.exclude(id=request.user.id)
        for other_user in all_other_users:
            other_fav_concerts = FavoriteConcert.objects.filter(user_id=other_user.id)
            other_concerts = Concert.objects.filter(
                id__in=other_fav_concerts.values_list("concert_id")
            )

            # has at least 1 common concert
            if (concerts & other_concerts).exists():
                preexisting_match = Matching.objects.filter(
                    user=current_user, target=other_user
                ).exclude(decision="UNKNOWN")
                if not preexisting_match:
                    matching, created = Matching.objects.get_or_create(
                        user=current_user, target=other_user, decision="UNKNOWN"
                    )
                    matchings.append(
                        {"id": matching.id, "username": matching.target.username}
                    )

        return Response({"matchings": matchings}, status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        return Response({"error": "Error fetching matchings"}, status=500)


@api_view(["POST"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def review_matching(request):
    try:
        content = json.loads(request.body.decode("utf-8"))
        matching_id = content.get("matchingId")
        matching = Matching.objects.get(id=matching_id)
        if not matching:
            return Response({"error": "Cannot process matching decision"}, status=500)

        decision = content.get("decision")
        if decision in dict(MATCHING_DECISIONS) and decision != "UNKNOWN":
            matching.decision = decision
            matching.save()
        else:
            return Response({"error": "Cannot process matching decision"}, status=500)

        return Response({"Matching processed successfully"}, status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        return Response({"error": "Failed to process matching"}, status=500)


@api_view(["GET"])
@authentication_classes([CookieTokenAuthentication])
@permission_classes([IsAuthenticated])
def matches(request):
    try:
        user_matches = Matching.objects.filter(
            user=request.user, decision="YES"
        ).values_list("target_id", flat=True)
        other_matches = Matching.objects.filter(
            user_id__in=user_matches, target=request.user, decision="YES"
        )

        other_matches_json = list(
            map(lambda x: {"username": x.user.username}, other_matches)
        )
        return Response({"matches": other_matches_json}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": "Failed to fetch matching"}, status=e)
