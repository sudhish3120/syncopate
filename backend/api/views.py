"""
Simple Django REST framework view to check if the backend is running.
"""

import logging

from rest_framework.decorators import api_view
from rest_framework.response import Response

logger = logging.getLogger(__name__)


@api_view(["GET"])
def home(_request):
    """Check that backend is running."""
    return Response({"message": "Django Backend is Running!"})
