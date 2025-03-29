"""configures urls associated with concerts"""

from django.urls import path

from ..views.concert_views import (
    concerts,
    favorite, unfavorite,
    matches,
    matchings,
    review_matching,
    user_favorite_concerts_by_id, user_favorite_concerts, get_concert,
)

urlpatterns = [
    path("favorites/", user_favorite_concerts, name="favorites"),
    path("favorites_by_id/", user_favorite_concerts_by_id, name="favorites_by_id"),
    path("favorite/", favorite, name="favorite"),
    path("unfavorite/", unfavorite, name="unfavorite"),
    path("", concerts, name="concerts"),
    path("concert_by_id", get_concert, name="get_concert"),
    path("matchings/", matchings, name="matchings"),
    path("review-matching/", review_matching, name="review-matching"),
    path("matches/", matches, name="matches"),
]
