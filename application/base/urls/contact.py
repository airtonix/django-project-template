from django.conf.urls.defaults import patterns, url

from ..views import contact


urlpatterns = patterns('',
                       url(r'^$',         contact.ContactFormView.as_view(), name="form"),
                       url(r'^thanks/$',   contact.MessageSentView.as_view(), name="thanks"),
                       )
