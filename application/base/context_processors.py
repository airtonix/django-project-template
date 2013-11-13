from django.conf import settings
from django.contrib.sites.models import Site, RequestSite


def site(request):
    domain = None

    if Site._meta.installed:
        site = Site.objects.get_current()

    else:
        site = RequestSite(request)

    return { 'Site' : site }


def django_settings(request):
    return { 'Settings' : settings }

