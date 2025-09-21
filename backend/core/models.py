from __future__ import annotations

from django.db import models


class ContactInfo(models.Model):
    title = models.CharField("Название блока", max_length=120, default="Gabi Club")
    phone_primary = models.CharField("Основной телефон", max_length=30, blank=True)
    phone_secondary = models.CharField("Дополнительный телефон", max_length=30, blank=True)
    email = models.EmailField("Email", blank=True)
    address = models.CharField("Адрес", max_length=255, blank=True)
    map_url = models.URLField("Ссылка на карту", blank=True)
    working_hours = models.CharField("График работы", max_length=150, blank=True)
    whatsapp = models.CharField("WhatsApp", max_length=120, blank=True)
    telegram = models.CharField("Telegram", max_length=120, blank=True)
    instagram = models.CharField("Instagram", max_length=120, blank=True)
    youtube = models.CharField("YouTube", max_length=120, blank=True)
    vk = models.CharField("VK", max_length=120, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Контактная информация"
        verbose_name_plural = "Контактная информация"

    def __str__(self) -> str:
        return self.title


class SocialLink(models.Model):
    contact = models.ForeignKey(
        ContactInfo, related_name="social_links", on_delete=models.CASCADE
    )
    title = models.CharField("Название", max_length=60)
    url = models.URLField("Ссылка")
    icon = models.CharField(
        "Иконка", max_length=60, blank=True, help_text="CSS-класс или emoji"
    )
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "title"]
        verbose_name = "Социальная сеть"
        verbose_name_plural = "Социальные сети"

    def __str__(self) -> str:
        return self.title


class ClubProfile(models.Model):
    name = models.CharField("Название клуба", max_length=160, default="Gabi Club")
    tagline = models.CharField("Слоган", max_length=200, blank=True)
    mission = models.TextField("Миссия", blank=True)
    story = models.TextField("История", blank=True)
    founded_year = models.PositiveIntegerField("Год основания", null=True, blank=True)
    hero_video = models.URLField("Видео", blank=True)
    hero_description = models.TextField("Описание в герое", blank=True)
    seo_title = models.CharField("SEO Title", max_length=200, blank=True)
    seo_description = models.TextField("SEO Description", blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Профиль клуба"
        verbose_name_plural = "Профиль клуба"

    def __str__(self) -> str:
        return self.name


class HeroSlide(models.Model):
    profile = models.ForeignKey(
        ClubProfile, related_name="hero_slides", on_delete=models.CASCADE
    )
    title = models.CharField("Заголовок", max_length=120, blank=True)
    subtitle = models.CharField("Подзаголовок", max_length=200, blank=True)
    image = models.ImageField("Изображение", upload_to="hero/", blank=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Слайд героя"
        verbose_name_plural = "Слайды героя"

    def __str__(self) -> str:
        return self.title or f"Слайд {self.pk}"


class LeadRequest(models.Model):
    full_name = models.CharField("Имя", max_length=120)
    email = models.EmailField("Email", blank=True)
    phone = models.CharField("Телефон", max_length=30)
    preferred_direction = models.CharField("Направление", max_length=120, blank=True)
    message = models.TextField("Комментарий", blank=True)
    source = models.CharField("Источник", max_length=60, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Заявка на тренировку"
        verbose_name_plural = "Заявки на тренировку"

    def __str__(self) -> str:
        return f"{self.full_name} ({self.created_at:%d.%m.%Y})"
