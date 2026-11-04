from __future__ import annotations

from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.db import migrations


DEFAULT_HERO_SLIDES = (
    ("Фото 1", "gabigroup-main.jpg"),
    ("Фото 2", "hero-1-min.jpg"),
    ("Фото 3", "hero-2-min.jpg"),
)


def _resolve_public_dir() -> Path | None:
    candidates = [
        Path(settings.BASE_DIR).parent / "frontend" / "public",
        Path(__file__).resolve().parents[3] / "frontend" / "public",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def seed_staging_hero_slides(apps, schema_editor):
    if not getattr(settings, "GABI_NO_INDEX", False):
        return

    ClubProfile = apps.get_model("core", "ClubProfile")
    HeroSlide = apps.get_model("core", "HeroSlide")

    profile = ClubProfile.objects.order_by("id").first()
    if not profile:
        return
    if HeroSlide.objects.filter(profile_id=profile.id).exists():
        return

    public_dir = _resolve_public_dir()
    if public_dir is None:
        return

    for order, (title, filename) in enumerate(DEFAULT_HERO_SLIDES, start=1):
        source_path = public_dir / filename
        if not source_path.exists():
            continue

        slide = HeroSlide(profile_id=profile.id, title=title, order=order)
        with source_path.open("rb") as source_file:
            slide.image.save(filename, File(source_file), save=False)
        slide.save()


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0004_themesettings_bgcolor"),
    ]

    operations = [
        migrations.RunPython(seed_staging_hero_slides, migrations.RunPython.noop),
    ]
