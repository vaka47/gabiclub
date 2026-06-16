from django.contrib import admin
from django.utils.html import format_html

from .models import Product, ProductImage, ProductSize


class ProductImageAdminMixin:
    @admin.display(description="Превью")
    def image_preview(self, obj):
        if not obj.image:
            return "—"
        return format_html(
            '<img src="{}" alt="" style="height:80px;width:80px;object-fit:cover;border-radius:18px;border:1px solid #d1d5db;" />',
            obj.image.url,
        )


class ProductImageInline(ProductImageAdminMixin, admin.TabularInline):
    model = ProductImage
    extra = 0
    fields = ("order", "image", "caption", "image_preview")
    readonly_fields = ("image_preview",)
    ordering = ("order", "id")


class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 0
    fields = ("order", "label", "details")
    ordering = ("order", "id")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "order",
        "display_price",
        "sale_price",
        "cta_mode",
        "is_active",
        "updated_at",
    )
    list_editable = ("order", "is_active")
    list_filter = ("is_active", "cta_mode")
    search_fields = ("name", "description", "slug")
    ordering = ("order", "id")
    fields = (
        "name",
        "slug",
        "description",
        "price",
        "sale_price",
        "cta_mode",
        "size_chart_note",
        "order",
        "is_active",
    )
    inlines = [ProductImageInline, ProductSizeInline]

    @admin.display(description="Цена")
    def display_price(self, obj: Product):
        return obj.price

