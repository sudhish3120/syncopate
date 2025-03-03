from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
import requests
import os
import logging

logger = logging.getLogger(__name__)

@api_view(["GET"])
def concerts(request, keyword=""):
    try:
        request_params = {
            'apikey': os.environ["TICKETMASTER_KEY"],
            'latlong': "43.653225,-79.383186",
            'radius': '20',
            'unit': 'km',
            'classificationName': 'Music',
            'includeTest': 'no',
            'keyword': keyword
        }

        response = requests.get(
            f'{os.environ["TICKETMASTER_URL_BASE"]}/events',
            params=request_params
        )

        events = response.json()["_embedded"]
        return JsonResponse(events)
    except Exception as e:
        logger.error(f"Concert fetch error: {str(e)}")
        return JsonResponse({"error": "Failed to fetch concerts"}, status=500)
