from __future__ import annotations

from django.db import models
from django.utils.text import slugify


class CampStatus(models.TextChoices):
    DRAFT = "draft", "Черновик"
    UPCOMING = "upcoming", "Анонс"
    COMPLETED = "completed", "Проведён"


class Camp(models.Model):
    title = models.CharField("Название кэмпа", max_length=200)
    slug = models.SlugField("Слаг", max_length=220, unique=True, blank=True)
    summary = models.TextField("Краткое описание", blank=True)
    description = models.TextField("Полное описание")
    start_date = models.DateField("Дата начала")
    end_date = models.DateField("Дата окончания")
    price_from = models.DecimalField(
        "Цена от", max_digits=8, decimal_places=2, help_text="Минимальная стоимость участия"
    )
    location = models.CharField("Место проведения", max_length=255)
    hero_image = models.ImageField("Обложка", upload_to="camps/hero/", blank=True)
    registration_link = models.URLField("Ссылка на регистрацию", blank=True)
    status = models.CharField(
        "Статус",
        max_length=12,
        choices=CampStatus.choices,
        default=CampStatus.UPCOMING,
    )
    is_featured = models.BooleanField("Показывать на главной", default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_date"]
        verbose_name = "Кэмп"
        verbose_name_plural = "Кэмпы"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class CampHighlight(models.Model):
    camp = models.ForeignKey(Camp, related_name="highlights", on_delete=models.CASCADE)
    text = models.CharField("Преимущество", max_length=200)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Особенность кэмпа"
        verbose_name_plural = "Особенности кэмпа"

    def __str__(self) -> str:
        return self.text


class CampDay(models.Model):
    camp = models.ForeignKey(Camp, related_name="program", on_delete=models.CASCADE)
    day_number = models.PositiveIntegerField("День", default=1)
    title = models.CharField("Название дня", max_length=120, blank=True)
    description = models.TextField("Описание", blank=True)

    class Meta:
        ordering = ["day_number"]
        verbose_name = "День программы"
        verbose_name_plural = "Программа кэмпа"

    def __str__(self) -> str:
        return self.title or f"День {self.day_number}"


class CampGalleryImage(models.Model):
    camp = models.ForeignKey(Camp, related_name="gallery", on_delete=models.CASCADE)
    image = models.ImageField("Фото", upload_to="camps/gallery/")
    caption = models.CharField("Подпись", max_length=150, blank=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Фото кэмпа"
        verbose_name_plural = "Галерея кэмпа"

    def __str__(self) -> str:
        return self.caption or f"Фото {self.pk}"
