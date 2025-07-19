from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import ContactLink

@admin.register(ContactLink)
class ContactLinkAdmin(admin.ModelAdmin):
    list_display = ('instagram', 'telegram', 'website', 'phone')
