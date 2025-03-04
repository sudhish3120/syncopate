from django.urls import path
from ..views.auth_views import (
    LoginView, 
    LogoutView, 
    RegisterView, 
    send_verification_code,
    verify_code
)
from ..views.user_views import get_user
from knox import views as knox_views

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("register/send_verification_code/", send_verification_code, name="send_verification_code"),
    path("register/verify_code/", verify_code, name="verify_code"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("logoutall/", knox_views.LogoutAllView.as_view(), name="logoutall"),
    path("user/", get_user, name="user-details"),
]
