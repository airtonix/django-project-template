from django.conf import settings
from django.conf.urls.defaults import patterns, include, url

import os
import posixpath
try:
    from urllib.parse import unquote
except ImportError:     # Python 2
    from urllib import unquote

from django.http import Http404
from django.views import static

from django.contrib.staticfiles import finders
from manifesto.views import ManifestView
from django.views.generic import TemplateView


urlpatterns = patterns('',
                       url(r'^manifest\.appcache$',
                           ManifestView.as_view(), name="cache_manifest"),
                       url(r'^', include('favicon.urls')),
                       url(r'^offline\.html$', TemplateView.as_view(
                           template_name="manifesto/offline.html")),
                       )

serve_static = getattr(settings, 'SERVE_STATIC', None)
media_root = getattr(settings, 'MEDIA_ROOT', None)
media_url = getattr(settings, 'MEDIA_URL', None)
static_root = getattr(settings, 'STATIC_ROOT', None)
static_url = getattr(settings, 'STATIC_URL', None)


def serve(request, path, document_root=None, **kwargs):
    normalized_path = posixpath.normpath(unquote(path)).lstrip('/')
    absolute_path = finders.find(normalized_path)
    if not absolute_path:
        if path.endswith('/') or path == '':
            raise Http404("Directory indexes are not allowed here.")
        raise Http404("'%s' could not be found" % path)
    document_root, path = os.path.split(absolute_path)
    return static.serve(request, path, document_root=document_root, **kwargs)


if serve_static and media_root and media_url and static_root and static_url:
    if media_url[0] == "/":
        media_url = media_url[1:]
    if static_url[0] == "/":
        static_url = static_url[1:]

    path_template = r'^{}(?P<path>.*)/?$'
    media_pattern = path_template.format(media_url)
    static_pattern = path_template.format(static_url)

    urlpatterns += patterns('',
                            url(media_pattern,
                                serve, {
                                'document_root': media_root,
                                'show_indexes': True
                                }),
                            url(static_pattern,
                                serve, {
                                'document_root': static_root,
                                'show_indexes': True
                                }),
                            )
