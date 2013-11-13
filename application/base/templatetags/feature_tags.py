import logging

from django.conf import settings
from django.template import RequestContext, Library, loader as template_loader, TemplateDoesNotExist, defaultfilters
from django.contrib.sites.models import Site
from django.core.exceptions import ImproperlyConfigured
from django.utils.safestring import mark_safe

from classytags.core import Options, Tag
from classytags.arguments import Argument, MultiKeywordArgument, IntegerArgument
from classytags.helpers import AsTag, InclusionTag

from waffle import flag_is_active, sample_is_active, switch_is_active

from ..lib.loader import load_class

logger = logging.getLogger(__name__)
register = Library()


@register.tag
class FeatureFlipTag(InclusionTag):
    name = 'feature'
    options = Options(
        Argument('feature_type', resolve=True, required=True),
        Argument('feature_code', resolve=False, required=True),
        MultiKeywordArgument('kwargs', resolve=True, required=False),
        blocks=[
            ('else'.format(name), 'feature_on'),
            ('end{0}'.format(name), 'feature_off'),
        ],
    )
    template = "feature_flip/default.html"
    conditions = {
        "flag": flag_is_active,
        "switch": lambda request, name: switch_is_active(name),
        "sample": lambda request, name: sample_is_active(name),
    }

    def get_context(self, context, feature_type=None, feature_code=None, kwargs=None, feature_on=None, feature_off=None):
        content = None
        state = "error"
        request = context.get('request', None)

        if not feature_type:
            content = u"Missing feature type"

        if not feature_code:
            content = u"Missing feature code"

        if content == None:
            condition = self.conditions.get(feature_type, None)

            if not condition:
                error = u"Missing condition for : {}".format(feature_type)

            if condition(request, feature_code):
                print "Feature", feature_code, "for user", request.user, "is on"
                state = "on"
                content = feature_on.render(context)

            else:
                print "Feature", feature_code, "for user", request.user, "is off"
                state = "off"
                content = feature_off.render(context)

        feature_context = RequestContext(context, { "Feature" : {
                    "content": content,
                    "meta": {
                        "state": state,
                        "code": feature_code,
                        "type": feature_type,
                    }
                }})
        out_kwargs = {
            'html_classes' : 'feature-flip',
            'html_element' : 'div'
        }
        if kwargs:
            if "html_classes" in kwargs.keys():
                out_kwargs['html_classes'] = " ".join([
                    kwargs['html_classes'],
                    out_kwargs['html_classes']
                ])
            if "html_element" in kwargs.keys():
                out_kwargs['html_element'] = kwargs['html_element']

        feature_context.update(out_kwargs)

        return feature_context

