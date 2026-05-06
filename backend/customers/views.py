from rest_framework import generics, permissions
from .models import Customer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import CustomerSerializer
from rest_framework.views import APIView

class SetupProfileView(generics.UpdateAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_object(self):
        try:
            return Customer.objects.get(user=self.request.user)
        except Customer.DoesNotExist:
            return Customer(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)


class ProfileStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer = Customer.objects.filter(user=request.user).first()
        is_complete = customer.kyc_verified if customer else False
        return Response({'is_setup_complete': is_complete})