import uuid
from django.db import models
from customers.models import Customer

class Account(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('CURRENT', 'Current Account'),
        ('SAVINGS', 'Savings Account'),
        ('JUNIOR', 'Junior Account'),
    ]
    STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('BLOCKED', 'Blocked'),
        ('CLOSED', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='accounts')
    account_number = models.CharField(max_length=8, unique=True)
    sort_code = models.CharField(max_length=6)
    iban = models.CharField(max_length=34, unique=True)
    currency = models.CharField(max_length=3, default='GBP')
    
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    available_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    overdraft_limit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    account_type = models.CharField(max_length=20, choices=ACCOUNT_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sort_code} {self.account_number}"