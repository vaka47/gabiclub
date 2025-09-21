from django.urls import path

from .views import ClubProfileView, ContactInfoView, LeadRequestView

urlpatterns = [
    path('contact/', ContactInfoView.as_view(), name='contact-info'),
    path('club/', ClubProfileView.as_view(), name='club-profile'),
    path('lead/', LeadRequestView.as_view(), name='lead-request'),
]
