import os
import threading
import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ClubProfile, ContactInfo, ThemeSettings
from .serializers import (
    ClubProfileSerializer,
    ContactInfoSerializer,
    LeadRequestCreateSerializer,
    ThemeSettingsSerializer,
)
from .utils import send_telegram_message, tg_escape


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
        instance = serializer.save()

        # Optional Telegram notification
        token = os.getenv("TELEGRAM_BOT_TOKEN")
        chat_ids_raw = os.getenv("TELEGRAM_CHAT_IDS") or os.getenv("TELEGRAM_CHAT_ID") or ""
        # Allow comma/space separated list of chat IDs
        recipients = [cid.strip() for cid in chat_ids_raw.replace("\n", ",").split(",") if cid.strip()]
        if token and recipients:
            logger = logging.getLogger(__name__)
            # Log which module path is used at runtime
            try:
                import core.utils as cu  # noqa: WPS433
                logger.info("Lead TG utils file: %s", getattr(cu, "__file__", None))
            except Exception:
                pass

            def _notify() -> None:
                parts = [
                    "<b>Новая заявка</b>",
                    f"Имя: {tg_escape(instance.full_name)}",
                ]
                if instance.phone:
                    parts.append(f"Телефон: {tg_escape(instance.phone)}")
                if instance.email:
                    parts.append(f"Email: {tg_escape(instance.email)}")
                if instance.preferred_direction:
                    parts.append(f"Направление: {tg_escape(instance.preferred_direction)}")
                if instance.message:
                    parts.append(f"Комментарий: {tg_escape(instance.message)}")
                if instance.source:
                    parts.append(f"Источник: {tg_escape(instance.source)}")
                parts.append(instance.created_at.strftime("Дата: %d.%m.%Y %H:%M"))
                text = "\n".join(parts)
                for chat_id in recipients:
                    try:
                        send_telegram_message(token, chat_id, text)
                    except Exception as exc:
                        logger.warning("Telegram notification failed: %s", exc)

            # Send synchronously for reliability during setup
            _notify()
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
