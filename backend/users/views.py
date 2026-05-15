from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, CustomLoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from customers.models import Customer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomLoginSerializer


class CreateJuniorUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        customer_id = request.data.get('customer_id')
        email = request.data.get('email', '').lower().strip()
        password = request.data.get('password', '')

        if not customer_id or not email or not password:
            return Response({"error": "customer_id, email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if len(password) < 8:
            return Response({"error": "Password must be at least 8 characters long."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            junior_customer = Customer.objects.get(
                id=customer_id,
                parent_customer=request.user.customer
            )
        except Customer.DoesNotExist:
            return Response({"error": "Junior customer not found or unauthorized."}, status=status.HTTP_404_NOT_FOUND)

        if junior_customer.user is not None:
            return Response({"error": "This junior account already has login credentials."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "This email is already in use."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(email=email, password=password, role='JUNIOR')
        junior_customer.user = user
        junior_customer.save()

        return Response({"message": "Junior login credentials created successfully."}, status=status.HTTP_201_CREATED)