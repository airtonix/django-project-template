#settings_tags.py
import logging

from django.template import Library, loader as template_loader
from django.conf import settings

from classytags.core import Options, Tag
from classytags.arguments import Argument, MultiKeywordArgument


logger = logging.getLogger(__name__)
register = Library()

@register.tag
class SettingsTag(Tag):
	name = 'get_setting'
	options = Options(
		Argument('key', resolve=True, required=True),
		'as',
		Argument('variable', resolve=False, required=False),
	)

	def render_tag(self, context, key, variable=None):
		output = getattr(settings, key, "<!-- missing key: {} in settings //-->".format(key))
		if variable:
			context[variable] = output
			return ''
		else:
			return output
