from rest_framework import serializers

from .models import (
    Coach,
    LevelTag,
    Location,
    SessionAttachment,
    TrainingDirection,
    TrainingPlan,
    TrainingPlanBenefit,
    TrainingSession,
)


class LevelTagSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="get_tag_display", read_only=True)

    class Meta:
        model = LevelTag
        fields = ("id", "tag", "name")


class TrainingDirectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingDirection
        fields = ("id", "title", "description", "icon")


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ("id", "title", "address", "latitude", "longitude")


class CoachSerializer(serializers.ModelSerializer):
    directions = TrainingDirectionSerializer(many=True, read_only=True)
    photo = serializers.SerializerMethodField()

    class Meta:
        model = Coach
        fields = (
            "id",
            "full_name",
            "slug",
            "role",
            "bio",
            "achievements",
            "experience_years",
            "photo",
            "instagram",
            "telegram",
            "phone",
            "email",
            "is_featured",
            "directions",
        )

    def get_photo(self, obj: Coach):
        f = getattr(obj, "photo", None)
        if not f:
            return None
        try:
            return f.url
        except Exception:
            return None


class TrainingPlanBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingPlanBenefit
        fields = ("id", "text", "order")


class TrainingPlanSerializer(serializers.ModelSerializer):
    benefits = TrainingPlanBenefitSerializer(many=True, read_only=True)
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )

    class Meta:
        model = TrainingPlan
        fields = (
            "id",
            "title",
            "category",
            "category_display",
            "icon",
            "description",
            "price",
            "period",
            "buy_link",
            "buy_label",
            "is_featured",
            "order",
            "benefits",
        )


class SessionAttachmentSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = SessionAttachment
        fields = ("id", "title", "file")

    def get_file(self, obj):
        f = getattr(obj, "file", None)
        if not f:
            return None
        try:
            return f.url
        except Exception:
            return None


class TrainingSessionSerializer(serializers.ModelSerializer):
    coach = CoachSerializer(read_only=True)
    direction = TrainingDirectionSerializer(read_only=True)
    location = LocationSerializer(read_only=True)
    levels = LevelTagSerializer(many=True, read_only=True)
    duration = serializers.SerializerMethodField()
    is_open = serializers.BooleanField(source="is_open", read_only=True)
    attachments = SessionAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = TrainingSession
        fields = (
            "id",
            "title",
            "date",
            "start_time",
            "end_time",
            "type",
            "direction",
            "coach",
            "location",
            "levels",
            "intensity",
            "spots_total",
            "spots_available",
            "description",
            "registration_link",
            "color",
            "duration",
            "is_open",
            "attachments",
        )

    def get_duration(self, obj: TrainingSession) -> int:
        return obj.duration_minutes()
