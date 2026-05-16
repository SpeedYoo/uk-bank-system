from django.urls import path
from .views import NotificationListView, NotificationMarkReadView, NotificationMarkAllReadView

urlpatterns = [
    path('notifications/', NotificationListView.as_view(), name='notifications-list'),
    path('notifications/read-all/', NotificationMarkAllReadView.as_view(), name='notifications-read-all'),
    path('notifications/<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-read'),
]
