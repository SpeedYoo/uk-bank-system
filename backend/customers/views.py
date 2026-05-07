from rest_framework import generics, permissions
from .models import Customer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .serializers import CustomerSerializer
from rest_framework.views import APIView
from django.shortcuts import render, get_object_or_404


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

class CurrentCustomerView(generics.RetrieveAPIView):
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        
        return get_object_or_404(Customer, user=self.request.user)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist() 
            return Response({"message": "Successfully logged out"}, status=205)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=400)