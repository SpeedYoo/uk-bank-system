from rest_framework import serializers
from .models import Card

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = [
            'id', 'card_type', 'masked_number', 'full_number', 
            'expiry_date', 'cardholder_name', 'status', 
            'cvv', 'pin', 'prepaid_balance'
        ]