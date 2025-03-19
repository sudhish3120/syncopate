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

from ..authentication import CookieTokenAuthentication
from ..models import Concert, FavoriteConcert
from ..serializers import ConcertSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination

logger = logging.getLogger(__name__)

LOCATIONS = {
    "KW": "43.449791,-80.489090",
    "TO": "43.653225,-79.383186"
}

class ConcertPagination(PageNumberPagination):
    page_size = 10  # Number of concerts per page
    page_size_query_param = 'page_size'
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
        return Response({
            "error": "Unable to fetch concerts. Please try again later."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
def concerts(request):
    try:
        request_params = {
            'apikey': os.environ["TICKETMASTER_KEY"],
            'radius': '20',
            'unit': 'km',
            'classificationName': 'Music',
            'includeTest': 'no'
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
            timeout=10
        ).json()

        events = []
        if response["page"]["totalElements"] > 0:
            events = response["_embedded"]["events"]

        return JsonResponse(events, safe=False)
    except Exception as e:
        logger.error(f"Concert fetch error: {str(e)}")
        return JsonResponse({
            "error": "Unable to fetch concerts. Please try again later."
        }, status=500)


class FavoriteConcertView(generics.CreateAPIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        user = request.user
        concert_id = request.data.get('concert')
        
        try:
            concert, created = Concert.objects.get_or_create(concert_id=concert_id)
        except Exception as e:
            logger.error(f"Concert creation error: {str(e)}")
            return Response({
                "error": "Unable to process request. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        try:
            favorite, created = FavoriteConcert.objects.get_or_create(user=user, concert=concert)
            if created:
                return Response({
                    "message": "Concert favorited successfully"
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "message": "Concert already favorited"
                }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Favorite creation error: {str(e)}")
            return Response({
                "error": "Unable to favorite concert. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserFavoriteConcertsView(generics.ListAPIView):
    serializer_class = ConcertSerializer
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Concert.objects.filter(users_favorited=self.request.user)
