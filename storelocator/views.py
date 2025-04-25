import json
from django import forms
from django.http import JsonResponse
from django.urls import reverse
from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import render
from geopy.geocoders import GoogleV3
from geopy.distance import distance as geopy_distance
from django.conf import settings

from .models import Store


class AddressSearchForm(forms.Form):
    address = forms.CharField(
        label="",
        widget=forms.TextInput(attrs={
            'id': 'address-input',
            'class': 'address-input',
            'placeholder': 'Enter your address, city, state or zipcode',
            'autocomplete': 'off',
            'aria-label': 'Search for a store'
        })
    )


def index(request):
    form = AddressSearchForm(request.GET or None)
    closest_store = None

    if form.is_valid() and form.cleaned_data.get('address'):
        address = form.cleaned_data['address']
        geolocator = GoogleV3(api_key=settings.GOOGLE_MAPS_API_KEY)
        location = geolocator.geocode(address)
        if location:
            user_coords = (location.latitude, location.longitude)
            stores_qs = Store.objects.exclude(latitude__isnull=True, longitude__isnull=True).values(
                "id", "name", "image", "phone_number", "email",
                "address", "city__state", "zip_code", "latitude", "longitude",
                "city__name", "city__state__abbreviation"
            )
            min_distance = float("inf")
            for store in stores_qs:
                try:
                    store_coords = (float(store['latitude']), float(store['longitude']))
                except (TypeError, ValueError):
                    continue
                curr_distance = geopy_distance(user_coords, store_coords).meters
                if curr_distance < min_distance:
                    min_distance = curr_distance
                    closest_store = store
        else:
            form.add_error('address', 'Geocoding failed. Please check your address.')

    # If AJAX, return JSON
    if request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest":
        if form.errors:
            return JsonResponse({"errors": form.errors}, status=400)
        return JsonResponse({"closest_store": closest_store})
    
    # Otherwise, render the full page.
    stores = Store.objects.all().values(
        "id", "name", "image", "phone_number", "email",
        "address", "city__state", "zip_code", "latitude", "longitude",
        "city__name", "city__state__abbreviation"
    )
    stores = list(stores)
    mid = len(stores) // 2
    left_stores = stores[:mid]
    right_stores = stores[mid:]
    stores_json = json.dumps(stores, cls=DjangoJSONEncoder)
    
    context = {
        "form": form,
        "left_stores": left_stores,
        "right_stores": right_stores,
        "stores_json": stores_json,
        "closest_store": closest_store
    }
    return render(request, "storelocator/index.html", context)