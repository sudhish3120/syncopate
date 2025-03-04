from django.urls import path
from ..views.concert_views import concerts, get_concert_in_db
from ..views.concert_views import FavoriteConcertView
from ..views.concert_views import UserFavoriteConcertsView

urlpatterns = [
    path("db_favorites/", UserFavoriteConcertsView.as_view(), name="db_favorites"),
    path("db_concerts/", get_concert_in_db, name="db_concerts"),
    path("favorite/", FavoriteConcertView.as_view(), name="favorite"),
    path("", concerts, name="concerts"),
    path("<str:keyword>/", concerts, name="concerts-search"),
]
