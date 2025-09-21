from django.contrib import admin

from .models import Article, ArticleTag


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "published_at",
        "is_published",
        "reading_time",
    )
    list_filter = ("is_published", "published_at", "tags")
    search_fields = ("title", "excerpt", "content")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)
    ordering = ("-published_at",)


@admin.register(ArticleTag)
class ArticleTagAdmin(admin.ModelAdmin):
    list_display = ("title", "slug")
    search_fields = ("title",)
    prepopulated_fields = {"slug": ("title",)}
