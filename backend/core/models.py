from django.db import models

# Create your models here.
from django.db import models

class ContactLink(models.Model):
    instagram = models.URLField("Instagram", blank=True)
    telegram = models.URLField("Telegram", blank=True)
    website = models.URLField("Сайт", blank=True)
    phone = models.CharField("Телефон", max_length=30, blank=True)

    def __str__(self):
        return "Контакты"
