# smokeshop/storelocator/models.py

from django.db import models
from django.utils.text import slugify
import logging

logger = logging.getLogger(__name__)


class State(models.Model):
    name = models.CharField(max_length=100, unique=True)
    abbreviation = models.CharField(max_length=10, blank=True, null=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.abbreviation if self.abbreviation else self.name


class City(models.Model):
    name = models.CharField(max_length=100)
    state = models.ForeignKey(
        State,
        on_delete=models.CASCADE,
        related_name="cities"
    )
    slug = models.SlugField(max_length=100, blank=True)

    class Meta:
        unique_together = ("name", "state")
        verbose_name_plural = "cities"

    def save(self, *args, **kwargs):
        if not self.slug:
            # Make slug unique by including state
            self.slug = slugify(f"{self.name}-{self.state.abbreviation or self.state.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name}, {self.state}"


class Store(models.Model):
    name = models.CharField(max_length=100)
    main_image = models.ImageField(upload_to="store_images/", blank=True, null=True)
    primary_image = models.ImageField(upload_to="store_images/", blank=True, null=True)
    secondary_image = models.ImageField(upload_to="store_images/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=False)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=200)
    opening_hour = models.TimeField(blank=True, null=True)
    closing_hour = models.TimeField(blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=False)
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=7, blank=True, null=True)
    city = models.ForeignKey(
        City,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['city']),
            models.Index(fields=['latitude', 'longitude']),
            models.Index(fields=['slug']),
        ]
        verbose_name_plural = "stores"  # Optional: proper plural

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Store original values for change detection
        self._original_address = self.address
        self._original_city = self.city_id
        self._original_zip = self.zip_code

    def save(self, *args, **kwargs):
        """
        Custom save method that:
        1. Generates unique slug from name
        2. Auto-geocodes address if it changed
        """
        # 1. Generate unique slug
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            # Ensure unique slug - exclude current instance if updating
            while Store.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # 2. Auto-geocode if address changed
        address_changed = (
            self._original_address != self.address or
            self._original_city != self.city_id or
            self._original_zip != self.zip_code
        )

        # Only geocode if address changed and we have an address
        if address_changed and self.address:
            # Check if _skip_geocoding flag is set (used by admin actions)
            skip_geocoding = getattr(self, '_skip_geocoding', False)
            if not skip_geocoding:
                self._geocode_address()

        # 3. Save the model
        super().save(*args, **kwargs)

        # 4. Update tracked values after save
        self._original_address = self.address
        self._original_city = self.city_id
        self._original_zip = self.zip_code

    def _geocode_address(self):
        """
        Automatically fetch coordinates from address using Google Maps API.
        Called automatically when address-related fields change.
        """
        # Build full address string
        full_address_parts = [self.address]

        if self.city:
            full_address_parts.append(self.city.name)
            if self.city.state:
                full_address_parts.append(
                    self.city.state.abbreviation or self.city.state.name
                )

        if self.zip_code:
            full_address_parts.append(self.zip_code)

        full_address = ", ".join(full_address_parts)

        try:
            from geopy.geocoders import GoogleV3
            from django.conf import settings

            geolocator = GoogleV3(api_key=settings.GOOGLE_MAPS_API_KEY)
            location = geolocator.geocode(full_address)

            if location:
                self.latitude = location.latitude
                self.longitude = location.longitude
                logger.info(
                    f"✓ Geocoded '{self.name}': {self.latitude}, {self.longitude}"
                )
            else:
                logger.warning(f"✗ Could not geocode: {full_address}")
        except Exception as e:
            logger.error(f"✗ Geocoding error for '{self.name}': {e}")

    def __str__(self):
        return f"{self.name} - {self.address}, {self.city}"