from django.db import models

# Create your models here.
from django.db import models

class Camp(models.Model):
    title = models.CharField("Название кэмпа", max_length=200)
    description = models.TextField("Описание")
    start_date = models.DateField("Дата начала")
    end_date = models.DateField("Дата окончания")
    price = models.DecimalField("Цена", max_digits=8, decimal_places=2)
    image = models.ImageField("Обложка", upload_to='camps/')
    location = models.CharField("Место проведения", max_length=255)

    def __str__(self):
        return self.title
