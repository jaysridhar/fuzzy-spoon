from django.http import HttpResponse
from django.shortcuts import render

def index(request):
    return render(request, 'home.html', {'user': request.user})
    #return HttpResponse('Hello World')
