from rest_framework import serializers

from .models import Camp, CampDay, CampGalleryImage, CampHighlight


class CampHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampHighlight
        fields = ("id", "text", "order")


class CampDaySerializer(serializers.ModelSerializer):
    class Meta:
        model = CampDay
        fields = ("id", "day_number", "title", "description")


class CampGalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampGalleryImage
        fields = ("id", "image", "caption", "order")


class CampSerializer(serializers.ModelSerializer):
    highlights = CampHighlightSerializer(many=True, read_only=True)
    program = CampDaySerializer(many=True, read_only=True)
    gallery = CampGalleryImageSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Camp
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "description",
            "start_date",
            "end_date",
            "price_from",
            "location",
            "hero_image",
            "registration_link",
            "status",
            "status_display",
            "is_featured",
            "highlights",
            "program",
            "gallery",
        )


class CampListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Camp
        fields = (
            "id",
            "title",
            "slug",
            "summary",
            "start_date",
            "end_date",
            "price_from",
            "location",
            "hero_image",
            "status",
            "status_display",
            "is_featured",
        )
