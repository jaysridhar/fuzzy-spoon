from django.urls import path
from website import api

urlpatterns = [
    path('', api.load_user_location),
    path('status/<status>', api.load_user_location),
    path('approve/<locid>', api.approve_user_location),
    path('approve/', api.approve_user_location),
    path('disapprove/<locid>', api.disapprove_user_location),
    path('disapprove/', api.disapprove_user_location),
]
