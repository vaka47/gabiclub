from __future__ import annotations

from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.db import migrations
from django.utils.text import slugify


PRODUCTS = (
    {
        "name": "Race Shell Jacket",
        "description": (
            "Лёгкая ветро- и влагозащитная куртка для роллерных тренировок, холодного старта "
            "и интенсивных пробежек в межсезонье."
        ),
        "price": Decimal("12990.00"),
        "sale_price": Decimal("9990.00"),
        "cta_mode": "order",
        "size_chart_note": "Рекомендуем обычный размер: посадка спортивная, ближе к телу.",
        "order": 1,
        "images": (
            ("Главный ракурс", "main-1.jpg", 1),
            ("Деталь посадки", "hero-1.jpg", 2),
            ("Фактура ткани", "hero-2.jpg", 3),
        ),
        "sizes": (
            ("S", "84-90 см по груди", 1),
            ("M", "90-96 см по груди", 2),
            ("L", "96-102 см по груди", 3),
        ),
    },
    {
        "name": "Club Gilet",
        "description": (
            "Минималистичный жилет для разминки и длинных аэробных тренировок. "
            "Утеплённый фронт и эластичная спинка для свободы движения."
        ),
        "price": Decimal("8990.00"),
        "sale_price": None,
        "cta_mode": "availability",
        "size_chart_note": "Если планируете носить поверх толстого слоя, берите на размер больше.",
        "order": 2,
        "images": (
            ("Вид спереди", "main-2.jpg", 1),
            ("На спортсмене", "gabigroup-main.jpg", 2),
            ("Деталь спины", "hero-2-min.jpg", 3),
        ),
        "sizes": (
            ("XS", "80-84 см по груди", 1),
            ("S", "84-90 см по груди", 2),
            ("M", "90-96 см по груди", 3),
        ),
    },
    {
        "name": "Trail Cap",
        "description": (
            "Лёгкая кепка для бега и летних сборов: дышащая сетка, гибкий козырёк "
            "и быстрая фиксация одной рукой."
        ),
        "price": Decimal("3490.00"),
        "sale_price": Decimal("2790.00"),
        "cta_mode": "order",
        "size_chart_note": "Единый размер с регулировкой по объёму головы.",
        "order": 3,
        "images": (
            ("Общий вид", "main-3.jpg", 1),
            ("В движении", "hero-1-min.jpg", 2),
        ),
        "sizes": (
            ("One size", "54-60 см", 1),
        ),
    },
)


def _resolve_public_dir() -> Path | None:
    candidates = [
        Path(settings.BASE_DIR).parent / "frontend" / "public",
        Path(__file__).resolve().parents[3] / "frontend" / "public",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def _build_unique_slug(Product, value: str, instance_pk: int | None = None) -> str:
    base_slug = slugify(value, allow_unicode=True) or "product"
    slug = base_slug
    suffix = 2
    queryset = Product.objects.all()
    if instance_pk is not None:
        queryset = queryset.exclude(pk=instance_pk)

    while queryset.filter(slug=slug).exists():
        slug = f"{base_slug}-{suffix}"
        suffix += 1

    return slug


def seed_staging_products(apps, schema_editor):
    if not getattr(settings, "GABI_NO_INDEX", False):
        return

    Product = apps.get_model("shop", "Product")
    ProductImage = apps.get_model("shop", "ProductImage")
    ProductSize = apps.get_model("shop", "ProductSize")
    public_dir = _resolve_public_dir()

    if public_dir is None:
        return

    for item in PRODUCTS:
        product = Product.objects.filter(name=item["name"]).order_by("id").first()
        if product is None:
            product = Product(name=item["name"])

        product.description = item["description"]
        if not getattr(product, "slug", ""):
            product.slug = _build_unique_slug(Product, item["name"], getattr(product, "pk", None))
        product.price = item["price"]
        product.sale_price = item["sale_price"]
        product.cta_mode = item["cta_mode"]
        product.size_chart_note = item["size_chart_note"]
        product.order = item["order"]
        product.is_active = True
        product.save()

        for label, details, order in item["sizes"]:
            size = (
                ProductSize.objects.filter(product=product, label=label)
                .order_by("id")
                .first()
            )
            if size is None:
                size = ProductSize(product=product, label=label)
            size.details = details
            size.order = order
            size.save()

        for caption, filename, order in item["images"]:
            source_path = public_dir / filename
            if not source_path.exists():
                continue

            image = (
                ProductImage.objects.filter(product=product, caption=caption)
                .order_by("id")
                .first()
            )
            if image is None:
                image = ProductImage(product=product, caption=caption)

            image.order = order
            if not image.image:
                with source_path.open("rb") as source_file:
                    image.image.save(filename, File(source_file), save=False)
            image.save()


class Migration(migrations.Migration):
    dependencies = [
        ("shop", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_staging_products, migrations.RunPython.noop),
    ]
