from __future__ import annotations

from datetime import date, timedelta

from django import forms
from django.contrib import admin
from django.contrib import messages
from django.http import HttpResponseRedirect
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils import timezone
from django.utils.http import url_has_allowed_host_and_scheme

from . import models as training_models
from .schedule_copy import copy_previous_week_schedule, week_bounds

Coach = training_models.Coach
LevelTag = training_models.LevelTag
Location = training_models.Location
SessionAttachment = training_models.SessionAttachment
SessionTariff = training_models.SessionTariff
SessionTariffPrice = training_models.SessionTariffPrice
Training = training_models.Training
TrainingDirection = training_models.TrainingDirection
TrainingPlan = training_models.TrainingPlan
TrainingPlanBenefit = training_models.TrainingPlanBenefit
TrainingSession = training_models.TrainingSession
SessionTariffBenefit = getattr(training_models, "SessionTariffBenefit", None)
SessionTariffPhoto = getattr(training_models, "SessionTariffPhoto", None)
TrainingDirectionLocation = getattr(training_models, "TrainingDirectionLocation", None)
TrainingDirectionPhoto = getattr(training_models, "TrainingDirectionPhoto", None)
TrainingDirectionTariff = getattr(training_models, "TrainingDirectionTariff", None)
TrainingPlanPhoto = getattr(training_models, "TrainingPlanPhoto", None)


def model_field_names(model) -> set[str]:
    return {field.name for field in model._meta.get_fields()}


def available_fields(model, *field_names: str) -> tuple[str, ...]:
    existing = model_field_names(model)
    return tuple(field_name for field_name in field_names if field_name in existing)


def compact_inlines(*inline_classes):
    return [inline_class for inline_class in inline_classes if inline_class is not None]


TRAINING_DIRECTION_FIELDS = model_field_names(TrainingDirection)


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


if TrainingPlanPhoto is not None:
    class TrainingPlanPhotoInline(admin.TabularInline):
        model = TrainingPlanPhoto
        extra = 1
        fields = ("order", "image", "caption")
        ordering = ("order", "id")
else:
    TrainingPlanPhotoInline = None


@admin.register(TrainingPlan)
class TrainingPlanAdmin(admin.ModelAdmin):
    list_display = available_fields(
        TrainingPlan,
        "title",
        "category",
        "price",
        "period",
        "buy_link",
        "is_featured",
        "order",
    )
    list_filter = available_fields(TrainingPlan, "category", "is_featured")
    search_fields = available_fields(TrainingPlan, "title", "description", "slug")
    ordering = available_fields(TrainingPlan, "category", "order") or ("title",)
    fieldsets = tuple(
        section
        for section in (
            (
                "Основное",
                {
                    "fields": available_fields(TrainingPlan, "title", "icon", "category"),
                },
            ),
            (
                "Контент",
                {
                    "fields": available_fields(
                        TrainingPlan,
                        "description",
                        "video_vk_embed_url",
                        "video_file",
                    ),
                },
            ),
            (
                "Стоимость",
                {
                    "fields": available_fields(TrainingPlan, "price", "period"),
                },
            ),
            (
                "Кнопка покупки (необязательно)",
                {
                    "fields": available_fields(TrainingPlan, "buy_link", "buy_label"),
                    "classes": ("collapse",),
                },
            ),
            (
                "Публикация",
                {
                    "fields": available_fields(TrainingPlan, "is_featured", "order"),
                },
            ),
        )
        if section[1]["fields"]
    )
    inlines = compact_inlines(TrainingPlanBenefitInline, TrainingPlanPhotoInline)


class SessionTariffPriceInline(admin.TabularInline):
    model = SessionTariffPrice
    extra = 2
    fields = ("order", "label", "price")
    ordering = ("order", "id")


if SessionTariffBenefit is not None:
    class SessionTariffBenefitInline(admin.TabularInline):
        model = SessionTariffBenefit
        extra = 2
        fields = ("order", "text")
        ordering = ("order", "id")
else:
    SessionTariffBenefitInline = None


if SessionTariffPhoto is not None:
    class SessionTariffPhotoInline(admin.TabularInline):
        model = SessionTariffPhoto
        extra = 1
        fields = ("order", "image", "caption")
        ordering = ("order", "id")
else:
    SessionTariffPhotoInline = None


