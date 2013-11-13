from .default import *
try:
    from .modules.db import *
    from .modules.cache import *
except:
    pass

DEBUG = False
TEMPLATE_DEBUG = DEBUG

