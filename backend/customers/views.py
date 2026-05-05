from rest_framework import generics, permissions
from .models import Customer
from .serializers import CustomerSerializer

class SetupProfileView(generics.CreateAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)