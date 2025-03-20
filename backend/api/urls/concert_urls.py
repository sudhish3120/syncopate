from django.urls import path
from ..views.concert_views import concerts, get_concert_in_db, user_favourite_concerts, favorite, matchings, review_matching, matches

urlpatterns = [
    path("favorites/", user_favourite_concerts, name="favorites"),
    #db_concerts not really used anymore, gonna leave it for now. 
    path("db_concerts/", get_concert_in_db, name="db_concerts"),
    path("favorite/", favorite, name="favorite"),
    path("", concerts, name="concerts"),
    path("matchings/", matchings, name="matchings"),
    path("review-matching/", review_matching, name="review-matching"),
    path("matches/", matches, name="matches"),
]
