from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = ['id', 'title', 'amount', 'balance_after', 'created_at', 'type']

    def get_type(self, obj):
        return 'CREDIT' if obj.amount > 0 else 'DEBIT'