@admin.register(SessionTariff)
class SessionTariffAdmin(admin.ModelAdmin):
    list_display = available_fields(
        SessionTariff, "title", "category", "is_featured", "order"
    )
    list_filter = available_fields(SessionTariff, "category", "is_featured")
    search_fields = available_fields(SessionTariff, "title", "description", "slug")
    ordering = available_fields(SessionTariff, "category", "order", "title") or (
        "title",
    )
    fieldsets = tuple(
        section
        for section in (
            (
                "Основное",
                {
                    "fields": available_fields(
                        SessionTariff,
                        "title",
                        "category",
                        "description",
                        "video_vk_embed_url",
                        "video_file",
                    ),
                },
            ),
            (
                "Публикация",
                {
                    "fields": available_fields(SessionTariff, "is_featured", "order"),
                },
            ),
        )
        if section[1]["fields"]
    )
    inlines = compact_inlines(
        SessionTariffPriceInline,
        SessionTariffBenefitInline,
        SessionTariffPhotoInline,
    )


if TrainingDirectionLocation is not None:
    class TrainingDirectionLocationInline(admin.TabularInline):
        model = TrainingDirectionLocation
        extra = 1
        fields = ("order", "location")
        autocomplete_fields = ("location",)
        ordering = ("order", "id")
        show_change_link = True
else:
    TrainingDirectionLocationInline = None


if TrainingDirectionTariff is not None:
    class TrainingDirectionTariffInline(admin.TabularInline):
        model = TrainingDirectionTariff
        extra = 1
        fields = ("order", "tariff")
        autocomplete_fields = ("tariff",)
        ordering = ("order", "id")
        show_change_link = True
else:
    TrainingDirectionTariffInline = None


if TrainingDirectionPhoto is not None:
    class TrainingDirectionPhotoInline(admin.TabularInline):
        model = TrainingDirectionPhoto
        extra = 1
        fields = ("order", "image", "caption")
        ordering = ("order", "id")
else:
    TrainingDirectionPhotoInline = None


class TrainingDirectionAdminForm(forms.ModelForm):
    class Meta:
        model = TrainingDirection
        fields = "__all__"
        help_texts = {
            name: text
            for name, text in {
                "benefits": "Указывайте по одному пункту с новой строки.",
                "first_session_details": "Указывайте по одному пункту с новой строки.",
            }.items()
            if name in TRAINING_DIRECTION_FIELDS
        }
        widgets = {
            name: forms.Textarea(attrs={"rows": 6})
            for name in ("benefits", "first_session_details")
            if name in TRAINING_DIRECTION_FIELDS
        }


