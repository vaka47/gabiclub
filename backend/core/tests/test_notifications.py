import os
from datetime import timedelta
from unittest import mock

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from core.models import LeadRequest, LeadTelegramDelivery
from core.notifications import deliver_notification, lead_message, queue_lead_notification


@mock.patch.dict(os.environ, {"TELEGRAM_BOT_TOKEN": "123:secret", "TELEGRAM_CHAT_IDS": "-100, -100\n-200"})
class TelegramDeliveryTests(TestCase):
    def setUp(self):
        self.lead = LeadRequest.objects.create(full_name="Имя & <тест>", phone="+70000000000")

    def test_recipient_separators_and_deduplication(self):
        queue_lead_notification(self.lead)
        queue_lead_notification(self.lead)
        self.assertEqual(LeadTelegramDelivery.objects.count(), 2)

    @mock.patch("core.notifications.send_telegram_message", side_effect=RuntimeError("Network unavailable"))
    def test_failure_is_persisted_and_retried_without_losing_lead(self, sender):
        queue_lead_notification(self.lead)
        delivery = LeadTelegramDelivery.objects.first()
        self.assertFalse(deliver_notification(delivery))
        delivery.refresh_from_db()
        self.assertIsNone(delivery.sent_at)
        self.assertEqual(delivery.attempts, 1)
        self.assertGreater(delivery.next_attempt_at, timezone.now())
        self.assertFalse(deliver_notification(delivery))
        self.assertEqual(sender.call_count, 1)
        LeadTelegramDelivery.objects.filter(pk=delivery.pk).update(next_attempt_at=timezone.now() - timedelta(seconds=1))
        sender.side_effect = None
        sender.return_value = 42
        self.assertTrue(deliver_notification(delivery))
        self.assertFalse(deliver_notification(delivery))
        delivery.refresh_from_db()
        self.assertIsNotNone(delivery.sent_at)
        self.assertEqual(delivery.attempts, 2)
        self.assertEqual(delivery.last_error, "")

    @mock.patch.dict(os.environ, {"TELEGRAM_CHAT_IDS": "-100"})
    @mock.patch("core.notifications.send_telegram_message", side_effect=RuntimeError("Network unavailable"))
    def test_api_saves_lead_and_pending_delivery_on_network_failure(self, sender):
        response = APIClient().post("/api/core/lead/", {"full_name": "Тест", "phone": "+70000000000"}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(LeadRequest.objects.count(), 2)
        self.assertEqual(LeadTelegramDelivery.objects.filter(sent_at__isnull=True).count(), 1)

    def test_message_escapes_html_and_stays_within_limit(self):
        self.lead.message = "&" * 10000
        text = lead_message(self.lead)
        self.assertIn("Имя &amp; &lt;тест&gt;", text)
        self.assertLess(len(text), 4096)
