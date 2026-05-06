from rest_framework import serializers
from .models import Account

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'account_number', 'sort_code', 'iban', 'currency', 'balance', 'available_balance', 'status']