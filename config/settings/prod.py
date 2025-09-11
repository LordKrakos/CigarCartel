# config/settings/prod.py
from .base import *
import os

DEBUG = False

ALLOWED_HOSTS = [
    "419smokeshop.com",
    "www.419smokeshop.com",
    "storelocator-tt2a.onrender.com",
]

CSRF_TRUSTED_ORIGINS = [
    "https://cigarcartel.net",
    "https://www.cigarcartel.net",
]

# Security best practices
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Production DB
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', default='5432'),
    }
}

# Static & Media configs, Cloud storage configs, etc.
