from django.db import models
from django.contrib import admin
from django.contrib.flatpages.models import FlatPage

from mptt.admin import MPTTModelAdmin

from .models import ExtendedFlatPage
from .fields import CodeMirrorTextArea


class ExtendedFlatPageAdmin(MPTTModelAdmin):
    model = ExtendedFlatPage
    mptt_level_indent = 20

    prepopulated_fields = {"slug": ("title", )}
    list_display = ('title', 'get_absolute_url', 'status', 'created', 'modified')
    formfield_overrides = {
        models.TextField: {"widget": CodeMirrorTextArea({'rows': '24'})},
    }
    fieldsets = (
        (None, {
            'fields': ('title', 'slug', 'url', 'parent', 'sites', 'status')
        }),
        (None, {
            'fields': ('content', )
        }),
        ('Advanced options', {
            'classes': ('collapse',),
            'fields': ('enable_comments', 'registration_required', 'template_name')
        }),
    )
try:
    admin.site.unregister(FlatPage)
except Exception:
    pass
admin.site.register(ExtendedFlatPage, ExtendedFlatPageAdmin)
