from __future__ import annotations

from datetime import date

from django.utils.dateparse import parse_date
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Coach,
    LevelTag,
    Location,
    TrainingDirection,
    TrainingPlan,
    TrainingSession,
)
from .serializers import (
    CoachSerializer,
    LevelTagSerializer,
    LocationSerializer,
    TrainingDirectionSerializer,
    TrainingPlanSerializer,
    TrainingSessionSerializer,
)


class TrainingSessionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TrainingSessionSerializer
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = {
        "type": ["exact"],
        "direction__id": ["exact"],
        "coach__id": ["exact"],
        "location__id": ["exact"],
        "levels__tag": ["exact"],
    }
    ordering = ("date", "start_time")

    def get_queryset(self):
        queryset = (
            TrainingSession.objects.select_related("direction", "coach", "location")
            .prefetch_related("levels", "attachments")
            .order_by("date", "start_time")
        )

        params = self.request.query_params
        start_param = params.get("start")
        end_param = params.get("end")

        if start_param:
            start_date = parse_date(start_param)
            if start_date:
                queryset = queryset.filter(date__gte=start_date)
        if end_param:
            end_date = parse_date(end_param)
            if end_date:
                queryset = queryset.filter(date__lte=end_date)

        if not start_param and not end_param:
            queryset = queryset.filter(date__gte=date.today())

        return queryset.distinct()

    @action(detail=False, methods=["get"], url_path="filters")
    def filters(self, request, *args, **kwargs):
        directions = TrainingDirection.objects.all()
        coaches = Coach.objects.all()
        locations = Location.objects.all()
        levels = LevelTag.objects.all()

        return Response(
            {
                "directions": TrainingDirectionSerializer(directions, many=True).data,
                "coaches": CoachSerializer(coaches, many=True).data,
                "locations": LocationSerializer(locations, many=True).data,
                "levels": LevelTagSerializer(levels, many=True).data,
            }
        )


class TrainingPlanViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TrainingPlanSerializer
    queryset = TrainingPlan.objects.prefetch_related("benefits").order_by(
        "category", "order", "price"
    )
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = {"category": ["exact"], "is_featured": ["exact"]}


class CoachViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CoachSerializer
    queryset = Coach.objects.prefetch_related("directions").order_by("full_name")
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = {"is_featured": ["exact"], "directions__id": ["exact"]}


class TrainingMetaView(APIView):
    def get(self, request, *args, **kwargs):
        directions = TrainingDirectionSerializer(
            TrainingDirection.objects.all(), many=True
        ).data
        locations = LocationSerializer(Location.objects.all(), many=True).data
        levels = LevelTagSerializer(LevelTag.objects.all(), many=True).data
        coaches = CoachSerializer(Coach.objects.all(), many=True).data

        return Response(
            {
                "directions": directions,
                "locations": locations,
                "levels": levels,
                "coaches": coaches,
            }
        )
