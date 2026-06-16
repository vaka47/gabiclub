from rest_framework import serializers

from .models import (
    Coach,
    LevelTag,
    Location,
    SessionAttachment,
    SessionTariff,
    SessionTariffPrice,
    TrainingDirection,
    TrainingDirectionLocation,
    TrainingDirectionPhoto,
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
        fields = (
            "id",
            "title",
            "slug",
            "description",
            "icon",
            "is_active",
            "order",
        )


class TrainingDirectionPublicSerializer(TrainingDirectionSerializer):
    cover_image = serializers.SerializerMethodField()

    class Meta(TrainingDirectionSerializer.Meta):
        fields = TrainingDirectionSerializer.Meta.fields + (
            "benefits",
            "first_session_details",
            "cover_image",
        )

    def get_cover_image(self, obj: TrainingDirection):
        first_photo = next(iter(obj.photos.all()), None)
        if not first_photo or not getattr(first_photo, "image", None):
            return None
        try:
            return first_photo.image.url
        except Exception:
            return None


class LocationSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(read_only=True)
    longitude = serializers.FloatField(read_only=True)

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


class SessionTariffPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionTariffPrice
        fields = ("id", "label", "price", "order")


class SessionTariffSerializer(serializers.ModelSerializer):
    prices = SessionTariffPriceSerializer(many=True, read_only=True)
    category_display = serializers.CharField(
        source="get_category_display", read_only=True
    )

    class Meta:
        model = SessionTariff
        fields = (
            "id",
            "title",
            "category",
            "category_display",
            "description",
            "is_featured",
            "order",
            "prices",
        )


class TrainingDirectionPhotoSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = TrainingDirectionPhoto
        fields = ("id", "image", "caption", "order")

    def get_image(self, obj: TrainingDirectionPhoto):
        image = getattr(obj, "image", None)
        if not image:
            return None
        try:
            return image.url
        except Exception:
            return None


class TrainingDirectionLocationSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="location.title", read_only=True)
    address = serializers.CharField(source="location.address", read_only=True)
    latitude = serializers.FloatField(source="location.latitude", read_only=True)
    longitude = serializers.FloatField(source="location.longitude", read_only=True)

    class Meta:
        model = TrainingDirectionLocation
        fields = ("id", "order", "title", "address", "latitude", "longitude")


class TrainingDirectionDetailSerializer(TrainingDirectionPublicSerializer):
    locations = TrainingDirectionLocationSerializer(
        many=True, read_only=True, source="direction_locations"
    )
    photos = TrainingDirectionPhotoSerializer(many=True, read_only=True)
    session_tariffs = serializers.SerializerMethodField()

    class Meta(TrainingDirectionPublicSerializer.Meta):
        fields = TrainingDirectionPublicSerializer.Meta.fields + (
            "locations",
            "photos",
            "session_tariffs",
        )

    def get_session_tariffs(self, obj: TrainingDirection):
        direction_tariffs = obj.direction_tariffs.all()
        tariffs = [link.tariff for link in direction_tariffs if getattr(link, "tariff", None)]
        return SessionTariffSerializer(tariffs, many=True).data


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
    is_open = serializers.BooleanField(read_only=True)
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
