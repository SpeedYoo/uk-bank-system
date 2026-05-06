from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Account
from .serializers import AccountSerializer

class MyAccountDetailView(generics.RetrieveAPIView):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated] 

    def get_object(self):
    
        return Account.objects.get(customer__user=self.request.user)