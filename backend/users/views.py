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


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        old_password = request.data.get('old_password', '')
        new_password = request.data.get('new_password', '')
        confirm_password = request.data.get('confirm_password', '')

        if not request.user.check_password(old_password):
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response({"error": "New password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)
        if old_password == new_password:
            return Response({"error": "New password must differ from the current one."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.set_password(new_password)
        request.user.save()
        return Response({"message": "Password changed successfully."})


class ChangeEmailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        new_email = request.data.get('new_email', '').lower().strip()
        password = request.data.get('password', '')

        if not new_email:
            return Response({"error": "New email is required."}, status=status.HTTP_400_BAD_REQUEST)
        if not request.user.check_password(password):
            return Response({"error": "Password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
        if new_email == request.user.email:
            return Response({"error": "This is already your current email."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=new_email).exists():
            return Response({"error": "This email is already in use."}, status=status.HTTP_400_BAD_REQUEST)

        request.user.email = new_email
        request.user.save()
        return Response({"message": "Email changed successfully."})


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