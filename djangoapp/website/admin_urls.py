from django.urls import path
from website import api

urlpatterns = [
    path('', api.load_user_location),
    path('status/<status>', api.load_user_location),
]
