# smokeshop/storelocator/serializers.py

def format_time(t):
    if t:
        return t.strftime("%I:%M %p").lstrip("0")
    return None


def storeSerializer(store):
    """
    Serialize a Store instance into a JSON-serializable dictionary.
    """
    return {
        "id": store.id,
        "name": store.name,
        "phone_number": store.phone_number,
        "email": store.email,
        "address": store.address,
        "zip_code": store.zip_code,
        "city_name": store.city.name if store.city else None,
        "state_name": store.city.state.name if store.city else None,
        "state_abbreviation": store.city.state.abbreviation if store.city else None,
        "latitude": float(store.latitude) if store.latitude else None,
        "longitude": float(store.longitude) if store.longitude else None,
        "opening_hour": format_time(store.opening_hour),
        "closing_hour": format_time(store.closing_hour),
        "main_image": store.main_image.url if store.main_image else None,
        "primary_image": store.primary_image.url if store.primary_image else None,
        "secondary_image": store.secondary_image.url if store.secondary_image else None,
    }
