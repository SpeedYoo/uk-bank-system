from .models import Notification

def notify(user, title, body):
    """Create a notification for a user. Safe to call — never raises."""
    try:
        Notification.objects.create(user=user, title=title, body=body)
    except Exception:
        pass
