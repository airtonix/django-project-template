from django.conf.urls.defaults import patterns, url, include
from django.contrib import admin
import gargoyle
import nexus
from .. import switches


gargoyle.autodiscover()
admin.autodiscover()
nexus.autodiscover()


urlpatterns = patterns('',
                       (r'^themes/',            include('themes.urls')),
                       (r'^doc/',               include('django.contrib.admindocs.urls')),
                       # (r'^',                   include(nexus.site.urls)),
                       (r'^',                   include(admin.site.urls)),
                       )
