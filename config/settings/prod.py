# smokeshop/config/settings/prod.py

from .base import *

# Disable debug mode in production
DEBUG = False

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'your_cpanel_db_name',
#         'USER': 'your_cpanel_db_user',
#         'PASSWORD': 'your_cpanel_db_password',
#         'HOST': 'your_cpanel_db_host',  # usually 'localhost'
#         'PORT': '3306',
#         'OPTIONS': {
#             'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"
#         }
#     }
# }

# Allowed hosts for your domain
ALLOWED_HOSTS = [
    "cigarcartel.net",
    "www.cigarcartel.net",
]

# Trusted origins for CSRF protection
CSRF_TRUSTED_ORIGINS = [
    "https://cigarcartel.net",
    "https://www.cigarcartel.net",
]

# Security best practices
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True