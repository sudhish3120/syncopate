from django.shortcuts import render
from django.http import JsonResponse
import os
from rest_framework.response import Response
from rest_framework.decorators import api_view, authentication_classes, permission_classes
import requests

from django.contrib.auth import login
from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from knox.views import LoginView as KnoxLoginView
from knox.auth import TokenAuthentication
from knox.models import AuthToken
from django.contrib.auth import authenticate
from .serializers import RegisterSerializer, UserSerializer, LoginSerializer
from models import Concert
from models import FavoriteConcert
import logging

logger = logging.getLogger(__name__)

@api_view(["GET"])
def home(request):
    return Response({"message": "Django Backend is Running!"})