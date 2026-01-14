# smokeshop/storelocator/views.py

import json
from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render, get_object_or_404

from .models import Store, State, City
from .forms import AddressForm
from .serializers import storeSerializer
from .utils import address_search


def index(request):
    
    form = AddressForm(request.GET or None)
    result, ajax_response = address_search(request, form)
    if ajax_response:
        return ajax_response

    # Optimize queries
    states = State.objects.only(
        'id', 'name', 'abbreviation', 'slug'
    )
    cities = City.objects.select_related('state').only(
        'id', 'name', 'slug', 'state__name', 'state__abbreviation'
    )
    stores = Store.objects.select_related('city', 'city__state').all()
    
    context = {
        "form": form,
        "states": states,
        "cities": cities,
        "stores": stores,
        "stores_json": json.dumps(
            [storeSerializer(store) for store in stores], 
            cls=DjangoJSONEncoder
        ),
        "closest_store": result["data"],
        "distance_m": result["distance_m"],
    }
    return render(request, "storelocator/index.html", context)


def state_stores(request, state_slug):
    """
    Fetch all stores in a specific state.
    """
    form = AddressForm(request.GET or None)
    result, ajax_response = address_search(request, form)

    if ajax_response:
        return ajax_response

    state = get_object_or_404(State, slug__iexact=state_slug)
    cities = City.objects.select_related('state').only(
        'id', 'name', 'slug', 'state__name', 'state__abbreviation'
    )
    stores = Store.objects.filter(city__state=state).select_related('city', 'city__state')

    context = {
        "form": form,
        "state": state,
        "stores": stores,
        "cities": cities,
        "closest_store": result["data"],
        "distance_m": result["distance_m"],
        "stores_json": json.dumps(
            [storeSerializer(store) for store in stores], 
            cls=DjangoJSONEncoder
        ),
    }
    return render(request, "storelocator/state_stores.html", context)


def city_stores(request, state_slug, city_slug):
    """
    Fetch all stores in a specific city within a state.
    """
    form = AddressForm(request.GET or None)
    result, ajax_response = address_search(request, form)

    if ajax_response:
        return ajax_response

    state = get_object_or_404(State, slug__iexact=state_slug)
    city = get_object_or_404(City, slug__iexact=city_slug, state=state)
    cities = City.objects.select_related('state').only(
        'id', 'name', 'slug', 'state__name', 'state__abbreviation'
    )
    stores = Store.objects.filter(city=city).select_related('city', 'city__state')

    context = {
        "form": form,
        "state": state,
        "city": city,
        "stores": stores,
        "cities": cities,
        "closest_store": result["data"],
        "distance_m": result["distance_m"],
        "stores_json": json.dumps(
            [storeSerializer(store) for store in stores], 
            cls=DjangoJSONEncoder
        ),
    }

    return render(request, "storelocator/city_stores.html", context)


def store(request, state_slug, city_slug, store_slug):
    """
    Fetch a single store by its slug within a city.
    """
    state = get_object_or_404(State, slug__iexact=state_slug)
    city = get_object_or_404(City, slug__iexact=city_slug, state=state)
    cities = City.objects.select_related('state').only(
        'id', 'name', 'slug', 'state__name', 'state__abbreviation'
    )
    store = get_object_or_404(Store, slug=store_slug, city=city)

    # --- Serialize store data
    stores_json = json.dumps([storeSerializer(store)], cls=DjangoJSONEncoder)

    # --- Collect images
    images = [
        request.build_absolute_uri(img.url)
        for img in [store.main_image, store.primary_image, store.secondary_image]
        if img
    ]

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
            "addressLocality": city.name,
            "addressRegion": state.abbreviation or state.name,
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
        try:
            lat = float(store.latitude)
            lon = float(store.longitude)
            # Only add geo data if conversion succeeded
            structured["geo"] = {"@type": "GeoCoordinates", "latitude": lat, "longitude": lon}
            structured["hasMap"] = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
            structured["@id"] = f"{request.build_absolute_uri()}#store"
        except (ValueError, TypeError):
            pass  # Skip geo data if coordinates are invalid

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
        "stores_json": stores_json,
        "structured_data_json": structured_data_json,
    }

    return render(request, "storelocator/store.html", context)


# def custom_404(request, exception):
#     return render(request, 'storelocator/404.html', status=404)
#
# def custom_500(request):
#     return render(request, 'storelocator/500.html', status=500)