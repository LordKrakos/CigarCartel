# smokeshop/storelocator/views.py

import json
from django import forms
from django.http import JsonResponse
from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render, get_object_or_404

from .models import Store, State, City
from .serializers import storeSerializer
from .utils import get_closest_store


class AddressForm(forms.Form):
    address = forms.CharField(
        label="",
        widget=forms.TextInput(attrs={
            'id': 'address-input',
            'class': 'address-input',
            'placeholder': 'Enter your address',
            'autocomplete': 'off',
            'aria-label': 'Search for a store'
        })
    )


def index(request):
    form = AddressForm(request.GET or None)
    result = {"store": None, "data": None, "distance_m": None, "error": None}

    if form.is_valid() and form.cleaned_data.get("address"):
        result = get_closest_store(form.cleaned_data["address"])
        if result["error"]:
            form.add_error("address", result["error"])

    # AJAX request (returns JSON)
    if request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest":
        if form.errors:
            return JsonResponse({"errors": form.errors}, status=400)
        return JsonResponse({
            "closest_store": result["data"],
            "distance_m": result["distance_m"],
            "error": result["error"]
        })

    # Full page render
    stores = Store.objects.all()
    cities = City.objects.prefetch_related("store_set").all()
    stores_json = json.dumps([storeSerializer(store) for store in stores], cls=DjangoJSONEncoder)

    context = {
        "form": form,
        "stores": stores,
        "cities": cities,
        "stores_json": stores_json,
        "closest_store": result["data"],
        "distance_m": result["distance_m"],
    }
    return render(request, "storelocator/index.html", context)


def state_stores(request, state_slug):
    """
    Fetch all stores in a specific state.
    """
    state = get_object_or_404(State, slug__iexact=state_slug)
    stores = Store.objects.filter(city__state=state)

    context = {"state": state, "stores": stores}
    return render(request, "storelocator/state_stores.html", context)


def city_stores(request, state_slug, city_slug):
    """
    Fetch all stores in a specific city within a state.
    """
    form = AddressForm(request.GET or None)
    result = {"store": None, "data": None, "distance_m": None, "error": None}

    state = get_object_or_404(State, slug__iexact=state_slug)
    city = get_object_or_404(City, slug__iexact=city_slug, state=state)
    cities = City.objects.prefetch_related("store_set").all()
    stores = Store.objects.filter(city=city)

    if form.is_valid() and form.cleaned_data.get("address"):
        result = get_closest_store(form.cleaned_data["address"])
        if result["error"]:
            form.add_error("address", result["error"])

    # AJAX request (returns JSON)
    if request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest":
        if form.errors:
            return JsonResponse({"errors": form.errors}, status=400)
        return JsonResponse({
            "closest_store": result["data"],
            "distance_m": result["distance_m"],
            "error": result["error"]
        })

    # Full page render
    stores_json = json.dumps([storeSerializer(store) for store in stores], cls=DjangoJSONEncoder)

    context = {
        "form": form,
        "state": state,
        "city": city,
        "stores": stores,
        "cities": cities,
        "closest_store": result["data"],
        "distance_m": result["distance_m"],
        "stores_json": stores_json,
    }

    return render(request, "storelocator/city_stores.html", context)


def store(request, state_slug, city_slug, store_slug):
    """
    Fetch a single store by its slug within a city.
    """
    state = get_object_or_404(State, slug__iexact=state_slug)
    city = get_object_or_404(City, slug__iexact=city_slug, state=state)
    cities = City.objects.prefetch_related("store_set").all()
    store = get_object_or_404(Store, slug=store_slug, city=city)

    form = AddressForm(request.GET or None)
    result = {"store": None, "data": None, "distance_m": None, "error": None}

    if form.is_valid() and form.cleaned_data.get("address"):
        result = get_closest_store(form.cleaned_data["address"])
        if result["error"]:
            form.add_error("address", result["error"])

    # --- AJAX request (returns JSON)
    if request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest":
        if form.errors:
            return JsonResponse({"errors": form.errors}, status=400)
        return JsonResponse({
            "closest_store": result["data"],
            "distance_m": result["distance_m"],
            "error": result["error"]
        })

    # --- Serialize store data
    stores_json = json.dumps([storeSerializer(store)], cls=DjangoJSONEncoder)

    # --- Collect images
    images = []
    for img_field in ["main_image", "primary_image", "secondary_image"]:
        image_obj = getattr(store, img_field, None)
        if image_obj and getattr(image_obj, "url", None):
            images.append(request.build_absolute_uri(image_obj.url))

    # --- Structured data (SEO)
    structured = {
        "@context": "https://schema.org",
        "@type": "TobaccoShop",
        "name": store.name,
        "image": images,
        "url": request.build_absolute_uri(),
        "priceRange": "$$",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": store.address,
            "addressLocality": store.city.name if store.city else "",
            "addressRegion": store.city.state.abbreviation if store.city and store.city.state else "",
            "postalCode": store.zip_code,
            "addressCountry": "US",
        },
        "@id": request.build_absolute_uri(),
    }

    if store.phone_number:
        structured["telephone"] = store.phone_number
    if store.email:
        structured["email"] = store.email

    if store.latitude and store.longitude:
        lat = float(store.latitude)
        lon = float(store.longitude)
        structured["geo"] = {"@type": "GeoCoordinates", "latitude": lat, "longitude": lon}
        structured["hasMap"] = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
        structured["@id"] = f"{request.build_absolute_uri()}#store"

    if store.opening_hour and store.closing_hour:
        opens = store.opening_hour.strftime("%H:%M")
        closes = store.closing_hour.strftime("%H:%M")
        structured["openingHoursSpecification"] = [{
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
            "opens": opens,
            "closes": closes,
        }]

    structured_data_json = json.dumps(structured, ensure_ascii=False, indent=2)

    context = {
        "state": state,
        "city": city,
        "store": store,
        "cities": cities,
        "form": form,
        "stores_json": stores_json,
        "closest_store": result["data"],
        "distance_m": result["distance_m"],
        "structured_data_json": structured_data_json,
    }

    return render(request, "storelocator/store.html", context)
