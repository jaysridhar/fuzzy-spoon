from django.urls import path
from website import api

urlpatterns = [
    path('location', api.save_user_location),
]
