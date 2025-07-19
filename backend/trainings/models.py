from django.db import models

# Create your models here.


from django.db import models

class Training(models.Model):
    title = models.CharField("Название", max_length=100)
    date = models.DateField("Дата")
    time = models.TimeField("Время")
    coach = models.CharField("Тренер", max_length=100)
    location = models.CharField("Локация", max_length=255)
    type = models.CharField("Тип тренировки", max_length=100)

    def __str__(self):
        return f"{self.title} — {self.date} {self.time}"

from django.db import models

class TrainingType(models.TextChoices):
    GROUP = 'group', 'Групповая'
    OPEN = 'open', 'Открытая'

class LevelChoices(models.TextChoices):
    BEGINNER = 'beginner', 'Начальный'
    INTERMEDIATE = 'intermediate', 'Средний'
    ADVANCED = 'advanced', 'Продвинутый'
    ANY = 'any', 'Любой уровень'

class TrainingDirection(models.Model):
    title = models.CharField(max_length=100)

    def __str__(self):
        return self.title

class Location(models.Model):
    title = models.CharField(max_length=100)

    def __str__(self):
        return self.title




from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Coach(models.Model):
    full_name = models.CharField(max_length=100)
    directions = models.ManyToManyField('TrainingDirection', related_name='coaches')
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to='coaches/photos/', blank=True)
    instagram = models.CharField(max_length=100, blank=True, help_text="Имя пользователя без @ или ссылка")

    def __str__(self):
        return self.full_name

class TrainingSession(models.Model):
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    type = models.CharField(max_length=10, choices=TrainingType.choices)
    direction = models.ForeignKey(TrainingDirection, on_delete=models.CASCADE)
    coach = models.ForeignKey(Coach, on_delete=models.SET_NULL, null=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)
    levels = models.ManyToManyField("LevelTag")

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.date} {self.start_time} {self.coach}"

    def duration_minutes(self):
        from datetime import datetime, timedelta
        start = datetime.combine(self.date, self.start_time)
        end = datetime.combine(self.date, self.end_time)
        return int((end - start).total_seconds() // 60)

class LevelTag(models.Model):
    tag = models.CharField(max_length=20, choices=LevelChoices.choices, unique=True)

    def __str__(self):
        return self.get_tag_display()



