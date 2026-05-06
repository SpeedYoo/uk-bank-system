from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Account
from .serializers import AccountSerializer

class MyAccountsListView(generics.ListAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        return Account.objects.filter(customer__user=self.request.user)

