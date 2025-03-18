from django.urls import path
from ..views.auth_views import (
    LoginView, 
    LogoutView, 
    RegisterView, 
    RegisterInitView,
    send_magic_link,
    verify_token,
    totp_setup,
    totp_verify
)
from ..views.user_views import get_user
from knox import views as knox_views

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("register/init/", RegisterInitView.as_view(), name="register-init"),
    path("register/send_magic_link/", send_magic_link, name="send_magic_link"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("logoutall/", knox_views.LogoutAllView.as_view(), name="logoutall"),
    path("user/", get_user, name="user-details"),
    path("verify-token/<str:token>/", verify_token, name="verify-token"),
    path("totp/setup/", totp_setup, name="totp-setup"),
    path("totp/verify/", totp_verify, name="totp-verify"),
]
