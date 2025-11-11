from __future__ import annotations

from django.db import models
from django.utils.text import slugify


class ArticleTag(models.Model):
    title = models.CharField("Тег", max_length=60, unique=True)
    slug = models.SlugField("Слаг", max_length=80, unique=True, blank=True)

    class Meta:
        ordering = ["title"]
        verbose_name = "Тег"
        verbose_name_plural = "Теги"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class Article(models.Model):
    title = models.CharField("Заголовок", max_length=200)
    slug = models.SlugField("Слаг", max_length=240, unique=True, blank=True)
    excerpt = models.TextField("Краткое описание", blank=True)
    content = models.TextField("Содержание")
    cover_image = models.ImageField("Обложка", upload_to="articles/covers/", blank=True)
    header_image = models.ImageField("Шапка (горизонтальная)", upload_to="articles/headers/", blank=True)
    published_at = models.DateTimeField("Дата публикации", auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField("Опубликовано", default=True)
    seo_title = models.CharField("SEO Title", max_length=200, blank=True)
    seo_description = models.TextField("SEO Description", blank=True)
    reading_time = models.PositiveIntegerField(
        "Время чтения (мин)", default=5
    )
    tags = models.ManyToManyField(ArticleTag, related_name="articles", blank=True)

    class Meta:
        ordering = ["-published_at"]
        verbose_name = "Статья"
        verbose_name_plural = "Статьи"

    def __str__(self) -> str:
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)


class ArticleGalleryImage(models.Model):
    article = models.ForeignKey(
        Article, related_name="gallery", on_delete=models.CASCADE
    )
    image = models.ImageField("Фото", upload_to="articles/gallery/")
    caption = models.CharField("Подпись", max_length=200, blank=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Фото статьи"
        verbose_name_plural = "Галерея статьи"

    def __str__(self) -> str:
        return self.caption or (self.image.name if self.image else f"Фото #{self.pk}")


class ArticleSection(models.Model):
    article = models.ForeignKey(
        Article, related_name="sections", on_delete=models.CASCADE
    )
    title = models.CharField("Подзаголовок", max_length=160, blank=True)
    content = models.TextField("Текст абзаца", blank=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Абзац статьи"
        verbose_name_plural = "Абзацы статьи"

    def __str__(self) -> str:
        return self.title or (self.content[:40] + ("…" if len(self.content) > 40 else ""))
