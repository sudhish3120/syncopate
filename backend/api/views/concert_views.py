from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
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

logger = logging.getLogger(__name__)

class ConcertPagination(PageNumberPagination):
    page_size = 10  # Number of concerts per page
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(["GET"])
def get_concert_in_db(request):
    try:
        name = request.GET.get("artist", None)
        concerts = Concert.objects.all()
        if name:
            concerts = concerts.filter(artist__name__iscontains=name)
        paginator = ConcertPagination()
        paginated_concerts = paginator.paginate_queryset(concerts, request)
        serialized_concerts = ConcertSerializer(paginated_concerts, many = True)
        return paginator.get_paginated_response(serialized_concerts.data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def concerts(request):
    try:
        search_params = request.GET.get("query", "")

        request_params = {
            'apikey': os.environ["TICKETMASTER_KEY"],
            'latlong': "43.653225,-79.383186",
            'radius': '20',
            'unit': 'km',
            'classificationName': 'Music',
            'includeTest': 'no',
            'keyword': search_params
        }

        response = requests.get(
            f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
            params=request_params
        )

        events = response.json()["_embedded"]["events"]
        for event in events:
            artist_name = event["name"]
            venue_name = event["_embedded"]["venues"][0]["name"]
            venue_address = event["_embedded"]["venues"][0]["address"]["line1"]
            concert_date = event["dates"]["start"]["dateTime"]
            ticket_url = event["url"]

            artist, _ = Artist.objects.get_or_create(name=artist_name)
            venue, _ = Venue.objects.get_or_create(name=venue_name, address=venue_address)
            Concert.objects.get_or_create(
                name=event["name"],
                artist=artist,
                venue=venue,
                date=concert_date,
                ticket_url=ticket_url
            )
        return JsonResponse(events, safe=False)
    except Exception as e:
        logger.error(f"Concert fetch error: {str(e)}")
        return JsonResponse({"error": "Failed to fetch concerts"}, status=500)


class FavoriteConcertView(generics.CreateAPIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        concert_id = request.data.get('concert')
        # Ensure the concert exists
        try:
            concert = Concert.objects.get(id=concert_id)
        except Concert.DoesNotExist:
            return Response({"error": "Concert not found"}, status=status.HTTP_404_NOT_FOUND)

        # Check if the user has already favorited the concert
        favorite, created = FavoriteConcert.objects.get_or_create(user=user, concert=concert)
        if created:
            return Response({"message": "Concert favorited successfully"}, status=status.HTTP_201_CREATED)
        else:
            return Response({"message": "Concert already favorited"}, status=status.HTTP_200_OK)



class UserFavoriteConcertsView(generics.ListAPIView):
    serializer_class = ConcertSerializer

    def get_queryset(self):
        return Concert.objects.filter(users_favorited=self.request.user)
