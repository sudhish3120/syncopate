from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from django.http import JsonResponse
from rest_framework import generics, permissions, status
from knox.views import LoginView as KnoxLoginView
from knox.auth import TokenAuthentication
from knox.models import AuthToken
import requests
import os
import logging
from ..models import Concert, FavoriteConcert, Artist, Venue
from ..serializers import ConcertSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination


@api_view(["GET"])
def spotify_login(request):
    try:
        request_params = {}

        response = requests.get(
            f'{os.environ["TICKETMASTER_URL_BASE"]}/events', params=request_params
        )

        events = response.json()["_embedded"]["events"]
        for event in events:
            artist_name = event["name"]
            venue_name = event["_embedded"]["venues"][0]["name"]
            venue_address = event["_embedded"]["venues"][0]["address"]["line1"]
            concert_date = event["dates"]["start"]["dateTime"]
            ticket_url = event["url"]

            artist, _ = Artist.objects.get_or_create(name=artist_name)
            venue, _ = Venue.objects.get_or_create(
                name=venue_name, address=venue_address
            )
            Concert.objects.get_or_create(
                name=event["name"],
                artist=artist,
                venue=venue,
                date=concert_date,
                ticket_url=ticket_url,
            )
        return JsonResponse(events, safe=False)
    except Exception as e:
        logger.error(f"Concert fetch error: {str(e)}")
        return JsonResponse({"error": "Failed to fetch concerts"}, status=500)
