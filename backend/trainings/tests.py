from __future__ import annotations

from datetime import date, time

from django.test import TestCase

from trainings.models import (
    Coach,
    LevelTag,
    Location,
    TrainingDirection,
    TrainingSession,
    TrainingType,
)


class LevelTagApiTests(TestCase):
    def setUp(self) -> None:
        super().setUp()
        self.location = Location.objects.create(title="Манеж", address="Москва")
        self.coach = Coach.objects.create(full_name="Илья Морозов")
        self.active_direction = TrainingDirection.objects.create(
            title="Функциональный тренинг",
        )
        self.active_direction.coaches.add(self.coach)
        self.session = TrainingSession.objects.create(
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

    def test_training_meta_and_schedule_simple_return_custom_level_names(self):
        level = LevelTag.objects.create(tag="PRO")
        self.session.levels.add(level)

        meta_response = self.client.get("/api/trainings/meta/")
        self.assertEqual(meta_response.status_code, 200)
        self.assertEqual(
            meta_response.json()["levels"],
            [{"id": level.id, "tag": "PRO", "name": "PRO"}],
        )

        schedule_response = self.client.get("/api/trainings/schedule-simple/")
        self.assertEqual(schedule_response.status_code, 200)
        self.assertEqual(
            schedule_response.json()[0]["levels"],
            [{"id": level.id, "tag": "PRO", "name": "PRO"}],
        )

class LevelTagModelTests(TestCase):
    def test_level_tag_str_returns_custom_name(self):
        level = LevelTag.objects.create(tag="Дети PRO")

        self.assertEqual(str(level), "Дети PRO")
