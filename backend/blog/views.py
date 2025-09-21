from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter

from .models import Article, ArticleTag
from .serializers import ArticleListSerializer, ArticleSerializer, ArticleTagSerializer


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Article.objects.prefetch_related("tags").filter(is_published=True)
    serializer_class = ArticleSerializer
    lookup_field = "slug"
    filter_backends = (DjangoFilterBackend, SearchFilter, OrderingFilter)
    filterset_fields = {"tags__slug": ["exact"], "tags__id": ["exact"]}
    search_fields = ("title", "excerpt", "content")
    ordering_fields = ("published_at", "reading_time")
    ordering = ("-published_at",)

    def get_serializer_class(self):
        if self.action == "list":
            return ArticleListSerializer
        return super().get_serializer_class()


class ArticleTagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ArticleTag.objects.all()
    serializer_class = ArticleTagSerializer
    lookup_field = "slug"
    ordering = ("title",)
