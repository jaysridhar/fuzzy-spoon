from django.http import HttpResponseNotAllowed, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from website.models import UserLocation
from googlemaps import Client as GClient

@csrf_exempt
def save_user_location(request):
    if request.method == 'POST':
        def getv(name):
            if name in request.POST:
                value = request.POST[name]
                if len(value) > 0: return float(value)
            return None
        latitude = getv('latitude')
        longitude = getv('longitude')
        if latitude and longitude:
            gc = GClient(settings.GMAPSKEY)
            gmaps_loc = gc.reverse_geocode((latitude, longitude))
        else:
            gmaps_loc = None
        UserLocation(latitude = latitude,
                     longitude = longitude,
                     accuracy = getv('accuracy'),
                     altitude = getv('altitude'),
                     altitude_accuracy = getv('altitudeAccuracy'),
                     heading = getv('heading'),
                     speed = getv('speed'),
                     google_maps_location = gmaps_loc).save()
        return HttpResponse('ok')
    else:
        return HttpResponseNotAllowed(f'{request.method} not allowed')
