import random
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Account
from customers.models import Customer
from limits.models import AccountLimits

def generate_account_number():
    return "".join([str(random.randint(0, 9)) for _ in range(8)])

@receiver(post_save, sender=Customer)
def create_bank_account(sender, instance, created, **kwargs):
    if created:
        acc_num = generate_account_number()
        sort_code = "102030"

        is_junior = instance.parent_customer is not None
        acc_type = "JUNIOR" if is_junior else "CURRENT"
        
       
        account = Account.objects.create(
            customer=instance,
            account_number=acc_num,
            sort_code=sort_code,
            iban=f"GB89LYOB{sort_code}{acc_num}", 
            account_type=acc_type,
            currency="GBP",
            status="ACTIVE"
        )

        limits_data = AccountLimits.defaults_for(acc_type)

        for channel, limits in limits_data.items():
            AccountLimits.objects.create(
                account=account,
                channel=channel,
                per_transaction_limit=limits["per_transaction_limit"],
                daily_limit=limits["daily_limit"]
            )