from rest_framework import serializers

from .models import ClubProfile, ContactInfo, HeroSlide, LeadRequest, SocialLink


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ("id", "title", "url", "icon", "order")


class ContactInfoSerializer(serializers.ModelSerializer):
    social_links = SocialLinkSerializer(many=True, read_only=True)

    class Meta:
        model = ContactInfo
        fields = (
            "id",
            "title",
            "phone_primary",
            "phone_secondary",
            "email",
            "address",
            "map_url",
            "working_hours",
            "whatsapp",
            "telegram",
            "instagram",
            "youtube",
            "vk",
            "social_links",
        )


class HeroSlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSlide
        fields = ("id", "title", "subtitle", "image", "order")


class ClubProfileSerializer(serializers.ModelSerializer):
    hero_slides = HeroSlideSerializer(many=True, read_only=True)

    class Meta:
        model = ClubProfile
        fields = (
            "id",
            "name",
            "tagline",
            "mission",
            "story",
            "founded_year",
            "hero_video",
            "hero_description",
            "seo_title",
            "seo_description",
            "hero_slides",
        )


class LeadRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadRequest
        fields = (
            "full_name",
            "email",
            "phone",
            "preferred_direction",
            "message",
            "source",
        )

    def validate(self, attrs):
        if not attrs.get("email") and not attrs.get("phone"):
            raise serializers.ValidationError(
                "Укажите телефон или email для обратной связи"
            )
        return attrs
