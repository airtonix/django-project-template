import logging

from django.conf import settings
from django.template import Library, loader as template_loader, TemplateDoesNotExist
from django.template.defaultfilters import slugify
from django.contrib.sites.models import Site
from django.core.exceptions import ImproperlyConfigured
from django.utils.safestring import mark_safe
from django.db.models import Q

from classytags.core import Options, Tag
from classytags.arguments import Argument, MultiKeywordArgument, IntegerArgument
from classytags.helpers import AsTag, InclusionTag

from plans.models import Plan

logger = logging.getLogger(__name__)
register = Library()


@register.tag
class AvailablePlanTags(InclusionTag):
    name = "available_plans"
    template = "plans/partials/plan_grid.html"
    options = Options(
        Argument('user', resolve=True, required=True),
        'with',
        MultiKeywordArgument('extra_context', resolve=True, required=False)
    )

    def get_context(self, context, user, extra_context, **kwargs):
        queryset = Plan.objects.prefetch_related('planpricing_set__pricing',
                                                 'planquota_set__quota')

        if user.is_authenticated():
            queryset = queryset.filter(
                Q(available=True, visible=True) & (
                    Q(customized=user) | Q(customized__isnull=True)
                )
            )
        else:
            queryset = queryset.filter(
                Q(available=True, visible=True) & Q(customized__isnull=True))

        context['plan_list'] = queryset
        context.update(extra_context)

        return context
