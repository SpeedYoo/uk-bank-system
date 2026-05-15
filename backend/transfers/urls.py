from django.urls import path
from .views import OwnTransferView, NationalTransferView, TransferListView, SavedRecipientView, SavedRecipientDeleteView

urlpatterns = [
    path('transfers/', TransferListView.as_view(), name='transfer-list'),
    path('transfers/own/', OwnTransferView.as_view(), name='transfer-own'),
    path('transfers/national/', NationalTransferView.as_view(), name='transfer-national'),
    path('recipients/', SavedRecipientView.as_view(), name='recipients'),
    path('recipients/<int:pk>/', SavedRecipientDeleteView.as_view(), name='recipient-delete'),
]
