# config/settings/prod.py
from .base import *
import os

DEBUG = False

ALLOWED_HOSTS = [
    "cigarcartel.net",
    "www.cigarcartel.net",
]

CSRF_TRUSTED_ORIGINS = [
    "https://cigarcartel.net",
    "https://www.cigarcartel.net",
]

# Security best practices
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Static & Media configs, Cloud storage configs, etc.
