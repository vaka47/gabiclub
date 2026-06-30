from __future__ import annotations

from datetime import date, time

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse

from trainings.models import (
    Coach,
    LevelTag,
    Location,
    SessionAttachment,
    TrainingDirection,
    TrainingSession,
    TrainingType,
)
from trainings.schedule_copy import copy_previous_week_schedule


class CopyPreviousWeekScheduleTests(TestCase):
    def setUp(self) -> None:
        super().setUp()
        self.location = Location.objects.create(title="Манеж", address="Москва")
        self.coach = Coach.objects.create(full_name="Илья Морозов")
        self.direction = TrainingDirection.objects.create(title="Лыжи", is_active=True)
        self.level = LevelTag.objects.create(tag="Любой уровень")

    def _create_session(
        self,
        *,
        session_date: date,
        start: time,
        end: time,
        title: str,
    ) -> TrainingSession:
        session = TrainingSession.objects.create(
            title=title,
            date=session_date,
            start_time=start,
            end_time=end,
            type=TrainingType.GROUP,
            direction=self.direction,
            coach=self.coach,
            location=self.location,
            intensity="Средняя",
            spots_total=10,
            spots_available=6,
            description=f"Описание {title}",
            registration_link="https://example.com/signup",
            color="#123456",
        )
        session.levels.add(self.level)
        return session

    def test_copy_previous_week_copies_sessions_levels_and_attachments(self):
        source_session = self._create_session(
            session_date=date(2026, 6, 15),
            start=time(9, 0),
            end=time(10, 0),
            title="Утренний блок",
        )
        SessionAttachment.objects.create(
            session=source_session,
            title="План занятия",
            file="trainings/attachments/plan.pdf",
        )

        result = copy_previous_week_schedule(date(2026, 6, 22))

        copied_sessions = TrainingSession.objects.filter(date=date(2026, 6, 22))
        self.assertEqual(result.copied_sessions_count, 1)
        self.assertEqual(result.replaced_sessions_count, 0)
        self.assertEqual(copied_sessions.count(), 1)
        copied_session = copied_sessions.get()
        self.assertEqual(copied_session.title, source_session.title)
        self.assertEqual(copied_session.start_time, source_session.start_time)
        self.assertEqual(copied_session.end_time, source_session.end_time)
        self.assertEqual(
            list(copied_session.levels.values_list("tag", flat=True)),
            ["Любой уровень"],
        )
        self.assertEqual(copied_session.attachments.count(), 1)
        self.assertEqual(copied_session.attachments.get().title, "План занятия")

    def test_copy_previous_week_replaces_only_overlapping_existing_sessions(self):
        self._create_session(
            session_date=date(2026, 6, 15),
            start=time(9, 0),
            end=time(10, 0),
            title="Копируемый слот",
        )
        overlapping_target = self._create_session(
            session_date=date(2026, 6, 22),
            start=time(9, 30),
            end=time(10, 15),
            title="Удалить при копировании",
        )
        keep_target = self._create_session(
            session_date=date(2026, 6, 22),
            start=time(10, 30),
            end=time(11, 15),
            title="Оставить",
        )

        result = copy_previous_week_schedule(date(2026, 6, 22))

        self.assertEqual(result.copied_sessions_count, 1)
        self.assertEqual(result.replaced_sessions_count, 1)
        self.assertFalse(
            TrainingSession.objects.filter(pk=overlapping_target.pk).exists()
        )
        self.assertTrue(TrainingSession.objects.filter(pk=keep_target.pk).exists())
        self.assertTrue(
            TrainingSession.objects.filter(
                date=date(2026, 6, 22),
                title="Копируемый слот",
                start_time=time(9, 0),
                end_time=time(10, 0),
            ).exists()
        )


class TrainingSessionAdminCopyWeekTests(TestCase):
    def setUp(self) -> None:
        super().setUp()
        self.user = get_user_model().objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="password",
        )
        self.client.force_login(self.user)
        self.location = Location.objects.create(title="Манеж", address="Москва")
        self.coach = Coach.objects.create(full_name="Илья Морозов")
        self.direction = TrainingDirection.objects.create(
            title="Роллеры",
            is_active=True,
        )
        TrainingSession.objects.create(
            title="Вечерняя тренировка",
            date=date(2026, 6, 15),
            start_time=time(19, 0),
            end_time=time(20, 0),
            type=TrainingType.GROUP,
            direction=self.direction,
            coach=self.coach,
            location=self.location,
            spots_total=12,
            spots_available=12,
        )

    def test_admin_copy_previous_week_view_creates_sessions(self):
        response = self.client.post(
            reverse("admin:trainings_trainingsession_copy_previous_week"),
            {
                "target_date": "2026-06-22",
                "next": reverse("admin:trainings_trainingsession_changelist"),
            },
            follow=True,
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            TrainingSession.objects.filter(
                title="Вечерняя тренировка",
                date=date(2026, 6, 22),
            ).exists()
        )
