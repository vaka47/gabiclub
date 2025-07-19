from django.contrib import admin

# Register your models here.


from django.contrib import admin
from .models import Training

@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'time', 'coach', 'location', 'type')
    list_filter = ('date', 'coach', 'type')
    search_fields = ('title', 'coach', 'location')

from django.contrib import admin
from .models import TrainingSession, Location, TrainingDirection, LevelTag

@admin.register(TrainingSession)
class TrainingSessionAdmin(admin.ModelAdmin):
    list_display = ('date', 'start_time', 'end_time', 'direction', 'coach', 'location')
    list_filter = ('type', 'direction', 'coach', 'location', 'levels')
    search_fields = ('direction__title', 'coach__full_name', 'location__title')
    filter_horizontal = ('levels',)

admin.site.register(Location)
admin.site.register(TrainingDirection)
admin.site.register(LevelTag)


from .models import Coach

@admin.register(Coach)
class CoachAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'instagram', 'get_directions')
    search_fields = ('full_name', 'instagram')
    filter_horizontal = ('directions',)

    def get_directions(self, obj):
        return ", ".join([d.title for d in obj.directions.all()])
    get_directions.short_description = "Направления"
