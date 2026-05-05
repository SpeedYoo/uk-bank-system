from django.urls import path
from .views import SetupProfileView

urlpatterns = [
    path('setup/', SetupProfileView.as_view(), name='setup-profile'),
]