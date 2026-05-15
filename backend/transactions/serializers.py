from rest_framework import serializers
from .models import Transaction

class TransactionSerializer(serializers.ModelSerializer):
    type = serializers.SerializerMethodField()
    account_number = serializers.CharField(source='account.account_number', read_only=True)
    recipient_name = serializers.SerializerMethodField()
    recipient_account = serializers.SerializerMethodField()
    routing_method = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = [
            'id', 'title', 'amount', 'balance_after', 'created_at', 'type',
            'account_number', 'recipient_name', 'recipient_account', 'routing_method'
        ]

    def get_type(self, obj):
        return 'CREDIT' if obj.amount > 0 else 'DEBIT'

    def get_recipient_name(self, obj):
        return obj.transfer.recipient_name if obj.transfer else None

    def get_recipient_account(self, obj):
        return obj.transfer.recipient_account if obj.transfer else None

    def get_routing_method(self, obj):
        return obj.transfer.routing_method if obj.transfer else None
