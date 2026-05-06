from django.urls import path
from .views import MyAccountDetailView

urlpatterns = [
    path('accounts/', MyAccountDetailView.as_view(), name='my-account'),
]