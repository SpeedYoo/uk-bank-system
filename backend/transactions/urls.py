from django.urls import path
from .views import AccountTransactionListView

urlpatterns = [
    path('accounts/<int:account_id>/transactions/', AccountTransactionListView.as_view(), name='account-transactions'),
]
