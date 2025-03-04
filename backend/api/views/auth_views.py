import logging
logger = logging.getLogger(__name__)

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from knox.views import LoginView as KnoxLoginView
from knox.auth import TokenAuthentication
from knox.models import AuthToken
from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view
from django.conf import settings

from ..models import EmailVerificationCode
from ..serializers import RegisterSerializer, UserSerializer, LoginSerializer
from django.db import IntegrityError
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import random

class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            # Check if email was verified
            verified = EmailVerificationCode.objects.filter(
                email=request.data.get('email'),
                is_used=True
            ).exists()
            
            if not verified:
                return Response({
                    "error": "Email not verified"
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = RegisterSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            
            return Response({
                "user": UserSerializer(user).data,
                "token": AuthToken.objects.create(user)[1]
            })
        except Exception as e:
            return Response({
                "error": str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(KnoxLoginView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, format=None):
        try:
            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            
            if user:
                login(request, user)
                return Response({
                    "token": AuthToken.objects.create(user)[1],
                    "user": UserSerializer(user).data
                }, status=status.HTTP_200_OK)
                
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class LogoutView(generics.GenericAPIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

@api_view(['POST'])
def send_verification_code(request):
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=400)

    code = ''.join(random.choices('0123456789', k=6))
    
    # Store the code in database
    EmailVerificationCode.objects.create(
        email=email,
        code=code
    )
    
    # Send email
    try:
        send_mail(
            'Verify your Syncopate account',
            f'Your verification code is: {code}',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return Response({'message': 'Verification code sent'})
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def verify_code(request):
    email = request.data.get('email')
    code = request.data.get('code')
    
    logger.info(f"Verifying code for email: {email}, code: {code}")
    
    if not email or not code:
        return Response({'error': 'Email and code are required'}, status=400)
    
    try:
        verification = EmailVerificationCode.objects.filter(
            email=email,
            code=code,
            is_used=False
        ).order_by('-created_at').first()
        
        if not verification:
            logger.error(f"No verification found for email: {email}, code: {code}")
            return Response({'error': 'Invalid code'}, status=400)
        
        if verification.is_expired:
            logger.error(f"Expired code for email: {email}")
            return Response({'error': 'Code has expired'}, status=400)
        
        verification.is_used = True
        verification.save()
        
        return Response({'message': 'Code verified successfully'})
    
    except Exception as e:
        logger.error(f"Error verifying code: {str(e)}")
        return Response({'error': str(e)}, status=500)


