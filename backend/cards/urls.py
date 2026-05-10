from django.urls import path
from .views import CreateCardView, CardManageView

urlpatterns = [
    path('cards/create/', CreateCardView.as_view(), name='create-card'),
    path('cards/manage/', CardManageView.as_view(), name='manage-card'),
]