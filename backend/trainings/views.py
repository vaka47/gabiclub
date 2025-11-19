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
    SessionTariff,
    TrainingDirection,
    TrainingPlan,
    TrainingSession,
)
from .serializers import (
    CoachSerializer,
    LevelTagSerializer,
    LocationSerializer,
    SessionTariffSerializer,
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


class SessionTariffViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SessionTariffSerializer
    queryset = SessionTariff.objects.prefetch_related("prices").order_by(
        "category", "order", "id"
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


class TrainingSessionSimpleView(APIView):
    def get(self, request, *args, **kwargs):
        qs = (
            TrainingSession.objects.select_related("direction", "coach", "location")
            .prefetch_related("levels")
            .order_by("date", "start_time")
        )

        params = request.query_params
        start_param = params.get("start")
        end_param = params.get("end")

        if start_param:
            start_date = parse_date(start_param)
            if start_date:
                qs = qs.filter(date__gte=start_date)
        if end_param:
            end_date = parse_date(end_param)
            if end_date:
                qs = qs.filter(date__lte=end_date)

        if not start_param and not end_param:
            qs = qs.filter(date__gte=date.today())

        data = []
        for s in qs:
            item = {
                "id": s.id,
                "title": s.title or "",
                "date": s.date,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "type": s.type,
                "direction": (
                    {"id": s.direction_id, "title": s.direction.title}
                    if s.direction_id and getattr(s, "direction", None)
                    else None
                ),
                "coach": (
                    {"id": s.coach_id, "full_name": s.coach.full_name, "slug": s.coach.slug}
                    if s.coach_id and getattr(s, "coach", None)
                    else None
                ),
                "location": (
                    {"id": s.location_id, "title": s.location.title}
                    if s.location_id and getattr(s, "location", None)
                    else None
                ),
                "levels": [
                    {"id": l.id, "tag": l.tag, "name": l.get_tag_display()}
                    for l in s.levels.all()
                ],
                "intensity": s.intensity,
                "spots_total": s.spots_total,
                "spots_available": s.spots_available,
                "description": s.description,
                "registration_link": s.registration_link,
                "color": s.color,
                "duration": s.duration_minutes(),
                "is_open": s.is_open,
            }
            data.append(item)

        return Response(data)
