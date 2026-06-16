from __future__ import annotations

from pathlib import Path
from tempfile import TemporaryDirectory

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from core.models import ClubProfile, HeroSlide


class HeroSlideImageCleanupTests(TestCase):
    def setUp(self) -> None:
        super().setUp()
        self.temp_dir = TemporaryDirectory()
        self.override = override_settings(MEDIA_ROOT=self.temp_dir.name)
        self.override.enable()
        self.addCleanup(self.override.disable)
        self.addCleanup(self.temp_dir.cleanup)
        self.profile = ClubProfile.objects.create(name="Gabi Club")

    def _upload(self, name: str, payload: bytes) -> SimpleUploadedFile:
        return SimpleUploadedFile(name, payload, content_type="image/jpeg")

    def test_replacing_image_removes_old_file(self) -> None:
        slide = HeroSlide.objects.create(
            profile=self.profile,
            order=1,
            image=self._upload("hero-one.jpg", b"old-image"),
        )
        old_path = Path(slide.image.path)

        slide.image = self._upload("hero-two.jpg", b"new-image")
        slide.save()

        self.assertFalse(old_path.exists())
        self.assertTrue(Path(slide.image.path).exists())

    def test_deleting_slide_removes_file(self) -> None:
        slide = HeroSlide.objects.create(
            profile=self.profile,
            order=1,
            image=self._upload("hero-delete.jpg", b"to-delete"),
        )
        image_path = Path(slide.image.path)

        slide.delete()

        self.assertFalse(image_path.exists())
