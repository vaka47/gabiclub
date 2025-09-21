from __future__ import annotations

from datetime import datetime

from django.db import models
from django.utils.text import slugify


class Training(models.Model):
    """Легаси-модель для простых записей о тренировках."""

    title = models.CharField("Название", max_length=100)
    date = models.DateField("Дата")
    time = models.TimeField("Время")
    coach = models.CharField("Тренер", max_length=100)
    location = models.CharField("Локация", max_length=255)
    type = models.CharField("Тип тренировки", max_length=100)

    class Meta:
        verbose_name = "Тренировка (legacy)"
        verbose_name_plural = "Тренировки (legacy)"

    def __str__(self) -> str:
        return f"{self.title} — {self.date} {self.time}"


class TrainingType(models.TextChoices):
    GROUP = "group", "Групповая"
    MINI_GROUP = "mini_group", "Мини-группа"
    OPEN = "open", "Открытая"
    PERSONAL = "personal", "Индивидуальная"


class LevelChoices(models.TextChoices):
    BEGINNER = "beginner", "Начальный"
    INTERMEDIATE = "intermediate", "Средний"
    ADVANCED = "advanced", "Продвинутый"
    ANY = "any", "Любой уровень"


class TrainingPlanCategory(models.TextChoices):
    PERSONAL = "personal", "Индивидуальные outdoor"
    MINI_GROUP = "mini_group", "Мини-группы"
    ATHLETE = "athlete", "Группы для спортсменов"
    KIDS = "kids", "Группы для детей"


class TrainingDirection(models.Model):
    title = models.CharField("Название направления", max_length=100)
    description = models.TextField("Описание", blank=True)
    icon = models.CharField(
        "Иконка", max_length=120, blank=True, help_text="CSS-класс или emoji"
    )

    class Meta:
        ordering = ["title"]
        verbose_name = "Направление"
        verbose_name_plural = "Направления"

    def __str__(self) -> str:
        return self.title


class Location(models.Model):
    title = models.CharField("Название локации", max_length=100)
    address = models.CharField("Адрес", max_length=255, blank=True)
    latitude = models.DecimalField(
        "Широта", max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        "Долгота", max_digits=9, decimal_places=6, null=True, blank=True
    )

    class Meta:
        ordering = ["title"]
        verbose_name = "Локация"
        verbose_name_plural = "Локации"

    def __str__(self) -> str:
        return self.title


class LevelTag(models.Model):
    tag = models.CharField(
        "Уровень", choices=LevelChoices.choices, max_length=20, unique=True
    )

    class Meta:
        ordering = ["tag"]
        verbose_name = "Уровень подготовки"
        verbose_name_plural = "Уровни подготовки"

    def __str__(self) -> str:
        return self.get_tag_display()


class Coach(models.Model):
    full_name = models.CharField("ФИО", max_length=120)
    slug = models.SlugField("Слаг", max_length=140, unique=True, blank=True)
    role = models.CharField("Роль", max_length=120, blank=True)
    directions = models.ManyToManyField(
        TrainingDirection, related_name="coaches", verbose_name="Направления"
    )
    bio = models.TextField("Биография", blank=True)
    achievements = models.TextField("Достижения", blank=True)
    experience_years = models.PositiveIntegerField(
        "Опыт (лет)", default=0, help_text="Полные годы опыта"
    )
    photo = models.ImageField(
        "Фотография", upload_to="coaches/photos/", blank=True
    )
    instagram = models.CharField(
        "Instagram", max_length=100, blank=True, help_text="Имя пользователя или ссылка"
    )
    telegram = models.CharField(
        "Telegram", max_length=100, blank=True, help_text="Имя пользователя или ссылка"
    )
    phone = models.CharField("Телефон", max_length=32, blank=True)
    email = models.EmailField("Email", blank=True)
    is_featured = models.BooleanField(
        "Выводить на главной", default=False
    )

    class Meta:
        ordering = ["full_name"]
        verbose_name = "Тренер"
        verbose_name_plural = "Тренеры"

    def __str__(self) -> str:
        return self.full_name

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            self.slug = slugify(self.full_name)
        super().save(*args, **kwargs)


class TrainingPlan(models.Model):
    title = models.CharField("Название тарифа", max_length=160)
    category = models.CharField(
        "Категория", max_length=32, choices=TrainingPlanCategory.choices
    )
    description = models.TextField("Описание", blank=True)
    price = models.DecimalField("Стоимость", max_digits=9, decimal_places=2)
    period = models.CharField("Периодичность", max_length=80)
    is_featured = models.BooleanField("Выделенный тариф", default=False)
    order = models.PositiveIntegerField("Порядок", default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "order", "price"]
        verbose_name = "Тариф на тренировки"
        verbose_name_plural = "Тарифы на тренировки"

    def __str__(self) -> str:
        return f"{self.title} ({self.get_category_display()})"


class TrainingPlanBenefit(models.Model):
    plan = models.ForeignKey(
        TrainingPlan, related_name="benefits", on_delete=models.CASCADE
    )
    text = models.CharField("Преимущество", max_length=200)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Преимущество тарифа"
        verbose_name_plural = "Преимущества тарифов"

    def __str__(self) -> str:
        return self.text


class TrainingSession(models.Model):
    title = models.CharField("Название занятия", max_length=160, blank=True)
    date = models.DateField("Дата")
    start_time = models.TimeField("Начало")
    end_time = models.TimeField("Окончание")
    type = models.CharField("Формат", max_length=15, choices=TrainingType.choices)
    direction = models.ForeignKey(
        TrainingDirection, on_delete=models.CASCADE, related_name="sessions"
    )
    coach = models.ForeignKey(
        Coach, on_delete=models.SET_NULL, null=True, related_name="sessions"
    )
    location = models.ForeignKey(
        Location, on_delete=models.CASCADE, related_name="sessions"
    )
    levels = models.ManyToManyField(LevelTag, related_name="sessions", blank=True)
    intensity = models.CharField("Интенсивность", max_length=80, blank=True)
    spots_total = models.PositiveIntegerField("Всего мест", default=0)
    spots_available = models.PositiveIntegerField(
        "Свободных мест", default=0, help_text="0 если запись закрыта"
    )
    description = models.TextField("Описание", blank=True)
    registration_link = models.URLField("Ссылка на запись", blank=True)
    color = models.CharField(
        "Цвет в календаре", max_length=20, blank=True, default="#006CFF"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]
        verbose_name = "Сеанс тренировки"
        verbose_name_plural = "Расписание тренировок"

    def __str__(self) -> str:
        coach = self.coach.full_name if self.coach else ""
        return f"{self.date} {self.start_time} {self.direction} {coach}".strip()

    def duration_minutes(self) -> int:
        start_dt = datetime.combine(self.date, self.start_time)
        end_dt = datetime.combine(self.date, self.end_time)
        return int((end_dt - start_dt).total_seconds() // 60)

    @property
    def is_open(self) -> bool:
        return self.spots_available > 0


class SessionAttachment(models.Model):
    session = models.ForeignKey(
        TrainingSession, related_name="attachments", on_delete=models.CASCADE
    )
    title = models.CharField("Заголовок", max_length=120, blank=True)
    file = models.FileField("Файл", upload_to="trainings/attachments/")

    class Meta:
        verbose_name = "Материал тренировки"
        verbose_name_plural = "Материалы тренировки"

    def __str__(self) -> str:
        return self.title or self.file.name
