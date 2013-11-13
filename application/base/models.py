from django.db import models
from django.contrib.flatpages.models import FlatPage
from django.contrib.sites.models import get_current_site, Site
from django.template.defaultfilters import slugify

from mptt.models import MPTTModel, TreeForeignKey
from django_extensions.db import models as extended_models


class ExtendedFlatPage(MPTTModel, FlatPage, extended_models.ActivatorModel, extended_models.TimeStampedModel):

    class Meta:
        ordering = ['flatpages__url']
        order_with_respect_to = 'parent'
        verbose_name = 'page'
        verbose_name_plural = 'pages'

    class MPTTMeta:
        left_attr = 'mptt_left'
        right_attr = 'mptt_right'
        level_attr = 'mptt_level'
        order_insertion_by = ['title']

    parent = TreeForeignKey('self', null=True, blank=True, related_name='children',
                            help_text="Hierarchical parent page (if any)")

    slug = models.SlugField(blank=True, null=True)

    def __unicode__(self):
        return self.url

    @staticmethod
    def fqnify(url):
        if not url:
            return

        if not url.endswith("/"):
            url += "/"

        if not url.startswith("/"):
            url = "/" + url

        return url

    def save(self, *args, **kwargs):

        # create a slug if it doesn't alreay have one
        if not self.slug:
            self.slug = slugify(self.title)

        existing_pages = self.get_siblings().filter(slug=self.slug).count()

        if existing_pages > 0:
            self.slug = "-".join([self.slug, existing_pages])

        # now create a URL based on parent's url + slug
        if self.parent:
            segments = []
            if not self.parent.parent is None and not self.parent.url is "/" :
                segments.append(self.parent.url.rstrip('\/'))

            segments.append(self.slug)

            self.url = self.fqnify('/'.join(segments))

        super(ExtendedFlatPage, self).save(*args, **kwargs)
