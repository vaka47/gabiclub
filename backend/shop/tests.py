from __future__ import annotations

import importlib
from decimal import Decimal
from tempfile import TemporaryDirectory

from django.apps import apps
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from .models import Product, ProductCtaMode, ProductImage, ProductSize


TEST_IMAGE_BYTES = (
    b"GIF87a\x01\x00\x01\x00\x80\x00\x00"
    b"\x00\x00\x00\xff\xff\xff!\xf9\x04"
    b"\x01\x00\x00\x00\x00,\x00\x00\x00"
    b"\x00\x01\x00\x01\x00\x00\x02\x02D"
    b"\x01\x00;"
)


class ProductModelTests(TestCase):
    def test_slug_is_generated_and_discount_is_validated(self):
        product = Product(
            name="Куртка Race Shell",
            price=Decimal("12990.00"),
            sale_price=Decimal("9990.00"),
        )
        product.full_clean()
        product.save()

        self.assertTrue(product.slug)

    def test_sale_price_must_be_lower_than_regular_price(self):
        product = Product(
            name="Жилет",
            price=Decimal("7900.00"),
            sale_price=Decimal("7900.00"),
        )

        with self.assertRaises(ValidationError):
            product.full_clean()


class ProductApiTests(TestCase):
    def setUp(self) -> None:
        super().setUp()
        self.media_dir = TemporaryDirectory()
        self.media_override = override_settings(MEDIA_ROOT=self.media_dir.name)
        self.media_override.enable()
        self.visible = Product.objects.create(
            name="Куртка Race Shell",
            price=Decimal("12990.00"),
            sale_price=Decimal("9990.00"),
            cta_mode=ProductCtaMode.ORDER,
            order=2,
            is_active=True,
        )
        self.hidden = Product.objects.create(
            name="Скрытый товар",
            price=Decimal("4900.00"),
            order=1,
            is_active=False,
        )
        ProductImage.objects.create(
            product=self.visible,
            caption="Front",
            order=2,
            image=SimpleUploadedFile("front.gif", TEST_IMAGE_BYTES, content_type="image/gif"),
        )
        ProductImage.objects.create(
            product=self.visible,
            caption="Side",
            order=1,
            image=SimpleUploadedFile("side.gif", TEST_IMAGE_BYTES, content_type="image/gif"),
        )
        ProductSize.objects.create(product=self.visible, label="S", details="84-90 см", order=2)
        ProductSize.objects.create(product=self.visible, label="M", details="90-96 см", order=1)

    def tearDown(self) -> None:
        self.media_override.disable()
        self.media_dir.cleanup()
        super().tearDown()

    def test_products_endpoint_returns_only_active_products_with_nested_content(self):
        response = self.client.get("/api/shop/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()["results"]
        self.assertEqual(len(payload), 1)
        self.assertEqual(payload[0]["name"], "Куртка Race Shell")
        self.assertEqual(payload[0]["images"][0]["caption"], "Side")
        self.assertEqual(payload[0]["sizes"][0]["label"], "M")

    def test_product_detail_is_resolved_by_slug(self):
        response = self.client.get(f"/api/shop/{self.visible.slug}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["cta_mode"], ProductCtaMode.ORDER)


class StagingProductSeedTests(TestCase):
    @override_settings(GABI_NO_INDEX=True)
    def test_seed_populates_demo_products_only_for_staging(self):
        migration = importlib.import_module("shop.migrations.0002_seed_staging_products")

        migration.seed_staging_products(apps, None)

        self.assertGreaterEqual(Product.objects.count(), 2)
        product = Product.objects.get(name="Race Shell Jacket")
        self.assertEqual(product.cta_mode, ProductCtaMode.ORDER)
        self.assertGreaterEqual(product.sizes.count(), 3)

    @override_settings(GABI_NO_INDEX=False)
    def test_seed_is_noop_outside_staging(self):
        migration = importlib.import_module("shop.migrations.0002_seed_staging_products")

        migration.seed_staging_products(apps, None)

        self.assertEqual(Product.objects.count(), 0)
