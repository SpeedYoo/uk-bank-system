from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomLoginSerializer(TokenObtainPairSerializer):
    
    default_error_messages = {
        'no_active_account': 'Invalid email or password. Please try again.'
    }

    def validate(self, attrs):
        data = super().validate(attrs)

        data['email'] = self.user.email
        
        return data

class RegisterSerializer(serializers.ModelSerializer):

    agree_terms = serializers.BooleanField(write_only=True)

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        error_messages={
            "min_length": "Password must be at least 8 characters long."
        }
    )

    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ('email', 'password', 'agree_terms')

    def validate_agree_terms(self, value):
        if not value:
            raise serializers.ValidationError(
                "You must accept the terms and conditions."
            )
        return value

    def validate_email(self, value):
        value = value.lower().strip()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )
        return value

    
    def create(self, validated_data):
        validated_data.pop('agree_terms')
        password = validated_data.pop('password')

        return User.objects.create_user(
            password=password,
            **validated_data
        )