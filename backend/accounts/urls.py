from django.urls import path
from .views import MyAccountsListView, AccountDepositView, CreateJuniorAccountView

urlpatterns = [
    path('accounts/', MyAccountsListView.as_view(), name='my-account'),
    path('accounts/deposit/', AccountDepositView.as_view(), name='account-deposit'),
    path('accounts/junior/', CreateJuniorAccountView.as_view(), name='create-junior-account'),
]