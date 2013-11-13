
from django.contrib.sites.models import Site, get_current_site
from django.contrib.sitemaps import Sitemap
from . import models


class PageSitemap(Sitemap):
    changefreq = "never"
    priority = 0.5

    def items(self):
        return models.ExtendedFlatPage.objects.filter(registration_required=False,
                                                      sites__in=get_current_site())

    def lastmod(self, obj):
        return obj.pub_date