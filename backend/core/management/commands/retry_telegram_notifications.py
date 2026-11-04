from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import LeadTelegramDelivery
from core.notifications import deliver_notification


class Command(BaseCommand):
    help = "Deliver pending Telegram lead notifications without resending acknowledged messages."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=50)

    def handle(self, *args, **options):
        pending = LeadTelegramDelivery.objects.filter(
            sent_at__isnull=True, next_attempt_at__lte=timezone.now(),
        ).select_related("lead").order_by("next_attempt_at", "pk")[:options["limit"]]
        sent = sum(deliver_notification(delivery) for delivery in list(pending))
        self.stdout.write(f"Telegram delivered: {sent}; pending: {LeadTelegramDelivery.objects.filter(sent_at__isnull=True).count()}")
