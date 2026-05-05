import uuid
from django.db import models


class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    account = models.ForeignKey(
        'accounts.Account',
        on_delete=models.PROTECT,
        related_name='transactions'
    )

    type = models.CharField(max_length=50)

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default='GBP')

    balance_after = models.DecimalField(max_digits=12, decimal_places=2)

    reference = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=30, default='PENDING')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.amount} {self.currency}"