from django.urls import path
from .views import (
    OwnTransferView, NationalTransferView, TransferListView,
    SavedRecipientView, SavedRecipientDeleteView,
    JuniorApprovalListView, JuniorMyApprovalsView, JuniorApprovalDecideView,
)

urlpatterns = [
    path('transfers/', TransferListView.as_view(), name='transfer-list'),
    path('transfers/own/', OwnTransferView.as_view(), name='transfer-own'),
    path('transfers/national/', NationalTransferView.as_view(), name='transfer-national'),
    path('recipients/', SavedRecipientView.as_view(), name='recipients'),
    path('recipients/<int:pk>/', SavedRecipientDeleteView.as_view(), name='recipient-delete'),

    # Junior approval flow
    path('junior/approvals/', JuniorApprovalListView.as_view(), name='junior-approvals'),
    path('junior/my-approvals/', JuniorMyApprovalsView.as_view(), name='junior-my-approvals'),
    path('junior/approvals/<int:pk>/decide/', JuniorApprovalDecideView.as_view(), name='junior-approval-decide'),
]
