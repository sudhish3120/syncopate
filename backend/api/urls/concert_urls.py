"""configures urls associated with concerts"""

from django.urls import path

from ..views.concert_views import (concerts, favorite, matches, matchings,
                                   review_matching, user_favorite_concerts_by_id, user_favorite_concerts)

urlpatterns = [
    path("favorites/", user_favorite_concerts, name="favorites"),
    path("favorites_by_id/", user_favorite_concerts_by_id, name="favorites_by_id"),
    path("favorite/", favorite, name="favorite"),
    path("", concerts, name="concerts"),
    path("matchings/", matchings, name="matchings"),
    path("review-matching/", review_matching, name="review-matching"),
    path("matches/", matches, name="matches"),
]
