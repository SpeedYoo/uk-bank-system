from django.db import models
from django.conf import settings

class Customer(models.Model):
   
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='customer_profile')
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    phone = models.CharField(max_length=20)
    country = models.CharField(max_length=50)
    customer_type = models.CharField(max_length=20) 
    
    
    parent_customer = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='juniors')
    
    kyc_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"