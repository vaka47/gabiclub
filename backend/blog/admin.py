from django.contrib import admin

from .models import Article, ArticleGalleryImage, ArticleSection, ArticleTag


class ArticleGalleryInline(admin.TabularInline):
    model = ArticleGalleryImage
    extra = 0

class ArticleSectionInline(admin.TabularInline):
    model = ArticleSection
    extra = 1
    fields = ("order", "title", "content")
    ordering = ("order",)


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
    inlines = [ArticleSectionInline, ArticleGalleryInline]


@admin.register(ArticleTag)
class ArticleTagAdmin(admin.ModelAdmin):
    list_display = ("title", "slug")
    search_fields = ("title",)
    prepopulated_fields = {"slug": ("title",)}
