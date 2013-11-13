import os

# from django.conf import settings
from django.views.generic import DetailView
from django.template.defaultfilters import slugify
from django.core import exceptions
from django.template.loader import get_template
from django.http import Http404

from ..models import ExtendedFlatPage


class FlatPageMixin(object):

    """
    Retrieves the FlatPage object for the specified url, and includes it in the
    context.

    If no url is specified, request.path is used.
    """

    def get_template_names(self):
        templates = []
        page = self.object
        url = self.kwargs.setdefault('url', getattr(self, 'url', '/'))

        def add(path):
            templates.append(path)
            templates.append(prefix(path, 'pages'))
            templates.append(prefix(path, 'flatpages'))

        def prefix(path, prefix='flatpages'):
            if not path.startswith(prefix):
                return os.path.sep.join([prefix, path])
            return path

        # if the page specifies a template name, add that.
        if page and page.template_name:
            add(page.template_name)

        # add the page slug as a possible template name
        if page and page.slug:
            add(page.slug + ".html")

        # if the view specifies a template name, add that
        if self.template_name:
            add(self.template_name)

        # finally, add the url path as a possible template
        add(url.rstrip("/") + ".html")

        return templates

    def get_object(self, **kwargs):
        # site_id = getattr(settings, "SITE_ID")
        url = self.kwargs.setdefault('url', getattr(self, 'url', '/'))
        url = url.replace("../", "")
        url = self.model.fqnify(url)
        page = None

        try:
            page = self.model.objects.get(url__exact=url)

        except self.model.DoesNotExist:
            if not get_template("pages" + url.rstrip("/") + ".html"):
                raise Http404

        return page

    def get_context_data(self, **kwargs):
        context = super(FlatPageMixin, self).get_context_data(**kwargs)
        flatpage = self.object

        if hasattr(flatpage, 'extendedflatpage'):
            flatpage = flatpage.extendedflatpage

        context.update({
            'Page': flatpage,
        })
        return context


class FlatPageDetailView(FlatPageMixin, DetailView):
    model = ExtendedFlatPage


class HomePageView(FlatPageDetailView):
    model = ExtendedFlatPage
    url = "/"

    # def get_context_data(self, **kwargs):
    #     context = super(HomePageView, self).get_context_data(**kwargs)
    #     return context
