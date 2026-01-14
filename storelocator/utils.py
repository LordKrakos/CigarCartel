from typing import Optional, Dict, Any
import logging

from django.http import JsonResponse
from geopy.geocoders import GoogleV3
from geopy.distance import distance as geopy_distance
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from django.conf import settings

from .models import Store
from .serializers import storeSerializer

logger = logging.getLogger(__name__)

# Optional: Set max reasonable distance
MAX_DISTANCE_METERS = 100_000  # 100km


def get_closest_store(address: str) -> Dict[str, Optional[Any]]:
    """
    Given an address, return a dictionary with keys:
      - "store": the closest Store instance (or None)
      - "data": serialized store dict suitable for JSON (or None)
      - "distance_m": distance in meters between the user location and the chosen store (or None)
      - "error": optional error message if something went wrong (or None)

    This function:
      1. Validates the address.
      2. Geocodes the address using GoogleV3.
      3. Iterates stores with valid coordinates and computes distances.
      4. Picks the store with the smallest distance and returns structured results.

    Returns:
        Dict[str, Optional[Any]]
    """
    result = {"store": None, "data": None, "distance_m": None, "error": None}

    if not address:
        result["error"] = "No address provided."
        return result

    # Geocode the address
    try:
        geolocator = GoogleV3(api_key=settings.GOOGLE_MAPS_API_KEY)
        location = geolocator.geocode(address)
    except (GeocoderTimedOut, GeocoderServiceError) as e:
        logger.exception("Geocoding error for address '%s': %s", address, e)
        result["error"] = "Unable to locate address. Please try again."
        return result
    except Exception as e:
        logger.exception("Unexpected geocoding error for address '%s': %s", address, e)
        result["error"] = "An error occurred. Please try again later."
        return result

    if not location:
        result["error"] = "Address could not be geocoded."
        return result

    user_location = (location.latitude, location.longitude)

    # Query stores with coordinates - optimize with select_related
    stores = (
        Store.objects
        .exclude(latitude__isnull=True)
        .exclude(longitude__isnull=True)
        .select_related('city', 'city__state')
    )

    if not stores.exists():
        result["error"] = "No stores with coordinates available."
        return result

    # Find closest store
    closest_store = None
    min_distance_m = float("inf")

    for store in stores:
        try:
            store_location = (float(store.latitude), float(store.longitude))
        except (TypeError, ValueError):
            continue

        try:
            dist_m = geopy_distance(user_location, store_location).meters
        except Exception as e:
            logger.warning("Distance calc failed for store id=%s: %s", store.id, e)
            continue

        # Optional: Check if within max distance
        if dist_m < min_distance_m and dist_m < MAX_DISTANCE_METERS:
            min_distance_m = dist_m
            closest_store = store

    # Prepare result
    if closest_store and min_distance_m < float("inf"):
        result["store"] = closest_store
        result["data"] = storeSerializer(closest_store)
        result["distance_m"] = min_distance_m
        logger.debug(
            "Closest store for '%s': id=%s name=%s distance_m=%.2f",
            address, closest_store.id, closest_store.name, min_distance_m
        )
    else:
        result["error"] = "No stores found within reasonable distance."

    return result


def address_search(request, form):
    """
    Helper function to handle address search and AJAX responses.
    Returns (result_dict, json_response_or_none)
    """
    result = {"store": None, "data": None, "distance_m": None, "error": None}
    
    if form.is_valid() and form.cleaned_data.get("address"):
        result = get_closest_store(form.cleaned_data["address"])
        if result["error"]:
            form.add_error("address", result["error"])
    
    # AJAX request handling
    if request.META.get("HTTP_X_REQUESTED_WITH") == "XMLHttpRequest":
        if form.errors:
            return result, JsonResponse({"errors": form.errors}, status=400)
        return result, JsonResponse({
            "closest_store": result["data"],
            "distance_m": result["distance_m"],
            "error": result["error"]
        })
    
    return result, None