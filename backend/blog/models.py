from django.db import models

# Create your models here.
from django.db import models

class Article(models.Model):
    title = models.CharField("Заголовок", max_length=200)
    content = models.TextField("Содержание")
    image = models.ImageField("Обложка", upload_to='articles/')
    created_at = models.DateTimeField("Дата создания", auto_now_add=True)

    def __str__(self):
        return self.title


