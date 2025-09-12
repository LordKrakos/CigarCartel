# smokeshop/config/settings/prod.py

from .base import *

# Disable debug mode in production
DEBUG = False

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