import calendar
import logging
import operator

from django.conf import settings
from django.template import RequestContext, Library, loader as template_loader, TemplateDoesNotExist, defaultfilters
from django.contrib.sites.models import Site
from django.core.exceptions import ImproperlyConfigured
from django.utils.safestring import mark_safe

from classytags.core import Options, Tag
from classytags.arguments import Argument, MultiKeywordArgument, IntegerArgument
from classytags.helpers import AsTag, InclusionTag

from fiber.templatetags.fiber_tags import show_menu

from ..lib.loader import load_class

logger = logging.getLogger(__name__)
register = Library()


@register.tag
class FiberContentItemClassNames(Tag):
    name = 'fibermenu_item_classes'
    options = Options(
        Argument('node', resolve=True, required=True),
        Argument('editor_mode', resolve=True, required=False),
    )

    def render_tag(self, context, node=None, editor_mode=False):
        if not node:
            return ""

        try:
            output = []
            output.append("fiberpage-{}".format(defaultfilters.slugify(node.title)))
            if node in context.get('fiber_current_pages', []):
                output.append("current")

            if node.is_first_child():
                output.append("first")

            if node.is_last_child():
                output.append("last")

            if editor_mode:
                if not node.show_in_menu:
                    output.append("hidden-in-menu")

                if not node.is_public:
                    output.append("non-public")

                if node.redirect_page:
                    output.append("redirect")

            return " ".join(output)

        except Exception as error:
            return error


@register.tag
class FiberMenu(InclusionTag):
    name = 'fibermenu'
    options = Options(
        Argument('menu_name', resolve=True, required=False, default="mainmenu"),
        Argument('min_level', resolve=True, required=False, default=1),
        Argument('max_level', resolve=True, required=False),
        Argument('expand', resolve=True, required=False, default=False),
        'with',
        MultiKeywordArgument('kwargs', resolve=True, required=False),
    )
    template = "fiber/menu.html"

    def get_context(self, context, menu_name, min_level, max_level=None, expand=None, kwargs=None):
        our_context = RequestContext(context, {
            "menu_name": menu_name,
            "start": min_level,
            "end": max_level,
            "expand": expand,
        })
        our_context.update(kwargs)
        our_context.update(show_menu(context, menu_name, min_level, max_level, expand))
        return our_context


