from django.shortcuts import render
from django.http import JsonResponse
import os
from rest_framework.response import Response
from rest_framework.decorators import api_view
import requests

@api_view(["GET"])
def home(request):
    return Response({"message": "Django Backend is Running!"})

@api_view(["GET"])
def concerts(request, keyword=""):
    # getting suggested concerts
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