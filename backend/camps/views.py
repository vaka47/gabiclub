from datetime import date

from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Camp, CampStatus
from .serializers import CampListSerializer, CampSerializer


class CampViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Camp.objects.prefetch_related("highlights", "program", "gallery")
    serializer_class = CampSerializer
    lookup_field = "slug"
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = {"status": ["exact"], "is_featured": ["exact"]}
    ordering = ("-start_date",)

    def get_serializer_class(self):
        if self.action == "list":
            return CampListSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        queryset = super().get_queryset()
        upcoming = self.request.query_params.get("upcoming")
        past = self.request.query_params.get("past")

        if upcoming and upcoming.lower() == "true":
            queryset = queryset.filter(
                Q(status=CampStatus.UPCOMING)
                | Q(start_date__gte=date.today())
            )
        if past and past.lower() == "true":
            queryset = queryset.filter(
                Q(status=CampStatus.COMPLETED) | Q(end_date__lt=date.today())
            )
        return queryset

    @action(detail=False, methods=["get"], url_path="featured")
    def featured(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset().filter(is_featured=True))[:3]
        serializer = CampListSerializer(queryset, many=True)
        return Response(serializer.data)
