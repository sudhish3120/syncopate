from django.urls import path
from ..views.concert_views import concerts

urlpatterns = [
    path("", concerts, name="concerts"),
    path("<str:keyword>/", concerts, name="concerts-search"),
]
