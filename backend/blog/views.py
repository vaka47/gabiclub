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

    def get_queryset(self):
        qs = super().get_queryset()
        # Allow both DRF filter (tags__slug) and a short alias (?tag=...)
        params = self.request.query_params
        tag_slug = params.get("tags__slug") or params.get("tag")
        tag_id = params.get("tags__id") or params.get("tag_id")
        if tag_slug:
            qs = qs.filter(tags__slug=tag_slug)
        if tag_id:
            qs = qs.filter(tags__id=tag_id)
        return qs.distinct()


class ArticleTagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ArticleTag.objects.all()
    serializer_class = ArticleTagSerializer
    lookup_field = "slug"
    ordering = ("title",)
