import sys
import os

# Path to your Django project
project_home = '/home/z02emo1i8hzs/public_html/smokeshop'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Use the correct settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings.prod'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
