import logging

from django.template import Library

from classytags import arguments
from classytags.core import Options
from classytags.helpers import InclusionTag

from ..models import ExtendedFlatPage


log = logging.getLogger(__name__)
register = Library()


@register.tag
class MpttPageMenuTag(InclusionTag):
    name = "page_menu"
    template = "partials/menu.html"
    options = Options(
        arguments.MultiKeywordArgument('kwargs', resolve=True, required=True),
        'as',
        arguments.Argument('variable', resolve=False, required=False)
    )

    def get_context(self, context, kwargs=None, variable=None):
        page = kwargs.get("page")
        pageSlug = kwargs.get("page-slug")
        template = kwargs.get("template")
        if template:
            self.template = template
        children = None
        output = {}

        if not isinstance(page, ExtendedFlatPage):
            if not page is None and isinstance(page, (str, int)):
                page = ExtendedFlatPage.objects.get(pk=page)
            elif pageSlug:
                page = ExtendedFlatPage.objects.get(slug=pageSlug)

        if not page or not isinstance(page, ExtendedFlatPage):
            return ""

        children = page.children.filter(registration_required=False,
                                        status=page.ACTIVE_STATUS)

        if not variable:
            variable = 'children'

        output.update(kwargs)
        output[variable] = children

        return output


@register.filter
def viewname(view):
    return view.__class__.__name__
