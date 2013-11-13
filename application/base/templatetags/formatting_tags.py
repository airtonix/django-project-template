import calendar
import logging
import operator
import re

from django.conf import settings
from django.template import Library, loader as template_loader, TemplateDoesNotExist
from django.contrib.sites.models import Site
from django.core.exceptions import ImproperlyConfigured
from django.utils.safestring import mark_safe

from classytags.core import Options, Tag
from classytags.arguments import Argument, MultiKeywordArgument, IntegerArgument
from classytags.helpers import AsTag, InclusionTag

from ..lib.loader import load_class

logger = logging.getLogger(__name__)
register = Library()

@register.tag
class IncludeWithTag(InclusionTag):
    name = 'include_with'
    template = ''
    options = Options(
        Argument('template', resolve=True, required=True),
        'with',
        MultiKeywordArgument('kwargs', resolve=True, required=False),
        'as',
        Argument('variable', resolve=False, required=False),
        blocks = [
            ('end{0}'.format(name), 'nodelist'),
        ],
    )

    def get_template(self, context, template, **kwargs):
        """
        Returns the template to be used for the current context and arguments.
        """
        return template or self.template

    def get_context(self, context, template, kwargs=None, variable=None, nodelist=None):
        context.update(kwargs)
        context_variable = variable if variable else 'content'
        context.update({
            context_variable: nodelist.render(context),
        })
        return context


@register.tag
class RenderMenuTag(Tag):
    name = 'include_menus'
    options = Options(
        Argument('slug', resolve=True, required=True),
        'as',
        Argument('variable', resolve=False, required=False),
    )

    def get_template(self, context, template, *args, **kwargs):
        template = template_loader.get_template(template)
        output = template.render(context)
        return output

    def render_tag(self, context, slug=None):
        return ""


@register.filter
def un_camelcase(value, replacement=None):
    replacement = replacement if replacement else u" "

    def camelToUnderscore(match):
        return replacement.join(match.group())

    return re.sub(r"[a-z][A-Z]", camelToUnderscore, value)
