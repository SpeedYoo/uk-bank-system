from decimal import Decimal
from django.db import models


class AccountLimits(models.Model):
    account = models.OneToOneField(
        'accounts.Account',
        on_delete=models.CASCADE,
        related_name='limits'
    )

    daily_transfer_limit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    daily_card_limit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    daily_blik_limit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    overdraft_limit = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))

    updated_at = models.DateTimeField(auto_now=True)

    @staticmethod
    def defaults_for(account_type):
        if account_type == "JUNIOR":
            return {
                "daily_transfer_limit": Decimal("100.00"),
                "daily_card_limit": Decimal("50.00"),
                "daily_blik_limit": Decimal("30.00"),
                "overdraft_limit": Decimal("0.00"),
            }

        return {
            "daily_transfer_limit": Decimal("5000.00"),
            "daily_card_limit": Decimal("2000.00"),
            "daily_blik_limit": Decimal("1000.00"),
            "overdraft_limit": Decimal("1000.00"),
        }