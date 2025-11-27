# smokeshop/storelocator/urls.py

from django.urls import path, include
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
    # Home / Index page
    path("", views.index, name="index"),
    # State-level SEO page
    path("<slug:state_slug>/", views.state_stores, name="state_stores"),
    # City-level SEO page
    path("<slug:state_slug>/<slug:city_slug>/", views.city_stores, name="city_stores"),
    # Single store page
    path("<slug:state_slug>/<slug:city_slug>/<slug:store_slug>/", views.store, name="store"),
    # Sitemap
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps}, name="django.contrib.sitemaps.views.sitemap"),
    # Robots.txt
    path("robots.txt", TemplateView.as_view(template_name="robots.txt", content_type="text/plain"))
]
