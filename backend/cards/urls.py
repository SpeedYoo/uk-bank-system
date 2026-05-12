from django.urls import path
from .views import CreateCardView, CardManageView, TopUpPrepaidView

urlpatterns = [
    path('cards/create/', CreateCardView.as_view(), name='create-card'),
    path('cards/manage/', CardManageView.as_view(), name='manage-card'),
    path('cards/topup/', TopUpPrepaidView.as_view(), name='topup-card'),
]