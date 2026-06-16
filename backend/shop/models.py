from __future__ import annotations

from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify


def build_unique_slug(
    model_class: type[models.Model],
    value: str,
    instance_id: int | None = None,
    fallback: str = "item",
) -> str:
    base_slug = slugify(value, allow_unicode=True) or fallback
    slug = base_slug
    suffix = 2
    queryset = model_class.objects.all()
    if instance_id is not None:
        queryset = queryset.exclude(pk=instance_id)

    while queryset.filter(slug=slug).exists():
        slug = f"{base_slug}-{suffix}"
        suffix += 1
    return slug


class ProductCtaMode(models.TextChoices):
    ORDER = "order", "Заказать"
    AVAILABILITY = "availability", "Узнать о наличии"


class Product(models.Model):
    name = models.CharField("Наименование", max_length=180)
    slug = models.SlugField(
        "Слаг",
        max_length=220,
        unique=True,
        blank=True,
        help_text="Используется в адресе товара и для открытия модального окна.",
    )
    description = models.TextField("Описание", blank=True)
    price = models.DecimalField("Цена", max_digits=10, decimal_places=2)
    sale_price = models.DecimalField(
        "Горящая цена",
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Если скидки нет, оставьте поле пустым.",
    )
    cta_mode = models.CharField(
        "Основное действие",
        max_length=20,
        choices=ProductCtaMode.choices,
        default=ProductCtaMode.ORDER,
    )
    size_chart_note = models.CharField(
        "Подсказка по размерам",
        max_length=220,
        blank=True,
        help_text="Например: Модель идёт в размер или рекомендуем брать на размер больше.",
    )
    order = models.PositiveIntegerField("Порядок", default=0)
    is_active = models.BooleanField("Показывать на сайте", default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Товар"
        verbose_name_plural = "Товары"

    def __str__(self) -> str:
        return self.name

    def clean(self) -> None:
        super().clean()
        if self.sale_price is not None and self.sale_price <= 0:
            raise ValidationError({"sale_price": "Горящая цена должна быть больше нуля."})
        if self.sale_price is not None and self.sale_price >= self.price:
            raise ValidationError(
                {"sale_price": "Горящая цена должна быть меньше обычной цены."}
            )

    def save(self, *args, **kwargs) -> None:
        if not self.slug:
            self.slug = build_unique_slug(Product, self.name, self.pk, fallback="product")
        super().save(*args, **kwargs)

    @property
    def has_discount(self) -> bool:
        return self.sale_price is not None


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        related_name="images",
        on_delete=models.CASCADE,
        verbose_name="Товар",
    )
    image = models.ImageField("Фотография", upload_to="shop/products/")
    caption = models.CharField("Подпись", max_length=140, blank=True)
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Фото товара"
        verbose_name_plural = "Фото товаров"

    def __str__(self) -> str:
        return self.caption or f"{self.product.name} #{self.order or self.pk or 'new'}"

    def save(self, *args, **kwargs) -> None:
        old_image_name = None
        if self.pk:
            old_image_name = (
                self.__class__.objects.filter(pk=self.pk).values_list("image", flat=True).first()
                or None
            )

        super().save(*args, **kwargs)

        current_image_name = self.image.name or None
        if old_image_name and old_image_name != current_image_name:
            storage = self.image.storage
            if storage.exists(old_image_name):
                storage.delete(old_image_name)

    def delete(self, *args, **kwargs) -> None:
        image_name = self.image.name or None
        storage = self.image.storage if self.image else None

        super().delete(*args, **kwargs)

        if image_name and storage and storage.exists(image_name):
            storage.delete(image_name)


class ProductSize(models.Model):
    product = models.ForeignKey(
        Product,
        related_name="sizes",
        on_delete=models.CASCADE,
        verbose_name="Товар",
    )
    label = models.CharField("Размер", max_length=40)
    details = models.CharField(
        "Параметры / комментарий",
        max_length=180,
        blank=True,
        help_text="Например: 84-90 см по груди или oversize fit.",
    )
    order = models.PositiveIntegerField("Порядок", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Размер"
        verbose_name_plural = "Размерная сетка"

    def __str__(self) -> str:
        return f"{self.product.name}: {self.label}"

