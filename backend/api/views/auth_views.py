import base64
import logging
import secrets
from io import BytesIO

import pyotp
import qrcode
import qrcode.image.svg
from django.conf import settings
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django_otp.plugins.otp_totp.models import TOTPDevice
from knox.models import AuthToken
from knox.views import LoginView as KnoxLoginView
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..authentication import CookieTokenAuthentication
from ..models import EmailVerificationToken, TemporaryRegistration
from ..serializers import LoginSerializer, UserSerializer

logger = logging.getLogger(__name__)


class LoginView(KnoxLoginView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    # pylint: disable=W0622
    def post(self, request, format=None):
        try:
            serializer = LoginSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = authenticate(
                username=serializer.validated_data["username"],
                password=serializer.validated_data["password"],
            )

            if user:
                # Check if user has TOTP device
                totp_device = TOTPDevice.objects.filter(
                    user=user, confirmed=True
                ).first()
                if totp_device:
                    # If TOTP code not provided in request
                    if not request.data.get("totp_code"):
                        return Response(
                            {
                                "requires_totp": True,
                                "message": "Please provide TOTP code",
                            },
                            status=status.HTTP_401_UNAUTHORIZED,
                        )

                    # Use pyotp for verification
                    totp = pyotp.TOTP(totp_device.key)
                    if not totp.verify(request.data.get("totp_code")):
                        return Response(
                            {"error": "Invalid TOTP code"},
                            status=status.HTTP_401_UNAUTHORIZED,
                        )

                # If TOTP verified or not required, proceed with login
                login(request, user)
                instance, token = AuthToken.objects.create(user)
                logger.info("Login successful for user: %s", user.username)

                response = Response(
                    {"user": UserSerializer(user).data}, status=status.HTTP_200_OK
                )

                response.set_cookie(
                    "knox_token",
                    token,
                    httponly=True,
                    secure=True,
                    samesite="Lax",
                )
                return response

            logger.warning(
                "Failed login attempt for username: %s",
                serializer.validated_data['username']
            )
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            logger.error("Login error: %s", str(e))
            return Response(
                {"error": "Login failed. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class LogoutView(generics.GenericAPIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            knox_token = request.COOKIES.get("knox_token")
            if knox_token:
                AuthToken.objects.filter(user=request.user).delete()

            response = Response({"detail": "Successfully logged out"})
            response.delete_cookie("knox_token")
            return response

        except Exception as e:
            logger.error("Logout error: %s", str(e))
            return Response(
                {"error": "Failed to logout. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


@api_view(["POST"])
def send_magic_link(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)

    # Add email domain validation
    if not email.endswith("@uwaterloo.ca"):
        return Response({"error": "Must be a UWaterloo email address"}, status=400)

    try:
        # Generate verification token
        verification = EmailVerificationToken.generate_token(email)
        verification_url = f"{settings.FRONTEND_URL}/verify/{verification.token}"

        # Send email with magic link
        send_mail(
            "Verify your Syncopate account",
            f"Click this link to verify your email: {verification_url}\n\nThis link expires in 24 hours.",
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        return Response({"message": "Verification email sent"})
    except Exception as e:
        logger.error("Error sending verification email: %s", str(e))
        return Response(
            {"error": "Failed to send verification email. Please try again."},
            status=500,
        )


@api_view(["GET"])
def verify_token(request, token):
    try:
        verification = EmailVerificationToken.objects.get(token=token, is_used=False)

        if verification.is_expired:
            return Response({"error": "Verification link has expired"}, status=400)

        verification.is_used = True
        verification.save()

        # Return JSON instead of redirect
        return Response({"success": True, "email": verification.email})

    except EmailVerificationToken.DoesNotExist:
        return Response({"error": "Invalid or expired verification link"}, status=400)


class RegisterInitView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            # Validate email verification
            verified = EmailVerificationToken.objects.filter(
                email=request.data.get("email"), is_used=True
            ).exists()

            if not verified:
                return Response(
                    {"error": "Email not verified"}, status=status.HTTP_400_BAD_REQUEST
                )

            # Create temporary registration with raw password
            setup_token = secrets.token_urlsafe(32)
            TemporaryRegistration.objects.create(
                setup_token=setup_token,
                username=request.data["username"],
                email=request.data["email"],
                password=request.data["password"],
            )

            return Response({"setup_token": setup_token})
        except Exception as e:
            logger.error("Registration error: %s", str(e))
            return Response(
                {"error": "Registration failed. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )


@api_view(["GET"])
def totp_setup(request):
    setup_token = request.headers.get("Authorization", "").split(" ")[1]
    try:
        temp_reg = TemporaryRegistration.objects.get(setup_token=setup_token)
        if temp_reg.is_expired:
            return Response({"error": "Setup token expired"}, status=400)

        # Generate proper TOTP secret using pyotp
        secret = pyotp.random_base32()
        temp_reg.totp_secret = secret
        temp_reg.save()

        # Generate QR code with proper URI format
        totp = pyotp.TOTP(secret)
        issuer_name = getattr(
            settings, "OTP_TOTP_ISSUER", "Syncopate"
        )  # Use fallback if setting not found
        provisioning_uri = totp.provisioning_uri(
            name=temp_reg.username, issuer_name=issuer_name
        )

        img = qrcode.make(provisioning_uri, image_factory=qrcode.image.svg.SvgImage)
        buffer = BytesIO()
        img.save(buffer)
        qr_svg = buffer.getvalue().decode()

        return Response(
            {
                "qr_url": f"data:image/svg+xml;base64,{base64.b64encode(qr_svg.encode()).decode()}"
            }
        )
    except TemporaryRegistration.DoesNotExist:
        return Response({"error": "Invalid setup token"}, status=400)


@api_view(["POST"])
def totp_verify(request):
    setup_token = request.headers.get("Authorization", "").split(" ")[1]
    try:
        temp_reg = TemporaryRegistration.objects.filter(setup_token=setup_token).first()
        if not temp_reg:
            return Response({"error": "Invalid setup token"}, status=400)

        if temp_reg.is_expired:
            return Response({"error": "Setup token expired"}, status=400)

        code = request.data.get("code")
        if not code:
            return Response({"error": "No code provided"}, status=400)

        # Create a TOTP object with the secret
        totp = pyotp.TOTP(temp_reg.totp_secret)

        # Verify with ±1 time step windows
        if not totp.verify(code, valid_window=1):
            return Response(
                {
                    "error": "Invalid code. Please try again.",
                    "remaining_attempts": "unlimited",
                },
                status=400,
            )

        try:
            # Create user with raw password - create_user will hash it
            user = User.objects.create_user(
                username=temp_reg.username,
                email=temp_reg.email,
                password=temp_reg.password,
            )

            # Cleanup
            temp_reg.delete()

            # Return user data
            return Response(
                {"user": UserSerializer(user).data, "message": "TOTP setup successful"}
            )

        except Exception as e:
            logger.error("Error creating user during TOTP verification: %s", str(e))
            return Response(
                {"error": "Failed to complete registration. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    except Exception as e:
        logger.error("TOTP verification error: %s", str(e))
        return Response(
            {"error": "Verification failed. Please try again."},
            status=status.HTTP_400_BAD_REQUEST,
        )
