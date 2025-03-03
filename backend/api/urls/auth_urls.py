from django.urls import path
from ..views.auth_views import LoginView, LogoutView, RegisterView
from ..views.user_views import get_user
from knox import views as knox_views

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("logoutall/", knox_views.LogoutAllView.as_view(), name="logoutall"),
    path("user/", get_user, name="user-details"),
]
