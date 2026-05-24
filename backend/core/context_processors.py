from django.conf import settings


def frontend_url(request):
    return {'frontend_url': settings.FRONTEND_URL}
