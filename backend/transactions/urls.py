from django.urls import path
from .views import AccountTransactionListView, AnalyticsSummaryView

urlpatterns = [
    path('accounts/<uuid:account_id>/transactions/', AccountTransactionListView.as_view(), name='account-transactions'),
    path('analytics/summary/', AnalyticsSummaryView.as_view(), name='analytics-summary'),
]
