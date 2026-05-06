from django.urls import path
from .views import SetupProfileView, ProfileStatusView

urlpatterns = [
    path('setup/', SetupProfileView.as_view(), name='setup-profile'),
    path('setup/status/', ProfileStatusView.as_view(), name='setup-status'),
]