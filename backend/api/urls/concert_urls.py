from django.urls import path

from ..views.concert_views import (concerts, favorite, matches, matchings,
                                   review_matching, user_favourite_concerts)

urlpatterns = [
    path("favorites/", user_favourite_concerts, name="favorites"),
    path("favorite/", favorite, name="favorite"),
    path("", concerts, name="concerts"),
    path("matchings/", matchings, name="matchings"),
    path("review-matching/", review_matching, name="review-matching"),
    path("matches/", matches, name="matches"),
]
