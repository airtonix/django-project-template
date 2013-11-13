import calendar
import logging
import operator

from django.conf import settings
from django.template import Library, loader as template_loader, TemplateDoesNotExist
from django.template.defaultfilters import slugify
from django.contrib.sites.models import Site
from django.core.exceptions import ImproperlyConfigured
from django.utils.safestring import mark_safe

from classytags.core import Options, Tag
from classytags.arguments import Argument, MultiKeywordArgument, IntegerArgument
from classytags.helpers import AsTag, InclusionTag


logger = logging.getLogger(__name__)
register = Library()


@register.tag
class IncludeFormTag(Tag):
    name = "include_form"
    options = Options(
        Argument('class_path', resolve=True, required=True),
        'as',
        Argument('variable', resolve=False, required=False),
    )

    def render_tag(self, context, class_path=None, variable=None):
        if class_path is None:
            return ""

        form_class = load_class(class_path)

        if variable is not None:
            context[variable] = form_class
            return ""

        form = form_class(None)
        return form.as_p()


@register.filter
def field_type(field):
    try:
        return slugify(field.field.widget.__class__.__name__)
    except:
        return ""


@register.filter
def add_placeholder(field, text=None):
    try:
        if not text:
            text = field.field.label
        field.field.widget.attrs.update({"placeholder": text})
    except:
        pass

    finally:
        return field


@register.filter
def html_class(field, args=None):
    if args is None:
        return field
    attrs = field.field.widget.attrs
    existing_classnames = attrs.get("class", None)
    classnames = args.replace("+", "")

    # if widget already has classnames and filter is being called in append
    # mode
    if args.startswith("+") and not existing_classnames is None:
        classnames = " ".join([existing_classnames, classnames])

    attrs['class'] = classnames

    return field
