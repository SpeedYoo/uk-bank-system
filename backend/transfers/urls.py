from django.urls import path
from .views import OwnTransferView, NationalTransferView

urlpatterns = [
    path('transfers/own/', OwnTransferView.as_view(), name='transfer-own'),
    path('transfers/national/', NationalTransferView.as_view(), name='transfer-national'),
]