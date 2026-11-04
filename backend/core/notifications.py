"""Persistent Telegram delivery, shared by the lead endpoint and retry worker."""
import logging
import os
import re
from datetime import timedelta

from django.db.models import F
from django.utils import timezone

from .models import LeadTelegramDelivery
from .utils import send_telegram_message, tg_escape

logger = logging.getLogger(__name__)


def queue_lead_notification(lead):
    raw = os.getenv("TELEGRAM_CHAT_IDS") or os.getenv("TELEGRAM_CHAT_ID") or ""
    recipients = list(dict.fromkeys(filter(None, re.split(r"[\s,;]+", raw.strip()))))
    if not recipients:
        logger.error("Telegram recipients missing for lead %s", lead.pk)
    return [LeadTelegramDelivery.objects.get_or_create(lead=lead, chat_id=chat_id)[0].pk for chat_id in recipients]


def lead_message(lead):
    parts = ["<b>Новая заявка</b>", f"Заявка №{lead.pk}"]
    for label, field, limit in [
        ("Имя", "full_name", 120), ("Телефон", "phone", 30),
        ("Email", "email", 200), ("Направление", "preferred_direction", 120),
        ("Комментарий", "message", 200), ("Источник", "source", 60),
    ]:
        value = getattr(lead, field)
        if value:
            # Bound before HTML escaping, including worst-case entity expansion.
            value = value[:limit] + ("… (полный текст в админке)" if len(value) > limit else "")
            parts.append(f"{label}: {tg_escape(value)}")
    parts.append(timezone.localtime(lead.created_at).strftime("Дата: %d.%m.%Y %H:%M"))
    return "\n".join(parts)


def deliver_notification(delivery):
    now = timezone.now()
    # One atomic claim prevents concurrent requests/workers from sending twice.
    claimed = LeadTelegramDelivery.objects.filter(
        pk=delivery.pk, sent_at__isnull=True, next_attempt_at__lte=now,
    ).update(next_attempt_at=now + timedelta(minutes=5), attempts=F("attempts") + 1)
    if not claimed:
        return False
    delivery.refresh_from_db()
    try:
        token = os.getenv("TELEGRAM_BOT_TOKEN", "").strip()
        if not token:
            raise RuntimeError("Telegram bot token missing")
        send_telegram_message(token, delivery.chat_id, lead_message(delivery.lead))
    except Exception as exc:
        # Sender errors contain no credentials or applicant details.
        error = str(exc)[:255] if isinstance(exc, RuntimeError) else type(exc).__name__
        delay = min(2 ** min(delivery.attempts - 1, 6), 60)
        LeadTelegramDelivery.objects.filter(pk=delivery.pk).update(
            last_error=error, next_attempt_at=timezone.now() + timedelta(minutes=delay),
        )
        logger.warning("Telegram pending for lead %s, attempt %s: %s", delivery.lead_id, delivery.attempts, error)
        return False
    LeadTelegramDelivery.objects.filter(pk=delivery.pk).update(sent_at=timezone.now(), last_error="")
    logger.info("Telegram delivered for lead %s", delivery.lead_id)
    return True
