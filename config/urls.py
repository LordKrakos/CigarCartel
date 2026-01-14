# CigarCartel/config/urls.py

"""
URL configuration for smokeshop project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# CigarCartel/config/urls.py

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.http import JsonResponse

# Customize Django admin
admin.site.site_header = "Cigar Cartel Admin"
admin.site.site_title = "Cigar Cartel Admin"
admin.site.index_title = "Store Management"


def health_check(request):
    """Simple health check endpoint for monitoring"""
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    # Health check for deployment monitoring
    path('health/', health_check, name='health_check'),
    
    # Django admin
    path('admin/', admin.site.urls),
    
    # Store locator app (at root)
    path('', include('storelocator.urls')),
]

# Serve media files in development only
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Custom error handlers (optional)
# handler404 = 'storelocator.views.custom_404'
# handler500 = 'storelocator.views.custom_500'