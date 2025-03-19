from django.urls import path
from ..views.concert_views import concerts, get_concert_in_db, user_favourite_concerts
from ..views.concert_views import FavoriteConcertView

urlpatterns = [
    path("favorites/", user_favourite_concerts, name="favorites"),
    #db_concerts not really used anymore, gonna leave it for now. 
    path("db_concerts/", get_concert_in_db, name="db_concerts"),
    path("favorite/", FavoriteConcertView.as_view(), name="favorite"),
    path("", concerts, name="concerts"),
    path("<str:keyword>/", concerts, name="concerts-search"),
]
