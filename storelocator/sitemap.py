# smokeshop/storelocator/sitemap.py

from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from django.db.models import Max
from django.core.cache import cache
from .models import Store, State, City


class StaticViewSitemap(Sitemap):
    """Sitemap for static pages like homepage"""
    changefreq = "monthly"
    priority = 0.8

    def items(self):
        return ["storelocator:index"]

    def location(self, item):
        return reverse(item)


class StoreSitemap(Sitemap):
    """Sitemap for individual store pages"""
    changefreq = "weekly"
    priority = 0.9

    def items(self):
        cache_key = 'store_sitemap_items'
        items = cache.get(cache_key)
        if items is None:
            items = list(
                Store.objects
                .select_related('city', 'city__state')
                .exclude(city__isnull=True)
                .exclude(city__state__isnull=True)
            )
            cache.set(cache_key, items, 60 * 60)  # Cache for 1 hour
        return items

    def location(self, obj):
        # Safety check (shouldn't be needed with filters above, but defensive)
        if not obj.city or not obj.city.state:
            return None
        return reverse(
            "storelocator:store",
            args=[obj.city.state.slug, obj.city.slug, obj.slug]
        )
    
    def lastmod(self, obj):
        return obj.updated_at


class StateSitemap(Sitemap):
    """Sitemap for state-level store listing pages"""
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        # Only include states with stores, annotate with latest update
        return State.objects.filter(
            cities__store__isnull=False
        ).distinct().annotate(
            latest_update=Max('cities__store__updated_at')
        )

    def location(self, obj):
        return reverse("storelocator:state_stores", args=[obj.slug])
    
    def lastmod(self, obj):
        return obj.latest_update


class CitySitemap(Sitemap):
    """Sitemap for city-level store listing pages"""
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        # Only include cities with stores, annotate with latest update
        return (
            City.objects
            .filter(store__isnull=False)
            .select_related('state')
            .annotate(latest_update=Max('store__updated_at'))
        )

    def location(self, obj):
        return reverse("storelocator:city_stores", args=[obj.state.slug, obj.slug])
    
    def lastmod(self, obj):
        return obj.latest_update