from rest_framework import serializers

from .models import Article, ArticleGalleryImage, ArticleSection, ArticleTag


class ArticleTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleTag
        fields = ("id", "title", "slug")


class ArticleListSerializer(serializers.ModelSerializer):
    tags = ArticleTagSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "cover_image",
            "header_image",
            "published_at",
            "is_featured",
            "reading_time",
            "tags",
        )


class ArticleSerializer(serializers.ModelSerializer):
    tags = ArticleTagSerializer(many=True, read_only=True)
    
    class GalleryImageSerializer(serializers.ModelSerializer):
        class Meta:
            model = ArticleGalleryImage
            fields = ("id", "image", "caption", "order")
    gallery = GalleryImageSerializer(many=True, read_only=True)

    class SectionSerializer(serializers.ModelSerializer):
        class Meta:
            model = ArticleSection
            fields = ("id", "title", "content", "order")
    sections = SectionSerializer(many=True, read_only=True)

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover_image",
            "header_image",
            "gallery",
            "sections",
            "published_at",
            "updated_at",
            "is_featured",
            "reading_time",
            "tags",
            "seo_title",
            "seo_description",
            "is_published",
        )
