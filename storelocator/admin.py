# storelocator/admin.py

from django.contrib import admin
from django.utils.html import format_html
from geopy.geocoders import GoogleV3
from django.conf import settings
from django.contrib import messages
import time
import logging

from .models import State, City, Store

logger = logging.getLogger(__name__)


@admin.register(State)
class StateAdmin(admin.ModelAdmin):
    """Enhanced admin for State model"""
    
    list_display = ('name', 'abbreviation', 'slug', 'city_count')
    search_fields = ('name', 'abbreviation')
    readonly_fields = ('slug',)  # Auto-generated, shouldn't be edited
    ordering = ('name',)
    
    def city_count(self, obj):
        """Show number of cities in this state"""
        return obj.cities.count()
    city_count.short_description = 'Cities'
    
    fieldsets = (
        ('State Information', {
            'fields': ('name', 'abbreviation')
        }),
        ('Metadata', {
            'fields': ('slug',),
            'classes': ('collapse',)  # Collapsible section
        }),
    )


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    """Enhanced admin for City model"""
    
    list_display = ('name', 'state', 'slug', 'store_count')
    list_filter = ('state',)  # Filter by state in sidebar
    search_fields = ('name', 'state__name', 'state__abbreviation')
    readonly_fields = ('slug',)
    ordering = ('state__name', 'name')
    autocomplete_fields = ('state',)  # Better UX for selecting state
    
    def store_count(self, obj):
        """Show number of stores in this city"""
        return obj.store_set.count()
    store_count.short_description = 'Stores'
    
    fieldsets = (
        ('City Information', {
            'fields': ('name', 'state')
        }),
        ('Metadata', {
            'fields': ('slug',),
            'classes': ('collapse',)
        }),
    )


