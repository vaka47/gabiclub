from django import forms
from django.contrib import admin

from .models import (
    Coach,
    LevelTag,
    Location,
    SessionAttachment,
    SessionTariff,
    SessionTariffPrice,
    Training,
    TrainingDirection,
    TrainingDirectionLocation,
    TrainingDirectionPhoto,
    TrainingDirectionTariff,
    TrainingPlan,
    TrainingPlanBenefit,
    TrainingSession,
)


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ("title", "date", "time", "coach", "location", "type")
    list_filter = ("date", "coach", "type")
    search_fields = ("title", "coach", "location")



class TrainingPlanBenefitInline(admin.TabularInline):
    model = TrainingPlanBenefit
    extra = 3
    fields = ("order", "text")
    ordering = ("order", "id")


@admin.register(TrainingPlan)
class TrainingPlanAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "price", "period", "buy_link", "is_featured", "order")
    list_filter = ("category", "is_featured")
    ordering = ("category", "order")
    fieldsets = (
        ("Основное", {
            "fields": ("title", "icon", "category"),
        }),
        ("Стоимость", {
            "fields": ("price", "period"),
        }),
        ("Кнопка покупки (необязательно)", {
            "fields": ("buy_link", "buy_label"),
            "classes": ("collapse",),
        }),
        ("Публикация", {
            "fields": ("is_featured", "order"),
        }),
    )
    inlines = [TrainingPlanBenefitInline]


class SessionTariffPriceInline(admin.TabularInline):
    model = SessionTariffPrice
    extra = 2
    fields = ("order", "label", "price")
    ordering = ("order", "id")


@admin.register(SessionTariff)
class SessionTariffAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_featured", "order")
    list_filter = ("category", "is_featured")
    search_fields = ("title", "description")
    ordering = ("category", "order", "title")
    fieldsets = (
        (
            "Основное",
            {
                "fields": ("title", "category", "description"),
            },
        ),
        (
            "Публикация",
            {
                "fields": ("is_featured", "order"),
            },
        ),
    )
    inlines = [SessionTariffPriceInline]


class TrainingDirectionLocationInline(admin.TabularInline):
    model = TrainingDirectionLocation
    extra = 1
    fields = ("order", "location")
    autocomplete_fields = ("location",)
    ordering = ("order", "id")
    show_change_link = True


class TrainingDirectionTariffInline(admin.TabularInline):
    model = TrainingDirectionTariff
    extra = 1
    fields = ("order", "tariff")
    autocomplete_fields = ("tariff",)
    ordering = ("order", "id")
    show_change_link = True


class TrainingDirectionPhotoInline(admin.TabularInline):
    model = TrainingDirectionPhoto
    extra = 1
    fields = ("order", "image", "caption")
    ordering = ("order", "id")


class TrainingDirectionAdminForm(forms.ModelForm):
    class Meta:
        model = TrainingDirection
        fields = "__all__"
        help_texts = {
            "benefits": "Указывайте по одному пункту с новой строки.",
            "first_session_details": "Указывайте по одному пункту с новой строки.",
        }
        widgets = {
            "benefits": forms.Textarea(attrs={"rows": 6}),
            "first_session_details": forms.Textarea(attrs={"rows": 6}),
        }


@admin.register(TrainingDirection)
class TrainingDirectionAdmin(admin.ModelAdmin):
    form = TrainingDirectionAdminForm
    list_display = ("title", "slug", "is_active", "order", "icon")
    list_editable = ("is_active", "order")
    search_fields = ("title",)
    ordering = ("order", "title")
    fieldsets = (
        (
            "Основное",
            {
                "fields": ("title", "slug", "icon"),
            },
        ),
        (
            "Контент",
            {
                "fields": (
                    "description",
                    "benefits",
                    "first_session_details",
                ),
            },
        ),
        (
            "Публикация",
            {
                "fields": ("is_active", "order"),
            },
        ),
    )
    inlines = [
        TrainingDirectionLocationInline,
        TrainingDirectionTariffInline,
        TrainingDirectionPhotoInline,
    ]


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("title", "address", "latitude", "longitude")
    search_fields = ("title", "address")


@admin.register(LevelTag)
class LevelTagAdmin(admin.ModelAdmin):
    list_display = ("tag", "__str__")


class SessionAttachmentInline(admin.TabularInline):
    model = SessionAttachment
    extra = 0


@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "start_time",
        "end_time",
        "direction",
        "coach",
        "location",
        "type",
        "spots_available",
    )
    list_filter = ("type", "direction", "coach", "location", "levels")
    search_fields = (
        "title",
        "direction__title",
        "coach__full_name",
        "location__title",
    )
    filter_horizontal = ("levels",)
    inlines = [SessionAttachmentInline]


@admin.register(Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ("full_name", "role", "instagram", "telegram", "is_featured")
    search_fields = ("full_name", "bio", "instagram")
    filter_horizontal = ("directions",)
    list_filter = ("is_featured", "directions")


@admin.register(SessionAttachment)
class SessionAttachmentAdmin(admin.ModelAdmin):
    list_display = ("session", "title", "file")
    search_fields = ("session__title", "title")
