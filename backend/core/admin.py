from django.contrib import admin

from .models import ClubProfile, ContactInfo, HeroSlide, LeadRequest, SocialLink, ThemeSettings


class SocialLinkInline(admin.TabularInline):
    model = SocialLink
    extra = 0


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "phone_primary",
        "email",
        "telegram",
        "instagram",
        "updated_at",
    )
    search_fields = ("title", "phone_primary", "email")
    inlines = [SocialLinkInline]


class HeroSlideInline(admin.TabularInline):
    model = HeroSlide
    extra = 0


@admin.register(ClubProfile)
class ClubProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "tagline", "founded_year", "updated_at")
    inlines = [HeroSlideInline]


@admin.register(LeadRequest)
class LeadRequestAdmin(admin.ModelAdmin):
    list_display = ("full_name", "phone", "preferred_direction", "created_at")
    search_fields = ("full_name", "phone", "email", "preferred_direction")
    list_filter = ("source", "created_at")
    readonly_fields = ("created_at",)


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ("title", "url", "contact", "order")
    list_filter = ("contact",)
    ordering = ("contact", "order")


@admin.register(ThemeSettings)
class ThemeSettingsAdmin(admin.ModelAdmin):
    list_display = (
        "primary_color",
        "secondary_color",
        "gradient_start",
        "gradient_end",
        "background_color",
        "updated_at",
    )
    readonly_fields = ("updated_at",)
