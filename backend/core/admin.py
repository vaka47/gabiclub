from django.contrib import admin
from django.utils.html import format_html

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


class HeroSlideAdminMixin:
    @admin.display(description="Превью")
    def image_preview(self, obj):
        if not obj.image:
            return "—"
        return format_html(
            '<img src="{}" alt="" style="height:72px;width:128px;object-fit:cover;border-radius:12px;border:1px solid #d1d5db;" />',
            obj.image.url,
        )

    @admin.display(description="Файл")
    def image_name(self, obj):
        if not obj.image:
            return "—"
        return obj.image.name.rsplit("/", 1)[-1]

    @admin.display(description="Скачать")
    def image_download(self, obj):
        if not obj.image:
            return "—"
        filename = obj.image.name.rsplit("/", 1)[-1]
        return format_html(
            '<a href="{}" download="{}" target="_blank" rel="noopener">Скачать</a>',
            obj.image.url,
            filename,
        )


class HeroSlideInline(HeroSlideAdminMixin, admin.TabularInline):
    model = HeroSlide
    extra = 0
    fields = ("order", "title", "subtitle", "image", "image_preview", "image_name", "image_download")
    readonly_fields = ("image_preview", "image_name", "image_download")
    ordering = ("order", "id")
    show_change_link = True


@admin.register(ClubProfile)
class ClubProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "tagline", "founded_year", "updated_at")
    inlines = [HeroSlideInline]


@admin.register(HeroSlide)
class HeroSlideAdmin(HeroSlideAdminMixin, admin.ModelAdmin):
    list_display = ("id", "profile", "order", "title", "image_preview", "image_name", "image_download")
    list_editable = ("order",)
    list_filter = ("profile",)
    search_fields = ("title", "subtitle", "profile__name", "image")
    ordering = ("profile", "order", "id")
    fields = ("profile", "order", "title", "subtitle", "image", "image_preview", "image_name", "image_download")
    readonly_fields = ("image_preview", "image_name", "image_download")


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
