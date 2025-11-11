from django.contrib import admin

from .models import (
    Coach,
    LevelTag,
    Location,
    SessionAttachment,
    Training,
    TrainingDirection,
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


@admin.register(TrainingDirection)
class TrainingDirectionAdmin(admin.ModelAdmin):
    list_display = ("title", "icon")
    search_fields = ("title",)


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ("title", "address")
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
