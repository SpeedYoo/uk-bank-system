from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from accounts.models import Account
from .models import Transaction
from .serializers import TransactionSerializer

class TransactionPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = 'page_size'
    max_page_size = 50

class AccountTransactionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, account_id):
        user_customer = request.user.customer
        account = get_object_or_404(Account, id=account_id)

        if account.customer != user_customer and account.customer.parent_customer != user_customer:
            return Response({"error": "Unauthorized"}, status=403)

        qs = account.history.all().order_by('-created_at')

        from_date = request.query_params.get('from')
        to_date = request.query_params.get('to')
        tx_type = request.query_params.get('type')

        if from_date:
            qs = qs.filter(created_at__date__gte=from_date)
        if to_date:
            qs = qs.filter(created_at__date__lte=to_date)
        if tx_type == 'CREDIT':
            qs = qs.filter(amount__gt=0)
        elif tx_type == 'DEBIT':
            qs = qs.filter(amount__lt=0)

        paginator = TransactionPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = TransactionSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
