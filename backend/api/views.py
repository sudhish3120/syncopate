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
import logging

logger = logging.getLogger(__name__)

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            return Response({
                "user": UserSerializer(user).data,
                "token": AuthToken.objects.create(user)[1]
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({
                "error": "Could not complete registration",
                "details": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(KnoxLoginView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return Response({
                "token": AuthToken.objects.create(user)[1],
                "user": {
                    "username": user.username
                }
            })
        else:
            return Response({
                "error": "Invalid credentials"
            }, status=400)


class LogoutView(generics.GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        request.auth.delete()
        return Response({"message": "Logged out successfully"})
    
@api_view(["GET"])
def home(request):
    return Response({"message": "Django Backend is Running!"})

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def get_user(request):
    try:
        serializer = UserSerializer(request.user)
        return Response({
            "user": serializer.data,
            "status": "success"
        })
    except Exception as e:
        logger.error(f"Error fetching user details: {str(e)}")
        return Response({
            "error": "Could not fetch user details"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)