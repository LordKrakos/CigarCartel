# smokeshop/storelocator/urls.py

from django.urls import path
from django.contrib.sitemaps.views import sitemap
from django.views.generic import TemplateView

from . import views
from .sitemap import StaticViewSitemap, StoreSitemap, StateSitemap, CitySitemap

app_name = "storelocator"

sitemaps = {
    "static": StaticViewSitemap,
    "stores": StoreSitemap,
    "states": StateSitemap,
    "cities": CitySitemap,
}

urlpatterns = [
    # ⚠️ IMPORTANT: Static/specific paths MUST come before slug patterns
    # Sitemap
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps}, name="sitemap"),
    
    # Robots.txt
    path("robots.txt", TemplateView.as_view(
        template_name="storelocator/robots.txt", 
        content_type="text/plain"
    ), name="robots"),
    
    # Home / Index page
    path("", views.index, name="index"),
    
    # ⚠️ Slug patterns come last (they match anything)
    # State-level SEO page
    path("<slug:state_slug>/", views.state_stores, name="state_stores"),
    
    # City-level SEO page
    path("<slug:state_slug>/<slug:city_slug>/", views.city_stores, name="city_stores"),
    
    # Single store page
    path("<slug:state_slug>/<slug:city_slug>/<slug:store_slug>/", views.store, name="store"),
]