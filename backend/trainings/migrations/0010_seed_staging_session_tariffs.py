from __future__ import annotations

from decimal import Decimal

from django.conf import settings
from django.db import migrations


SESSION_TARIFFS = (
    {
        "title": "Индивидуальная тренировка",
        "category": "personal",
        "description": "Самый эффективный вид занятий для достижения ваших целей.",
        "is_featured": True,
        "order": 1,
        "prices": (
            {
                "label": "Тренировка с Габриеллой Калугер",
                "price": Decimal("3800"),
                "order": 1,
            },
            {
                "label": "Тренировка с Андреем Красновым",
                "price": Decimal("4500"),
                "order": 2,
            },
        ),
    },
    {
        "title": "Парная тренировка",
        "category": "personal",
        "description": "Тренировка для двух человек. Взаимная поддержка - залог результата.",
        "is_featured": False,
        "order": 2,
        "prices": (
            {
                "label": "Парная тренировка с Габриеллой Калугер",
                "price": Decimal("5500"),
                "order": 1,
            },
            {
                "label": "Парная тренировка с Андреем Красновым",
                "price": Decimal("6500"),
                "order": 2,
            },
        ),
    },
    {
        "title": "Групповая тренировка",
        "category": "group",
        "description": "Деление по уровню подготовки, поддержка команды.",
        "is_featured": False,
        "order": 3,
        "prices": (
            {
                "label": "Разовое участие",
                "price": Decimal("1500"),
                "order": 1,
            },
            {
                "label": "Группа PRO + анализ лактата",
                "price": Decimal("1600"),
                "order": 2,
            },
        ),
    },
    {
        "title": "Абонемент на месяц в группу начинающих",
        "category": "subscription",
        "description": "Каждый месяц вы выбираете количество групповых занятий.",
        "is_featured": False,
        "order": 4,
        "prices": (
            {
                "label": "4 занятия",
                "price": Decimal("4800"),
                "order": 1,
            },
            {
                "label": "6 занятий",
                "price": Decimal("6600"),
                "order": 2,
            },
            {
                "label": "8 занятий",
                "price": Decimal("8000"),
                "order": 3,
            },
        ),
    },
    {
        "title": "Бесплатный прокат инвентаря",
        "category": "service",
        "description": "Соберём комплект экипировки на первую тренировку.",
        "is_featured": False,
        "order": 5,
        "prices": (
            {
                "label": "Прокат на первом занятии",
                "price": Decimal("0"),
                "order": 1,
            },
        ),
    },
)


def seed_staging_session_tariffs(apps, schema_editor):
    if not getattr(settings, "GABI_NO_INDEX", False):
        return

    SessionTariff = apps.get_model("trainings", "SessionTariff")
    SessionTariffPrice = apps.get_model("trainings", "SessionTariffPrice")

    for item in SESSION_TARIFFS:
        tariff = SessionTariff.objects.filter(title=item["title"]).order_by("id").first()
        if tariff is None:
            tariff = SessionTariff(title=item["title"])

        tariff.category = item["category"]
        tariff.description = item["description"]
        tariff.is_featured = item["is_featured"]
        tariff.order = item["order"]
        tariff.save()

        synced_price_ids: list[int] = []
        for price_data in item["prices"]:
            price = (
                SessionTariffPrice.objects.filter(
                    tariff=tariff,
                    label=price_data["label"],
                )
                .order_by("id")
                .first()
            )
            if price is None:
                price = SessionTariffPrice(
                    tariff=tariff,
                    label=price_data["label"],
                )
            price.price = price_data["price"]
            price.order = price_data["order"]
            price.save()
            synced_price_ids.append(price.id)

        SessionTariffPrice.objects.filter(tariff=tariff).exclude(
            id__in=synced_price_ids
        ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("trainings", "0009_alter_trainingdirection_options_and_more"),
    ]

    operations = [
        migrations.RunPython(
            seed_staging_session_tariffs,
            migrations.RunPython.noop,
        ),
    ]
