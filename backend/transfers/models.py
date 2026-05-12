from django.db import models
from django.conf import settings
from accounts.models import Account 

class Transfer(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]
    
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    from_account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='transfers_sent')
    
    recipient_name = models.CharField(max_length=255)
    recipient_account = models.CharField(max_length=34) 
    swift_bic = models.CharField(max_length=11, null=True, blank=True)
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    title = models.CharField(max_length=255)
    
    routing_method = models.CharField(max_length=10) 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Transfer {self.id} to {self.recipient_account}"