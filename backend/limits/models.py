from decimal import Decimal
from django.db import models

class PaymentChannel(models.TextChoices):
    CARD = "CARD", "Card"
    BLIK = "BLIK", "Blik"
    TRANSFER = "TRANSFER", "Transfer"

class AccountLimits(models.Model):
    account = models.ForeignKey(
        'accounts.Account',
        on_delete=models.CASCADE,
        related_name='limits'  
    )
    
    channel = models.CharField(max_length=20, choices=PaymentChannel.choices)
    
    per_transaction_limit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    daily_limit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        
        unique_together = ('account', 'channel')

    @staticmethod
    def defaults_for(account_type):
        if account_type == "JUNIOR":
            return {
                PaymentChannel.CARD: {
                    "per_transaction_limit": Decimal("20.00"),
                    "daily_limit": Decimal("50.00"),
                },
                PaymentChannel.BLIK: {
                    "per_transaction_limit": Decimal("0.00"),
                    "daily_limit": Decimal("0.00"),
                },
                PaymentChannel.TRANSFER: {
                    "per_transaction_limit": Decimal("0.00"),
                    "daily_limit": Decimal("0.00"),
                },
            }

        # Domyślne dla konta MAIN/CURRENT
        return {
            PaymentChannel.CARD: {
                "per_transaction_limit": Decimal("1000.00"),
                "daily_limit": Decimal("2000.00"),
            },
            PaymentChannel.BLIK: {
                "per_transaction_limit": Decimal("500.00"),
                "daily_limit": Decimal("1000.00"),
            },
            PaymentChannel.TRANSFER: {
                "per_transaction_limit": Decimal("5000.00"),
                "daily_limit": Decimal("10000.00"),
            },
        }

    def __str__(self):
        return f"{self.account.account_number} - {self.channel}"