import json, time
from django.http import HttpResponseNotAllowed, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.contrib.auth.decorators import login_required
from googlemaps import Client as GClient
from website.models import UserLocation
from website.serializers import UserLocationSerializer

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
            gmaps_loc = json.dumps(gc.reverse_geocode((latitude, longitude)))
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

@login_required
def load_user_location(request, status=None):
    if request.method == 'GET':
        start = time.perf_counter_ns()
        print(f'user_location({status}): {request.GET}')
        qs = UserLocation.objects.filter(status=status) if status else UserLocation.objects.all()
        if 'sort' in request.GET and request.GET['sort'] and request.GET['sort'] != 'undefined':
            sortBy = request.GET['sort']
            direction = request.GET['order'] if 'order' in request.GET and request.GET['order'] else 'asc'
            direction = '' if direction == 'asc' else '-'
            sortCondition = f'{direction}{sortBy}'
            print(f'Sort Condition: "{sortCondition}"')
            qs = qs.order_by(sortCondition)
        if 'offset' in request.GET and 'limit' in request.GET:
            count = qs.count()
            offset = int(request.GET['offset'])
            limit = int(request.GET['limit'])
            qs = qs[offset:offset+limit]
            print(f'{status}, {offset}, {limit}: found {qs.count()} rows')
            resp = JsonResponse({
                'rows': UserLocationSerializer(qs, many=True).data,
                'total': count
            }, safe=False)
        else:
            resp = JsonResponse(UserLocationSerializer(qs,many=True).data,safe=False)
        end = time.perf_counter_ns()
        print(f'{status}: that took {(end-start)/1000000} ms')
        return resp
    else:
        return HttpResponseNotAllowed(f'{request.method} not allowed')
