from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, CustomLoginSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomLoginSerializer