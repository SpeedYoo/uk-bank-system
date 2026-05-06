from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Account
from .serializers import AccountSerializer, DepositSerializer
from rest_framework import generics
from rest_framework.views import APIView
from django.db import transaction
from rest_framework import status
from django.shortcuts import render, get_object_or_404
from rest_framework.response import Response


class MyAccountsListView(generics.ListAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        return Account.objects.filter(customer__user=self.request.user)

class AccountDepositView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        account_id = request.data.get('account_id')
        
        if not account_id:
            return Response({"error": "account_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        account = get_object_or_404(
            Account, 
            id=account_id, 
            customer__user=request.user
        )
        
        serializer = DepositSerializer(data=request.data)
        
        if serializer.is_valid():
            amount_to_add = serializer.validated_data['amount']
            
            account.balance += amount_to_add
            account.save()
            
            return Response({
                "message": "Deposit successful",
                "new_balance": str(account.balance)
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)