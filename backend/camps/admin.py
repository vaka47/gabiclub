from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Camp

@admin.register(Camp)
class CampAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'end_date', 'price', 'location')
    list_filter = ('start_date', 'location')
    search_fields = ('title', 'description', 'location')
