import logging

from django.conf import settings
from django.template import Library, loader as template_loader, TemplateDoesNotExist
from django.core.exceptions import ImproperlyConfigured
from django.utils.safestring import mark_safe
from django.db import models

from classytags.core import Options, Tag
from classytags.arguments import Argument, MultiKeywordArgument, IntegerArgument
from classytags.helpers import AsTag, InclusionTag

logger = logging.getLogger(__name__)
register = Library()


@register.filter
def dir(object, args=None):
    return dir(object)


@register.filter
def fields(object, args=None):
    if hasattr(object, "_meta"):
        return object._meta.fields
    elif isinstance(object, dict):
        return object.keys()
    else :
        return dir(object)

@register.filter("to_dict")
def to_dict(thing, args=None):
    return thing.__dict__

