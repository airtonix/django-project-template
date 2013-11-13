from django.core.urlresolvers import reverse_lazy

# users.py
AUTH_USER_MODEL = 'auth.User'
# AUTH_PROFILE_MODULE = "account.Account"
ANONYMOUS_USER_ID = -1
# AUTHENTICATION_BACKENDS = ('account.auth_backends.EmailAuthenticationBackend',)

LOGIN_URL = reverse_lazy('account_login')
# ACCOUNT_LOGIN_REDIRECT_URL = "dashboard"
ACCOUNT_EMAIL_CONFIRMATION_AUTHENTICATED_REDIRECT_URL = "dashboard"
ACCOUNT_USER_DISPLAY = lambda user: " ".join([user.first_name, user.last_name]) if (user.first_name and user.last_name) else user.email

# USERPROFILES_USE_PROFILE = True
# USERPROFILES_AUTO_LOGIN = True

# USERPROFILES_REGISTRATION_FORM = 'accounts.forms.ProfileRegistrationForm'
# USERPROFILES_REDIRECT_ON_REGISTRATION = 'userprofiles_profile'
# USERPROFILES_REGISTRATION_FULLNAME = True
# USERPROFILES_DOUBLE_CHECK_PASSWORD = True

# USERPROFILES_EMAIL_ONLY = True
# USERPROFILES_USE_EMAIL_VERIFICATION = True
# USERPROFILES_CHECK_UNIQUE_EMAIL = True
# USERPROFILES_DOUBLE_CHECK_EMAIL = True

# USERPROFILES_INLINE_PROFILE_ADMIN = True

ACCOUNT_NOTIFY_ON_PASSWORD_CHANGE = True
ACCOUNT_EMAIL_UNIQUE = True
ACCOUNT_EMAIL_CONFIRMATION_REQUIRED = True
