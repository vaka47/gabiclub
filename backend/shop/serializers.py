from rest_framework import serializers

from .models import Product, ProductImage, ProductSize


class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ("id", "image", "caption", "order")

    def get_image(self, obj: ProductImage):
        image = getattr(obj, "image", None)
        if not image:
            return None
        try:
            return image.url
        except Exception:
            return None


class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ("id", "label", "details", "order")


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    sizes = ProductSizeSerializer(many=True, read_only=True)
    cta_label = serializers.CharField(source="get_cta_mode_display", read_only=True)
    has_discount = serializers.BooleanField(read_only=True)
    current_price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "price",
            "sale_price",
            "current_price",
            "has_discount",
            "cta_mode",
            "cta_label",
            "size_chart_note",
            "order",
            "images",
            "sizes",
        )

    def get_current_price(self, obj: Product):
        return obj.sale_price if obj.sale_price is not None else obj.price

