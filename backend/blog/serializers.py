from rest_framework import serializers

from .models import Article, ArticleGalleryImage, ArticleTag


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
            "published_at",
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

    class Meta:
        model = Article
        fields = (
            "id",
            "title",
            "slug",
            "excerpt",
            "content",
            "cover_image",
            "gallery",
            "published_at",
            "updated_at",
            "reading_time",
            "tags",
            "seo_title",
            "seo_description",
            "is_published",
        )
