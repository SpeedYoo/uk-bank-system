from rest_framework import serializers
from .models import Account
from decimal import Decimal
from limits.models import AccountLimits

class AccountSerializer(serializers.ModelSerializer):

    owner_first_name = serializers.CharField(source='customer.first_name', read_only=True)

    limits = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'account_number', 'sort_code', 'iban', 'currency', 'balance', 'account_type',  'available_balance', 'status', 'owner_first_name', 'limits']

    def get_limits(self, obj):
        return {
            limit.channel: {
                "per_transaction_limit": limit.per_transaction_limit,
                "daily_limit": limit.daily_limit
            }
            for limit in obj.limits.all()
        }

class DepositSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        min_value=Decimal('1.00')
    )  

