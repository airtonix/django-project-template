from django.conf.urls import patterns, include

from surlex.dj import surl
from ..views import public


urlpatterns = patterns('',
                       surl(r'^admin/',             include('base.urls.admin')),
                       surl(r'^contact/',           include('base.urls.contact', namespace="contact")),
                       surl(r'^',                   include('account.urls')),
                       surl(r'^',                   include('waitinglist.urls')),
                       surl(r'^',                   include("base.urls.static")),
                       surl(r'^<url=.+>$',          public.FlatPageDetailView.as_view(), name='page'),
                       surl(r'^$',                  public.HomePageView.as_view(), name='home'),
                       )
