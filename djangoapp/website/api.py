from django.http import HttpResponseNotAllowed, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from website.models import UserLocation

@csrf_exempt
def save_user_location(request):
    if request.method == 'POST':
        def getv(name):
            if name in request.POST:
                value = request.POST[name]
                if len(value) > 0: return float(value)
            return None
        UserLocation(latitude = getv('latitude'),
                     longitude = getv('longitude'),
                     accuracy = getv('accuracy'),
                     altitude = getv('altitude'),
                     altitude_accuracy = getv('altitudeAccuracy'),
                     heading = getv('heading'),
                     speed = getv('speed')).save()
        return HttpResponse('ok')
    else:
        return HttpResponseNotAllowed(f'{request.method} not allowed')

