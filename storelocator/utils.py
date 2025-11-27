# smokeshop/storelocator/utils.py

from typing import Optional, Dict, Any
import logging

from geopy.geocoders import GoogleV3
from geopy.distance import distance as geopy_distance
from django.conf import settings

from .models import Store
from .serializers import storeSerializer

logger = logging.getLogger(__name__)


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
    # Default result structure
    result = {"store": None, "data": None, "distance_m": None, "error": None}

    # 1) Validate address input
    if not address:
        result["error"] = "No address provided."
        return result

    # 2) Geocode the address to coordinates
    try:
        geolocator = GoogleV3(api_key=settings.GOOGLE_MAPS_API_KEY)
        location = geolocator.geocode(address)
    except Exception as e:
        # Catch geocoder exceptions (network, quota, invalid key, etc.)
        logger.exception("Geocoding error for address '%s': %s", address, e)
        result["error"] = f"Geocoding failed: {e}"
        return result

    if not location:
        result["error"] = "Address could not be geocoded."
        return result

    user_location = (location.latitude, location.longitude)

    # 3) Query stores that have valid coordinates
    stores = Store.objects.exclude(latitude__isnull=True).exclude(longitude__isnull=True)

    if not stores.exists():
        result["error"] = "No stores with coordinates available."
        return result

    # 4) Iterate stores and find the closest
    closest_store = None
    min_distance = float("inf")
    min_distance_m = None

    for store in stores:
        try:
            store_location = (float(store.latitude), float(store.longitude))
        except (TypeError, ValueError):
            # Skip stores with invalid coordinate fields
            continue

        try:
            dist_m = geopy_distance(user_location, store_location).meters
        except Exception as e:
            # If distance calculation unexpectedly fails, skip this store
            logger.warning("Distance calc failed for store id=%s: %s", getattr(store, "id", None), e)
            continue

        if dist_m < min_distance:
            min_distance = dist_m
            min_distance_m = dist_m
            closest_store = store

    # 5) Prepare result
    if closest_store:
        result["store"] = closest_store
        result["data"] = storeSerializer(closest_store)
        result["distance_m"] = min_distance_m
        # Optional debug log
        logger.debug(
            "Closest store for '%s': id=%s name=%s distance_m=%.2f",
            address, closest_store.id, closest_store.name, min_distance_m
        )
    else:
        result["error"] = "No valid stores found after filtering."

    return result