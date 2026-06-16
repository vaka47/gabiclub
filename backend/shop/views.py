from django.db.models import Prefetch
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

from .models import Product, ProductImage, ProductSize
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    lookup_field = "slug"
    filter_backends = (DjangoFilterBackend,)
    filterset_fields = {"cta_mode": ["exact"]}

    def get_queryset(self):
        image_queryset = ProductImage.objects.order_by("order", "id")
        size_queryset = ProductSize.objects.order_by("order", "id")
        return (
            Product.objects.filter(is_active=True)
            .prefetch_related(
                Prefetch("images", queryset=image_queryset),
                Prefetch("sizes", queryset=size_queryset),
            )
            .order_by("order", "id")
        )

