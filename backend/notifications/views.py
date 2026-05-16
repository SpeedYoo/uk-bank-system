from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification

class NotificationListView(APIView):
    """GET /api/notifications/ — returns all notifications, unread first."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifs = Notification.objects.filter(user=request.user).order_by('read', '-created_at')
        data = [
            {
                'id': n.id,
                'title': n.title,
                'body': n.body,
                'read': n.read,
                'created_at': n.created_at.isoformat(),
            }
            for n in notifs
        ]
        return Response(data)


class NotificationMarkReadView(APIView):
    """PATCH /api/notifications/{id}/read/"""
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            n = Notification.objects.get(pk=pk, user=request.user)
            n.read = True
            n.save()
            return Response({'status': 'ok'})
        except Notification.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


class NotificationMarkAllReadView(APIView):
    """PATCH /api/notifications/read-all/"""
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'status': 'ok'})
