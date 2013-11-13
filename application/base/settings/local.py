from .default import *
from .utils import *


DEBUG = True
TEMPLATE_DEBUG = DEBUG

db_path = location('../../db.sqlite3')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': db_path,
    }
}

try:
    import debug_toolbar

    INSTALLED_APPS += (
        'debug_toolbar',
    )
    MIDDLEWARE_CLASSES += (
        'debug_toolbar.middleware.DebugToolbarMiddleware',
    )
    DEBUG_TOOLBAR_CONFIG = {
        'SHOW_TOOLBAR_CALLBACK': lambda request: True,
        'INTERCEPT_REDIRECTS': False,
    }
except:
    pass

EMAIL_SUBJECT_PREFIX = '[Sandbox] '
EMAIL_HOST = 'localhost'
EMAIL_PORT = 25
EMAIL_USE_TLS = False
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'


# Sass Runserver Compiler
#

COMPASS_PROJECT_PATH = location("..")
