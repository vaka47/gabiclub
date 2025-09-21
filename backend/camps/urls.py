from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CampViewSet

router = DefaultRouter()
router.register(r'', CampViewSet, basename='camps')

urlpatterns = [
    path('', include(router.urls)),
]
