
import calendar
import logging
import operator

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
class SiteTag(Tag):
	name = 'get_currentsite'
	options = Options(
		'as',
		Argument('variable', resolve=False, required=False),
	)


	def render_tag(self, context, variable=None):
		output = Site.objects.get_current()
		if variable:
			context[variable] = output
			return ''
		else:
			return output
