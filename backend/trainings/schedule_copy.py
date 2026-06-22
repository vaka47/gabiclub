from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta

from django.db import transaction

from .models import SessionAttachment, TrainingSession


@dataclass(frozen=True)
class CopyPreviousWeekResult:
    source_week_start: date
    source_week_end: date
    target_week_start: date
    target_week_end: date
    copied_sessions_count: int
    replaced_sessions_count: int


def week_bounds(anchor_date: date) -> tuple[date, date]:
    week_start = anchor_date - timedelta(days=anchor_date.weekday())
    return week_start, week_start + timedelta(days=6)


def copy_previous_week_schedule(target_date: date) -> CopyPreviousWeekResult:
    target_week_start, target_week_end = week_bounds(target_date)
    source_week_start = target_week_start - timedelta(days=7)
    source_week_end = target_week_end - timedelta(days=7)

    source_sessions = list(
        TrainingSession.objects.filter(date__range=(source_week_start, source_week_end))
        .select_related("direction", "coach", "location")
        .prefetch_related("levels", "attachments")
        .order_by("date", "start_time", "id")
    )
    if not source_sessions:
        return CopyPreviousWeekResult(
            source_week_start=source_week_start,
            source_week_end=source_week_end,
            target_week_start=target_week_start,
            target_week_end=target_week_end,
            copied_sessions_count=0,
            replaced_sessions_count=0,
        )

    target_sessions = list(
        TrainingSession.objects.filter(date__range=(target_week_start, target_week_end))
        .order_by("date", "start_time", "id")
    )

    copied_slots: list[tuple[date, object, object]] = []
    for source_session in source_sessions:
        day_offset = (source_session.date - source_week_start).days
        copied_slots.append(
            (
                target_week_start + timedelta(days=day_offset),
                source_session.start_time,
                source_session.end_time,
            )
        )

    conflicting_session_ids: set[int] = set()
    for target_session in target_sessions:
        for copied_date, copied_start, copied_end in copied_slots:
            if target_session.date != copied_date:
                continue
            if (
                target_session.start_time < copied_end
                and target_session.end_time > copied_start
            ):
                conflicting_session_ids.add(target_session.id)
                break

    copied_sessions_count = 0
    with transaction.atomic():
        if conflicting_session_ids:
            TrainingSession.objects.filter(id__in=conflicting_session_ids).delete()

        for source_session in source_sessions:
            day_offset = (source_session.date - source_week_start).days
            copied_session = TrainingSession.objects.create(
                title=source_session.title,
                date=target_week_start + timedelta(days=day_offset),
                start_time=source_session.start_time,
                end_time=source_session.end_time,
                type=source_session.type,
                direction=source_session.direction,
                coach=source_session.coach,
                location=source_session.location,
                intensity=source_session.intensity,
                spots_total=source_session.spots_total,
                spots_available=source_session.spots_available,
                description=source_session.description,
                registration_link=source_session.registration_link,
                color=source_session.color,
            )
            copied_session.levels.set(source_session.levels.all())
            for attachment in source_session.attachments.all():
                SessionAttachment.objects.create(
                    session=copied_session,
                    title=attachment.title,
                    file=attachment.file.name,
                )
            copied_sessions_count += 1

    return CopyPreviousWeekResult(
        source_week_start=source_week_start,
        source_week_end=source_week_end,
        target_week_start=target_week_start,
        target_week_end=target_week_end,
        copied_sessions_count=copied_sessions_count,
        replaced_sessions_count=len(conflicting_session_ids),
    )
