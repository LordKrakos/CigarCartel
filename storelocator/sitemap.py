# smokeshop/storelocator/sitemap.py

from django.contrib.sitemaps import Sitemap
from django.urls import reverse
from .models import Store, State, City


class StaticViewSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.8

    def items(self):
        return ["storelocator:index"]

    def location(self, item):
        return reverse(item)


class StoreSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.9

    def items(self):
        return Store.objects.all()

    def location(self, obj):
        return reverse(
            "storelocator:store_detail",
            args=[obj.city.state.slug, obj.city.slug, obj.slug]
        )
    
    def lastmod(self, obj):
        return obj.updated_at  # 👈 Google sees when store info last changed


class StateSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.7

    def items(self):
        return State.objects.all()

    def location(self, obj):
        return reverse("storelocator:state_stores", args=[obj.slug])
    
    def lastmod(self, obj):
        latest_store = Store.objects.filter(city__state=obj).order_by("-updated_at").first()
        return latest_store.updated_at if latest_store else None


class CitySitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return City.objects.all()

    def location(self, obj):
        return reverse("storelocator:city_stores", args=[obj.state.slug, obj.slug])
    
    def lastmod(self, obj):
        latest_store = obj.store_set.order_by("-updated_at").first()
        return latest_store.updated_at if latest_store else None  # 👈 Google sees when any store in the city last changed