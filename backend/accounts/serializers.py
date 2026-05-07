from rest_framework import serializers
from .models import Account
from decimal import Decimal

class AccountSerializer(serializers.ModelSerializer):

    owner_first_name = serializers.CharField(source='customer.first_name', read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'account_number', 'sort_code', 'iban', 'currency', 'balance', 'account_type',  'available_balance', 'status', 'owner_first_name']

class DepositSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        min_value=Decimal('1.00')
    )  