from django import template
from django.template import Template, Variable, TemplateSyntaxError, Library, loader as template_loader
from django.conf import settings
from classytags.core import Options, Tag
from classytags.arguments import Argument, MultiKeywordArgument


TEMPLATETAG_LIBRARIES = ''.join(["{% load "+library+" %}" for library in getattr(settings, 'TEMPLATETAG_LIBRARIES', [])])
register = template.Library()


@register.tag
class RenderAsTemplateTag(Tag):
    name = 'render_as_template'
    options = Options(
        Argument('template_string', resolve=True, required=True),
    )

    def render_tag(self, context, template_string=None):
        try:
            template_string = TEMPLATETAG_LIBRARIES + template_string
            return Template(template_string).render(context)
        except template.VariableDoesNotExist:
            return ''

