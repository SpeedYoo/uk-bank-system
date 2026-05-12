from django.db import models
from django.conf import settings

class Transaction(models.Model):
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
    account = models.ForeignKey('accounts.Account', on_delete=models.CASCADE, related_name='history')
    
    
    transfer = models.ForeignKey('transfers.Transfer', on_delete=models.SET_NULL, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Tx {self.id}: {self.amount} on {self.account.iban}"