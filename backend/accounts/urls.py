from django.urls import path
from .views import MyAccountsListView

urlpatterns = [
    path('accounts/', MyAccountsListView.as_view(), name='my-account'),
]