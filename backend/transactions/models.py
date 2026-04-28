import uuid
from django.db import models
from accounts.models import Account

class Transaction(models.Model):
    TRANSACTION_TYPE_CHOICES = [
        ('INTERNAL', 'Internal Transfer'),
        ('BACS', 'Bacs Payment'),
        ('FPS', 'Faster Payments'),
        ('CHAPS', 'CHAPS Payment'),
        ('SWIFT', 'SWIFT Payment'),
        ('CARD', 'Card Payment'),
        ('BLIK', 'BLIK / Instant'),
    ]
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REJECTED', 'Rejected'),
        ('PARENT_APPROVAL_REQUIRED', 'Awaiting Parent Approval'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    account = models.ForeignKey(Account, on_delete=models.PROTECT, related_name='transactions')
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='GBP')
    balance_after = models.DecimalField(max_digits=12, decimal_places=2)
    
    reference = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)