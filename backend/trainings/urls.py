from django.urls import path
from .views import schedule_view  # или ScheduleAPIView.as_view()

urlpatterns = [
    path("schedule/", schedule_view, name="schedule_view"),
]
