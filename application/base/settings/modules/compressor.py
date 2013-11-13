from ..utils import *

# 1. Don't use precompilers... this project uses a compass watch integration with runserver.
# 2. Deployment involves using ./manage.py compress. The ansible playbook deals with this.

COMPRESS_DEBUG_TOGGLE = 'compressor'
COMPRESS_OFFLINE = True
