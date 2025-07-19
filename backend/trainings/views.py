from django.shortcuts import render

# Create your views here.

from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import TrainingSession
from .serializers import TrainingSessionSerializer

@api_view(['GET'])
def schedule_view(request):
    start = request.GET.get('start')
    end = request.GET.get('end')
    sessions = TrainingSession.objects.filter(date__range=[start, end])

    if t := request.GET.get('type'):
        sessions = sessions.filter(type=t)

    if d := request.GET.get('direction_id'):
        sessions = sessions.filter(direction_id=d)

    if c := request.GET.get('coach_id'):
        sessions = sessions.filter(coach_id=c)

    if l := request.GET.get('location_id'):
        sessions = sessions.filter(location_id=l)

    if level := request.GET.get('level'):
        sessions = sessions.filter(levels__tag=level)

    data = TrainingSessionSerializer(sessions, many=True).data
    return Response(data)

