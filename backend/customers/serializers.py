import re
from datetime import date
from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', min_length=2, max_length=50)
    lastName = serializers.CharField(source='last_name', min_length=2, max_length=50)
    dob = serializers.DateField(source='date_of_birth')
    email = serializers.SerializerMethodField()

    def get_email(self, obj):
        return obj.user.email if obj.user else None

    class Meta:
        model = Customer
        fields = [
            'firstName', 'lastName', 'email', 'dob', 'phone',
            'country', 'city', 'postcode', 'street'
        ]

    def validate_firstName(self, value):
        if not value.isalpha():
            raise serializers.ValidationError("First name should only contain letters")
        return value.title()

    def validate_lastName(self, value):
        if not re.match(r'^[A-Za-zżźćńółęąśŻŹĆŃÓŁĘĄŚ\s-]+$', value):
            raise serializers.ValidationError("Last name contains invalid characters")
        return value.title()

    def validate_dob(self, value):
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old")
        if age > 120:
            raise serializers.ValidationError("Please enter a valid date of birth")
        return value

    def validate_phone(self, value):
        clean_phone = re.sub(r'\D', '', value)
        if not (9 <= len(clean_phone) <= 15):
            raise serializers.ValidationError("Phone number must be between 9 and 15 digits")
        return clean_phone

    def validate_postcode(self, value):
        if not re.match(r'^\d{2}-\d{3}$', value):
            raise serializers.ValidationError("Invalid postcode format. Use XX-XXX")
        return value

    def validate_city(self, value):
        if len(value) < 2:
            raise serializers.ValidationError("City name is too short")
        return value.strip()

    def validate_street(self, value):
        if len(value) < 5:
            raise serializers.ValidationError("Street address is too short")
        return value.strip()

    def update(self, instance, validated_data):

        instance.kyc_verified = True
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        instance.save()
        return instance