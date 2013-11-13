import os
import re
from ..lib.loader import import_directory
from .utils import *


DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Name', 'e@ma.il'),
)

SUPPORT = (
    ('Support Staff', 'sup@po.rt'),
)

MANAGERS = ADMINS


# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = '*'

TIME_ZONE = 'Australia/Adelaide'
LANGUAGE_CODE = 'en-AU'
SITE_ID = os.environ.get("SITE_ID", 1)

USE_I18N = True
USE_L10N = True
USE_TZ = True


MEDIA_ROOT = location("../../../public/files")
MEDIA_URL = '/files/'
STATIC_ROOT = location("../../../public/static")
STATIC_URL = '/static/'
ADMIN_MEDIA_PREFIX = STATIC_URL + 'admin/'

ROOT_URLCONF = 'base.urls.main'

STATICFILES_DIRS = (
)
TEMPLATE_DIRS = (
    location('../templates'),
)

WSGI_APPLICATION = 'base.wsgi.application'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}


try:
    from settings.secret_key import SECRET_KEY
except ImportError as error:
    from django.utils.crypto import get_random_string
    SECRET_KEY = get_random_string(
        50, 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)')
    secret_key_file = open(os.path.join(HERE_DIR, "secret_key.py"), 'w')
    secret_key_file.write("SECRET_KEY='{}'".format(SECRET_KEY))
    secret_key_file.close()


INSTALLED_APPS = (
    'djangocms_admin_style',
    'admin_shortcuts',

    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.flatpages',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    'django.contrib.admin',
    'django.contrib.admindocs',

    # insert extra theme apps here
    'base',

    'manifesto',
    'url_robots',
    'googletools',
    'favicon',
    'compressor',

    'post_office',
    'mptt',
    'menus',
    'django_extensions',

    'flatblocks',
    'taggit',
    'south',
    'themes',

)

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)
if 'compressor' in INSTALLED_APPS:
    STATICFILES_FINDERS += (
        'compressor.finders.CompressorFinder',
    )


TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)
if 'themes' in INSTALLED_APPS:
    TEMPLATE_LOADERS += ('themes.loaders.themes.Loader', )


#
# Context Processors

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.request',
    'base.context_processors.site',
    'base.context_processors.django_settings',
)

if 'themes' in INSTALLED_APPS:
    TEMPLATE_CONTEXT_PROCESSORS += ('themes.context_processors.themes', )

if 'account' in INSTALLED_APPS:
    TEMPLATE_CONTEXT_PROCESSORS += (
        'account.context_processors.account',
    )

if 'plans' in INSTALLED_APPS:
    TEMPLATE_CONTEXT_PROCESSORS += (
        'plans.context_processors.account_status',
    )


MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
)

if 'plans' in INSTALLED_APPS:
    MIDDLEWARE_CLASSES += (
        'lockout.middleware.LockoutMiddleware',
    )
MIDDLEWARE_CLASSES += (
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

if 'themes' in INSTALLED_APPS:
    MIDDLEWARE_CLASSES += ('themes.middleware.ThemesMiddleware', )
    THEMES_USE_TEMPLATE_LOADERS = True
    THEMES = []
    try:
        THEMES = autodiscover(submodule_name='theme',
                              variables='MANIFEST')
    except:
        pass

# Modularised Settings
#
import_directory(dotted_path='base.settings.modules',
                 module_path=os.path.abspath("{0}/modules/".format(HERE_DIR)),
                 import_target=globals())
