from django.urls import path
from .views import SetupProfileView, ProfileStatusView, CurrentCustomerView, LogoutView

urlpatterns = [
    path('setup/', SetupProfileView.as_view(), name='setup-profile'),
    path('setup/status/', ProfileStatusView.as_view(), name='setup-status'),
    path('me/', CurrentCustomerView.as_view(), name='current-customer'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
]