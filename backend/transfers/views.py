from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from accounts.models import Account
from .models import Transfer, SavedRecipient
from transactions.models import Transaction
from django.db.models import Q
from decimal import Decimal


class TransferPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'


class TransferListView(APIView):
    """GET /api/transfers/ — all outgoing transfers for the authenticated user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Transfer.objects.filter(user=request.user).order_by('-created_at')
        paginator = TransferPagination()
        page = paginator.paginate_queryset(qs, request)
        data = [
            {
                'id': t.id,
                'recipient_name': t.recipient_name,
                'recipient_account': t.recipient_account,
                'from_account_number': t.from_account.account_number,
                'amount': str(t.amount),
                'title': t.title,
                'routing_method': t.routing_method,
                'status': t.status,
                'created_at': t.created_at.isoformat(),
            }
            for t in page
        ]
        return paginator.get_paginated_response(data)


class SavedRecipientView(APIView):
    """GET/POST /api/recipients/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        recipients = SavedRecipient.objects.filter(user=request.user)
        data = [
            {
                'id': r.id,
                'name': r.name,
                'account': r.account,
                'routing_method': r.routing_method,
            }
            for r in recipients
        ]
        return Response(data)

    def post(self, request):
        name = request.data.get('name', '').strip()
        account = request.data.get('account', '').strip().replace(' ', '').upper()
        routing_method = request.data.get('routing_method', 'FPS')

        if not name or not account:
            return Response({'error': 'name and account are required'}, status=400)

        # Avoid exact duplicates for the same user
        if SavedRecipient.objects.filter(user=request.user, account=account).exists():
            return Response({'error': 'This recipient is already saved'}, status=400)

        r = SavedRecipient.objects.create(
            user=request.user, name=name, account=account, routing_method=routing_method
        )
        return Response({'id': r.id, 'name': r.name, 'account': r.account, 'routing_method': r.routing_method}, status=201)


class SavedRecipientDeleteView(APIView):
    """DELETE /api/recipients/{id}/"""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            r = SavedRecipient.objects.get(pk=pk, user=request.user)
            r.delete()
            return Response(status=204)
        except SavedRecipient.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


class OwnTransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        try:
            from_id = data.get('from_account')
            to_id = data.get('to_account')

            try:
                amount = Decimal(str(data.get('amount', '0')))
            except Exception:
                return Response({"error": "Invalid amount format"}, status=400)

            if amount <= 0:
                return Response({"error": "Amount must be greater than zero"}, status=400)

            try:
                source_acc = Account.objects.get(
                    Q(id=from_id) &
                    (Q(customer__user=request.user) | Q(customer__parent_customer__user=request.user))
                )
            except Account.DoesNotExist:
                return Response({"error": f"Source account {from_id} not found or unauthorized"}, status=404)

            try:
                target_acc = Account.objects.get(
                    Q(id=to_id) &
                    (Q(customer__user=request.user) | Q(customer__parent_customer__user=request.user))
                )
            except Account.DoesNotExist:
                return Response({"error": f"Target account {to_id} not found or unauthorized"}, status=404)

            if source_acc.balance < amount:
                return Response({"error": "Insufficient funds"}, status=400)

            if source_acc == target_acc:
                return Response({"error": "Cannot transfer to the same account"}, status=400)

            with transaction.atomic():
                source_acc.balance -= amount
                target_acc.balance += amount
                source_acc.save()
                target_acc.save()

                transfer = Transfer.objects.create(
                    user=request.user,
                    from_account=source_acc,
                    recipient_name=f"Internal: {target_acc.account_type}",
                    recipient_account=target_acc.iban,
                    amount=amount,
                    title="Internal Transfer",
                    routing_method='INTERNAL',
                    status='COMPLETED'
                )

                Transaction.objects.create(
                    user=request.user, account=source_acc, transfer=transfer,
                    amount=-amount, title=f"To {target_acc.account_type}",
                    balance_after=source_acc.balance
                )
                Transaction.objects.create(
                    user=request.user, account=target_acc, transfer=transfer,
                    amount=amount, title=f"From {source_acc.account_type}",
                    balance_after=target_acc.balance
                )

            return Response({"status": "success"}, status=200)

        except Exception as e:
            print(f"CRITICAL ERROR: {str(e)}")
            return Response({"error": str(e)}, status=400)


class NationalTransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data
        try:
            from_id = data.get('from_account')
            recipient_account = data.get('recipient_account', '').replace(' ', '')
            amount = Decimal(str(data.get('amount', '0')))

            source_acc = Account.objects.get(id=from_id, customer__user=request.user)

            if source_acc.account_type == 'JUNIOR':
                return Response({"error": "Junior accounts cannot transfer outside"}, status=403)

            if source_acc.balance < amount:
                return Response({"error": "Insufficient funds"}, status=400)

            target_acc = Account.objects.filter(iban=recipient_account).first()

            if not target_acc:
                return Response({"error": "External banking networks are not yet connected"}, status=400)

            with transaction.atomic():
                transfer = Transfer.objects.create(
                    user=request.user,
                    from_account=source_acc,
                    recipient_name=data.get('recipient_name', 'Lyo User'),
                    recipient_account=recipient_account,
                    amount=amount,
                    title=data.get('title', 'Transfer'),
                    routing_method=data.get('routing_method', 'FPS'),
                    status='COMPLETED'
                )

                source_acc.balance -= amount
                target_acc.balance += amount
                source_acc.save()
                target_acc.save()

                Transaction.objects.create(
                    user=request.user, account=source_acc, transfer=transfer,
                    amount=-amount, title=transfer.title,
                    balance_after=source_acc.balance
                )

                recipient_user = target_acc.customer.user or target_acc.customer.parent_customer.user
                Transaction.objects.create(
                    user=recipient_user, account=target_acc, transfer=transfer,
                    amount=amount, title=transfer.title,
                    balance_after=target_acc.balance
                )

            return Response({"status": "success"}, status=200)

        except Account.DoesNotExist:
            return Response({"error": "Source account not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=400)
