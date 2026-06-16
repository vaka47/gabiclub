from __future__ import annotations

import importlib
from datetime import date, time

from django.apps import apps
from django.test import TestCase, override_settings

from trainings.models import (
    Coach,
    Location,
    SessionTariff,
    TrainingDirection,
    TrainingSession,
    TrainingType,
)


class TrainingDirectionModelTests(TestCase):
    def test_slug_is_generated_for_cyrillic_titles_and_stays_unique(self):
        first = TrainingDirection.objects.create(title="Беговые лыжи")
        second = TrainingDirection.objects.create(title="Беговые лыжи")

        self.assertTrue(first.slug)
        self.assertTrue(second.slug)
        self.assertNotEqual(first.slug, second.slug)

    def test_location_title_is_filled_from_address(self):
        location = Location.objects.create(address="Москва, ул. Спортивная, 12")

        self.assertEqual(location.title, "Москва, ул. Спортивная, 12")


class TrainingDirectionApiTests(TestCase):
    def setUp(self) -> None:
        super().setUp()
        self.location = Location.objects.create(title="Манеж", address="Москва")
        self.coach = Coach.objects.create(full_name="Илья Морозов")
        self.active_direction = TrainingDirection.objects.create(
            title="Функциональный тренинг",
            is_active=True,
            order=1,
        )
        self.active_direction.coaches.add(self.coach)
        self.inactive_direction = TrainingDirection.objects.create(
            title="Лыжероллеры",
            is_active=False,
            order=2,
        )

        TrainingSession.objects.create(
            title="Утренний блок",
            date=date.today(),
            start_time=time(9, 0),
            end_time=time(10, 0),
            type=TrainingType.GROUP,
            direction=self.active_direction,
            coach=self.coach,
            location=self.location,
            spots_total=12,
            spots_available=3,
        )
        TrainingSession.objects.create(
            title="Скрытый блок",
            date=date.today(),
            start_time=time(11, 0),
            end_time=time(12, 0),
            type=TrainingType.GROUP,
            direction=self.inactive_direction,
            coach=self.coach,
            location=self.location,
            spots_total=12,
            spots_available=3,
        )

    def test_public_directions_endpoint_returns_only_active_items(self):
        response = self.client.get("/api/trainings/directions/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()["results"]
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]["title"], "Функциональный тренинг")

    def test_schedule_simple_hides_sessions_for_inactive_directions(self):
        response = self.client.get("/api/trainings/schedule-simple/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]["title"], "Утренний блок")


class StagingSessionTariffSeedTests(TestCase):
    @override_settings(GABI_NO_INDEX=True)
    def test_seed_populates_mock_tariffs_only_for_staging(self):
        migration = importlib.import_module(
            "trainings.migrations.0010_seed_staging_session_tariffs"
        )

        migration.seed_staging_session_tariffs(apps, None)

        self.assertEqual(SessionTariff.objects.count(), 5)
        tariff = SessionTariff.objects.get(title="Индивидуальная тренировка")
        self.assertTrue(tariff.is_featured)
        self.assertEqual(tariff.prices.count(), 2)

    @override_settings(GABI_NO_INDEX=False)
    def test_seed_is_noop_outside_staging(self):
        migration = importlib.import_module(
            "trainings.migrations.0010_seed_staging_session_tariffs"
        )

        migration.seed_staging_session_tariffs(apps, None)

        self.assertEqual(SessionTariff.objects.count(), 0)
