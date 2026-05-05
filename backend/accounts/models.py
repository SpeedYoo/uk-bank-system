import uuid
from decimal import Decimal
from django.db import models


class Account(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    customer = models.ForeignKey(
        'customers.Customer',
        on_delete=models.CASCADE,
        related_name='accounts'
    )

    account_number = models.CharField(max_length=8, unique=True)
    sort_code = models.CharField(max_length=6)
    iban = models.CharField(max_length=34, unique=True)

    currency = models.CharField(max_length=3, default="GBP")

    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00")
    )

    available_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00")
    )

    account_type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, default="ACTIVE")

    overdraft_limit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00")
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sort_code} {self.account_number}"