@admin.register(Store)
class StoreAdmin(admin.ModelAdmin):
    """Enhanced admin for Store model"""
    
    list_display = (
        'name', 
        'city', 
        'phone_number', 
        'display_hours',
        'map_link',
        'has_coordinates',
        'image_preview',
        'updated_at'
    )
    
    list_filter = (
        'city__state',  # Filter by state
        'city',  # Filter by city
        'created_at',
        'updated_at'
    )
    
    search_fields = (
        'name', 
        'address', 
        'city__name', 
        'city__state__name',
        'zip_code',
        'phone_number'
    )
    
    readonly_fields = (
        'slug', 
        'created_at', 
        'updated_at',
        'map_preview',
        'main_image_preview',
        'primary_image_preview',
        'secondary_image_preview'
    )
    
    autocomplete_fields = ('city',)  # Better UX for selecting city
    
    ordering = ('-updated_at',)  # Show most recently updated first
    
    date_hierarchy = 'created_at'  # Add date navigation
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'city', 'address', 'zip_code')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'email')
        }),
        ('Hours', {
            'fields': ('opening_hour', 'closing_hour'),
            'description': 'Store operating hours'
        }),
        ('Location Coordinates', {
            'fields': ('latitude', 'longitude', 'map_preview'),
            'description': 'Geographic coordinates for map display'
        }),
        ('Images', {
            'fields': (
                'main_image', 'main_image_preview',
                'primary_image', 'primary_image_preview',
                'secondary_image', 'secondary_image_preview'
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('slug', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Custom methods for list display
    
    def display_hours(self, obj):
        """Display store hours in readable format"""
        if obj.opening_hour and obj.closing_hour:
            return f"{obj.opening_hour.strftime('%I:%M %p')} - {obj.closing_hour.strftime('%I:%M %p')}"
        return "Not set"
    display_hours.short_description = 'Hours'
    
    def has_coordinates(self, obj):
        """Show if store has valid coordinates"""
        if obj.latitude and obj.longitude:
            return format_html('<span style="color: green;">✓</span>')
        return format_html('<span style="color: red;">✗</span>')
    has_coordinates.short_description = 'Coords'
    has_coordinates.admin_order_field = 'latitude'  # Make it sortable
    
    def image_preview(self, obj):
        """Show thumbnail of main image in list"""
        if obj.main_image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                obj.main_image.url
            )
        return "-"
    image_preview.short_description = 'Image'
    
    # Image preview methods for detail view
    
    def main_image_preview(self, obj):
        """Show larger preview of main image"""
        if obj.main_image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; border-radius: 8px;" />',
                obj.main_image.url
            )
        return "No image"
    main_image_preview.short_description = 'Main Image Preview'
    
    def primary_image_preview(self, obj):
        """Show larger preview of primary image"""
        if obj.primary_image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; border-radius: 8px;" />',
                obj.primary_image.url
            )
        return "No image"
    primary_image_preview.short_description = 'Primary Image Preview'
    
    def secondary_image_preview(self, obj):
        """Show larger preview of secondary image"""
        if obj.secondary_image:
            return format_html(
                '<img src="{}" style="max-width: 300px; max-height: 300px; border-radius: 8px;" />',
                obj.secondary_image.url
            )
        return "No image"
    secondary_image_preview.short_description = 'Secondary Image Preview'

    # Method for list view (small link)
    def map_link(self, obj):
        """Clickable link to Google Maps in list view"""
        if obj.latitude and obj.longitude:
            url = f"https://www.google.com/maps?q={obj.latitude},{obj.longitude}"
            return format_html('<a href="{}" target="_blank">🗺️ Map</a>', url)
        return "-"
    map_link.short_description = 'Map'
    
    # Method for detail view (embedded preview)
    def map_preview(self, obj):
        """Embedded Google Maps preview in detail view"""
        if obj.latitude and obj.longitude:
            return format_html(
                '''
                <iframe
                    width="600"
                    height="400"
                    frameborder="0"
                    style="border:0; border-radius: 8px;"
                    src="https://www.google.com/maps?q={},{}&output=embed"
                    allowfullscreen>
                </iframe>
                <br>
                <a href="https://www.google.com/maps?q={},{}" target="_blank" style="margin-top: 10px; display: inline-block;">
                    Open in Google Maps →
                </a>
                ''',
                obj.latitude, obj.longitude,
                obj.latitude, obj.longitude
            )
        return "No coordinates set - map preview unavailable"
    map_preview.short_description = 'Map Preview'
    
    # Admin actions
    
    actions = ['geocode_selected_stores', 'clear_coordinates', 'export_as_csv']

    def geocode_selected_stores(self, request, queryset):
        """Geocode multiple stores at once"""
        
        success_count = 0
        fail_count = 0
        
        geolocator = GoogleV3(api_key=settings.GOOGLE_MAPS_API_KEY)
        
        for store in queryset:
            # Build address
            full_address_parts = [store.address]
            if store.city:
                full_address_parts.append(store.city.name)
                if store.city.state:
                    full_address_parts.append(
                        store.city.state.abbreviation or store.city.state.name
                    )
            if store.zip_code:
                full_address_parts.append(store.zip_code)
            
            full_address = ", ".join(full_address_parts)
            
            try:
                location = geolocator.geocode(full_address)
                if location:
                    store.latitude = location.latitude
                    store.longitude = location.longitude
                    store._skip_geocoding = True  # Prevent double geocoding
                    store.save()
                    success_count += 1
                else:
                    fail_count += 1
            except Exception as e:
                logger.error(f"Failed to geocode {store.name}: {e}")
                fail_count += 1
            
            # Be nice to the API - small delay between requests
            time.sleep(0.2)
        
        self.message_user(
            request,
            f'Geocoded {success_count} store(s). Failed: {fail_count}',
            messages.SUCCESS if success_count > 0 else messages.WARNING
        )

    geocode_selected_stores.short_description = '🌍 Geocode selected stores'
    
    def clear_coordinates(self, request, queryset):
        """Clear coordinates for selected stores"""
        updated = queryset.update(latitude=None, longitude=None)
        self.message_user(request, f'{updated} store(s) had coordinates cleared.')
    clear_coordinates.short_description = 'Clear coordinates for selected stores'
    
    def export_as_csv(self, request, queryset):
        """Export selected stores as CSV"""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="stores.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Name', 'Address', 'City', 'State', 'Zip', 'Phone', 'Latitude', 'Longitude'])
        
        for store in queryset:
            writer.writerow([
                store.name,
                store.address,
                store.city.name if store.city else '',
                store.city.state.name if store.city and store.city.state else '',
                store.zip_code,
                store.phone_number,
                store.latitude,
                store.longitude
            ])
        
        return response
    export_as_csv.short_description = 'Export selected stores as CSV'


# Customize admin site branding (optional)
admin.site.site_header = "Cigar Cartel Store Management"
admin.site.site_title = "Cigar Cartel Admin"
admin.site.index_title = "Welcome to Store Management"