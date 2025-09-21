from django.contrib import admin

from .models import Camp, CampDay, CampGalleryImage, CampHighlight


class CampHighlightInline(admin.TabularInline):
    model = CampHighlight
    extra = 1


class CampDayInline(admin.TabularInline):
    model = CampDay
    extra = 1


class CampGalleryInline(admin.TabularInline):
    model = CampGalleryImage
    extra = 1


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
    inlines = [CampHighlightInline, CampDayInline, CampGalleryInline]


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
