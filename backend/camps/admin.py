from django.contrib import admin

from .models import Camp, CampDay, CampGalleryImage, CampHighlight, CampInclusion


class CampHighlightInline(admin.TabularInline):
    model = CampHighlight
    extra = 1


class CampDayInline(admin.TabularInline):
    model = CampDay
    extra = 1


class CampGalleryInline(admin.TabularInline):
    model = CampGalleryImage
    extra = 1

class CampInclusionInline(admin.TabularInline):
    model = CampInclusion
    extra = 2


@admin.register(Camp)
class CampAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "start_date",
        "end_date",
        "location",
        "status",
        "is_featured",
    )
    list_filter = ("status", "is_featured", "start_date")
    search_fields = ("title", "summary", "location")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [CampHighlightInline, CampInclusionInline, CampDayInline, CampGalleryInline]
    filter_horizontal = ("trainers",)
    fieldsets = (
        (None, {
            "fields": ("title", "slug", "summary", "description", "location")
        }),
        ("Даты и статус", {
            "fields": ("start_date", "end_date", "status", "is_featured")
        }),
        ("Изображения", {
            "fields": ("hero_image", "header_image")
        }),
        ("Регистрация", {
            "fields": ("price_from", "registration_link")
        }),
        ("Разделы", {
            "fields": ("target_audience", "logistics")
        }),
        ("Тренеры", {
            "fields": ("trainers",)
        }),
    )


@admin.register(CampHighlight)
class CampHighlightAdmin(admin.ModelAdmin):
    list_display = ("camp", "text", "order")
    list_filter = ("camp",)
    ordering = ("camp", "order")


@admin.register(CampDay)
class CampDayAdmin(admin.ModelAdmin):
    list_display = ("camp", "day_number", "title")
    ordering = ("camp", "day_number")


@admin.register(CampGalleryImage)
class CampGalleryImageAdmin(admin.ModelAdmin):
    list_display = ("camp", "caption", "order")
    ordering = ("camp", "order")

@admin.register(CampInclusion)
class CampInclusionAdmin(admin.ModelAdmin):
    list_display = ("camp", "text", "order")
    ordering = ("camp", "order")
