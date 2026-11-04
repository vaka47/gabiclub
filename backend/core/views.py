from django.db import transaction

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ClubProfile, ContactInfo, LeadTelegramDelivery, ThemeSettings
from .notifications import deliver_notification, queue_lead_notification
from .serializers import (
    ClubProfileSerializer,
    ContactInfoSerializer,
    LeadRequestCreateSerializer,
    ThemeSettingsSerializer,
)


class ContactInfoView(APIView):
    def get(self, request, *args, **kwargs):
        contact = ContactInfo.objects.order_by("-updated_at").first()
        if not contact:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response(ContactInfoSerializer(contact).data)


class ClubProfileView(APIView):
    def get(self, request, *args, **kwargs):
        profile = ClubProfile.objects.prefetch_related("hero_slides").first()
        if not profile:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response(ClubProfileSerializer(profile).data)


class LeadRequestView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LeadRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            instance = serializer.save()
            delivery_ids = queue_lead_notification(instance)
        # The lead and pending notifications are durable before network I/O.
        for delivery in LeadTelegramDelivery.objects.filter(pk__in=delivery_ids).select_related("lead"):
            deliver_notification(delivery)
        return Response(
            {"message": "Спасибо! Мы свяжемся с вами в ближайшее время."},
            status=status.HTTP_201_CREATED,
        )


class ThemeSettingsView(APIView):
    def get(self, request, *args, **kwargs):
        theme = ThemeSettings.objects.order_by("-updated_at", "-id").first()
        if not theme:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response(ThemeSettingsSerializer(theme).data)
