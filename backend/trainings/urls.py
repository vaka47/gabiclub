from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CoachViewSet,
    TrainingMetaView,
    TrainingPlanViewSet,
    TrainingSessionViewSet,
    TrainingSessionSimpleView,
)

router = DefaultRouter()
router.register(r'schedule', TrainingSessionViewSet, basename='schedule')
router.register(r'coaches', CoachViewSet, basename='coaches')
router.register(r'plans', TrainingPlanViewSet, basename='plans')

urlpatterns = [
    path('', include(router.urls)),
    path('meta/', TrainingMetaView.as_view(), name='training-meta'),
    path('schedule-simple/', TrainingSessionSimpleView.as_view(), name='schedule-simple'),
]