@admin.register(TrainingDirection)
class TrainingDirectionAdmin(admin.ModelAdmin):
    form = TrainingDirectionAdminForm
    list_display = available_fields(
        TrainingDirection, "title", "slug", "is_active", "order", "icon"
    )
    list_editable = available_fields(TrainingDirection, "is_active", "order")
    search_fields = ("title",)
    ordering = available_fields(TrainingDirection, "order", "title") or ("title",)
    fieldsets = tuple(
        section
        for section in (
            (
                "Основное",
                {
                    "fields": available_fields(TrainingDirection, "title", "slug", "icon"),
                },
            ),
            (
                "Контент",
                {
                    "fields": available_fields(
                        TrainingDirection,
                        "description",
                        "benefits",
                        "first_session_details",
                    ),
                },
            ),
            (
                "Публикация",
                {
                    "fields": available_fields(TrainingDirection, "is_active", "order"),
                },
            ),
        )
        if section[1]["fields"]
    )
    inlines = compact_inlines(
        TrainingDirectionLocationInline,
        TrainingDirectionTariffInline,
        TrainingDirectionPhotoInline,
    )


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
    change_form_template = "admin/trainings/trainingsession/change_form.html"
    change_list_template = "admin/trainings/trainingsession/change_list.html"
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

    def get_urls(self):
        opts = self.model._meta
        custom_urls = [
            path(
                "copy-previous-week/",
                self.admin_site.admin_view(self.copy_previous_week_view),
                name=f"{opts.app_label}_{opts.model_name}_copy_previous_week",
            )
        ]
        return custom_urls + super().get_urls()

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context.update(
            {
                "copy_previous_week_url": self._copy_previous_week_url(),
                "copy_previous_week_target_date": timezone.localdate().isoformat(),
            }
        )
        return super().changelist_view(request, extra_context=extra_context)

    def render_change_form(
        self, request, context, add=False, change=False, form_url="", obj=None
    ):
        context.update(
            {
                "copy_previous_week_url": self._copy_previous_week_url(),
                "copy_previous_week_next": request.get_full_path(),
            }
        )
        return super().render_change_form(
            request,
            context,
            add=add,
            change=change,
            form_url=form_url,
            obj=obj,
        )

    def copy_previous_week_view(self, request):
        if not self.has_add_permission(request):
            self.message_user(
                request,
                "Недостаточно прав для копирования расписания.",
                level=messages.ERROR,
            )
            return HttpResponseRedirect(self._changelist_url())

        target_date = self._target_date_from_request(request)
        if request.method == "POST":
            if target_date is None:
                self.message_user(
                    request,
                    "Укажите дату недели, в которую нужно скопировать прошлую неделю.",
                    level=messages.ERROR,
                )
                return HttpResponseRedirect(
                    self._safe_redirect_url(
                        request, fallback=self._copy_previous_week_url()
                    )
                )

            result = copy_previous_week_schedule(target_date)
            if result.copied_sessions_count == 0:
                self.message_user(
                    request,
                    (
                        "В неделе "
                        f"{self._format_week(result.source_week_start, result.source_week_end)} "
                        "нет занятий для копирования."
                    ),
                    level=messages.WARNING,
                )
            else:
                self.message_user(
                    request,
                    (
                        "Скопирована неделя "
                        f"{self._format_week(result.source_week_start, result.source_week_end)} "
                        f"в {self._format_week(result.target_week_start, result.target_week_end)}. "
                        f"Создано занятий: {result.copied_sessions_count}. "
                        f"Удалено пересекающихся занятий: {result.replaced_sessions_count}."
                    ),
                    level=messages.SUCCESS,
                )
            return HttpResponseRedirect(
                self._safe_redirect_url(request, fallback=self._changelist_url())
            )

        preview_date = target_date or timezone.localdate()
        target_week_start, target_week_end = week_bounds(preview_date)
        source_week_start = target_week_start - timedelta(days=7)
        source_week_end = target_week_end - timedelta(days=7)

        context = {
            **self.admin_site.each_context(request),
            "opts": self.model._meta,
            "title": "Копировать прошлую неделю",
            "target_date_value": (
                target_date.isoformat()
                if target_date is not None
                else preview_date.isoformat()
            ),
            "target_week_label": self._format_week(target_week_start, target_week_end),
            "source_week_label": self._format_week(source_week_start, source_week_end),
            "copy_previous_week_url": self._copy_previous_week_url(),
            "changelist_url": self._changelist_url(),
            "next_url": self._safe_redirect_url(
                request, fallback=self._changelist_url()
            ),
        }
        return TemplateResponse(
            request,
            "admin/trainings/trainingsession/copy_previous_week.html",
            context,
        )

    def _copy_previous_week_url(self) -> str:
        opts = self.model._meta
        return reverse(
            f"admin:{opts.app_label}_{opts.model_name}_copy_previous_week",
            current_app=self.admin_site.name,
        )

    def _changelist_url(self) -> str:
        opts = self.model._meta
        return reverse(
            f"admin:{opts.app_label}_{opts.model_name}_changelist",
            current_app=self.admin_site.name,
        )

    def _target_date_from_request(self, request) -> date | None:
        target_date_raw = (
            request.POST.get("target_date") or request.GET.get("target_date") or ""
        ).strip()
        if not target_date_raw:
            return None
        try:
            return date.fromisoformat(target_date_raw)
        except ValueError:
            return None

    def _safe_redirect_url(self, request, fallback: str) -> str:
        redirect_url = request.POST.get("next") or request.GET.get("next") or fallback
        if url_has_allowed_host_and_scheme(
            redirect_url,
            allowed_hosts={request.get_host()},
            require_https=request.is_secure(),
        ):
            return redirect_url
        return fallback

    def _format_week(self, week_start: date, week_end: date) -> str:
        return f"{week_start.strftime('%d.%m.%Y')} - {week_end.strftime('%d.%m.%Y')}"


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
