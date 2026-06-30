from __future__ import annotations

import importlib
from datetime import date, time

from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase, override_settings
from django.urls import reverse

from trainings.models import (
    Coach,
    LevelTag,
    Location,
    SessionAttachment,
    SessionTariffBenefit,
    SessionTariffPhoto,
    SessionTariff,
    TrainingDirection,
    TrainingPlan,
    TrainingPlanBenefit,
    TrainingPlanPhoto,
    TrainingSession,
    TrainingType,
)
from trainings.schedule_copy import copy_previous_week_schedule


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

    def test_training_meta_and_schedule_simple_return_custom_level_names(self):
        level = LevelTag.objects.create(tag="PRO")
        session = TrainingSession.objects.get(title="Утренний блок")
        session.levels.add(level)

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


class TariffDetailApiTests(TestCase):
    def test_training_plan_detail_endpoint_uses_slug_and_returns_mixed_gallery(self):
        plan = TrainingPlan.objects.create(
            title="План на выносливость",
            category="athlete",
            description="Подготовка к длинным стартам.",
            price="12900.00",
            period="в месяц",
            video_vk_embed_url="https://vkvideo.ru/video_ext.php?oid=-1&id=2&hd=2",
        )
        TrainingPlanBenefit.objects.create(plan=plan, text="Разбор техники", order=1)
        TrainingPlanPhoto.objects.create(
            plan=plan,
            video_file="trainings/plans/gallery/videos/endurance.mp4",
            caption="Видео с интервальной работой",
            order=1,
        )
        TrainingPlanPhoto.objects.create(
            plan=plan,
            image="trainings/plans/gallery/endurance.jpg",
            caption="Интервальная работа",
            order=2,
        )

        response = self.client.get(f"/api/trainings/plans/{plan.slug}/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["slug"], plan.slug)
        self.assertEqual(payload["video_vk_embed_url"], plan.video_vk_embed_url)
        self.assertEqual(len(payload["benefits"]), 1)
        self.assertEqual(len(payload["photos"]), 2)
        self.assertEqual(payload["photos"][0]["type"], "video")
        self.assertTrue(payload["photos"][0]["video_file"].endswith("endurance.mp4"))
        self.assertIsNone(payload["photos"][0]["image"])
        self.assertEqual(payload["photos"][1]["type"], "image")
        self.assertTrue(payload["photos"][1]["image"].endswith("endurance.jpg"))

    def test_session_tariff_detail_endpoint_uses_slug_and_returns_mixed_gallery(self):
        tariff = SessionTariff.objects.create(
            title="Парная тренировка",
            category="personal",
            description="Формат для двоих.",
        )
        SessionTariffBenefit.objects.create(
            tariff=tariff,
            text="Общий разбор техники",
            order=1,
        )
        SessionTariffPhoto.objects.create(
            tariff=tariff,
            video_file="trainings/session-tariffs/gallery/videos/pair.mp4",
            caption="Видео с тренировкой",
            order=1,
        )
        SessionTariffPhoto.objects.create(
            tariff=tariff,
            image="trainings/session-tariffs/gallery/pair.jpg",
            caption="Тренировка на трассе",
            order=2,
        )

        response = self.client.get(f"/api/trainings/session-tariffs/{tariff.slug}/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["slug"], tariff.slug)
        self.assertEqual(len(payload["benefits"]), 1)
        self.assertEqual(len(payload["photos"]), 2)
        self.assertEqual(payload["photos"][0]["type"], "video")
        self.assertTrue(payload["photos"][0]["video_file"].endswith("pair.mp4"))
        self.assertIsNone(payload["photos"][0]["image"])
        self.assertEqual(payload["photos"][1]["type"], "image")
        self.assertTrue(payload["photos"][1]["image"].endswith("pair.jpg"))


class TariffGalleryModelTests(TestCase):
    def test_training_plan_gallery_item_requires_exactly_one_media(self):
        plan = TrainingPlan.objects.create(
            title="План на технику",
            category="athlete",
            price="8900.00",
            period="в месяц",
        )

        empty_item = TrainingPlanPhoto(plan=plan)
        both_media_item = TrainingPlanPhoto(
            plan=plan,
            image="trainings/plans/gallery/technique.jpg",
            video_file="trainings/plans/gallery/videos/technique.mp4",
        )
        image_only_item = TrainingPlanPhoto(
            plan=plan,
            image="trainings/plans/gallery/technique.jpg",
        )

        with self.assertRaises(ValidationError):
            empty_item.full_clean()
        with self.assertRaises(ValidationError):
            both_media_item.full_clean()
        image_only_item.full_clean()

    def test_session_tariff_gallery_item_requires_exactly_one_media(self):
        tariff = SessionTariff.objects.create(
            title="Тариф для двоих",
            category="personal",
        )

        empty_item = SessionTariffPhoto(tariff=tariff)
        both_media_item = SessionTariffPhoto(
            tariff=tariff,
            image="trainings/session-tariffs/gallery/pair.jpg",
            video_file="trainings/session-tariffs/gallery/videos/pair.mp4",
        )
        video_only_item = SessionTariffPhoto(
            tariff=tariff,
            video_file="trainings/session-tariffs/gallery/videos/pair.mp4",
        )

        with self.assertRaises(ValidationError):
            empty_item.full_clean()
        with self.assertRaises(ValidationError):
            both_media_item.full_clean()
        video_only_item.full_clean()


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
