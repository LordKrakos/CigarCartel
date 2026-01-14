// smokeshop/storelocator/static/storelocator/js/map.js

// Global variables
let map;
let markers = [];
let storesDataGlobal = [];
let currentStoreId = null;
let currentInfoWindow = null;

function createAdvancedMarker(store, AdvancedMarkerElement, map) {
    const markerContent = document.createElement("div");
    markerContent.className = "advanced-marker";

    const icon = document.createElement("i");
    icon.className = "fa fa-map-marker-alt marker-icon"; // Your icon
    icon.setAttribute("aria-hidden", "true");
    icon.alt = store.name;
    markerContent.appendChild(icon);

    const marker = new AdvancedMarkerElement({
        position: {
            lat: parseFloat(store.latitude),
            lng: parseFloat(store.longitude)
        },
        map: map,
        title: store.name,
        content: markerContent
    });
    
    // Store properties for later lookup.
    marker.storeId = store.id;
    marker.storeData = store;

    // 🔑 Make marker clickable
    markerContent.style.cursor = "pointer"; // Show pointer cursor

    markerContent.addEventListener("click", () => {

        map.setCenter(marker.position);

        stepZoomWithCallback(19, 250, () => {
            currentStoreId = store.id;
            openInfoWindow(marker);
        });
        
    });
    
    return marker;
}

// Discrete step-based zoom that accepts a callback.
function stepZoomWithCallback(targetZoom, delay = 150, callback) {
    const currentZoom = map.getZoom();
    if (currentZoom === targetZoom) {
        if (callback) callback();
        return;
    }
    const step = targetZoom > currentZoom ? 1 : -1;
    map.setZoom(currentZoom + step);
    setTimeout(() => stepZoomWithCallback(targetZoom, delay, callback), delay);
}

// Helper to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openInfoWindow(marker) {
    if (currentInfoWindow) {
        currentInfoWindow.close();
    }

    setTimeout(() => {
        const store = marker.storeData;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const directionsUrl = isMobile
            ? `https://maps.apple.com/?daddr=${store.latitude},${store.longitude}&dirflg=d`
            : `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;

        // Build content with null checks
        let contentString = `
            <div class="info-window fade-in">
                <h3>${escapeHtml(store.name)}</h3>
                <p class="info-address">${escapeHtml(store.address)}</p>
                <p class="info-city">${escapeHtml(store.city_name)}, ${escapeHtml(store.state_abbreviation)} ${escapeHtml(store.zip_code)}</p>
                <p class="info-phone"><b>Phone:</b> <a href="tel:${store.phone_number}">${escapeHtml(store.phone_number)}</a></p>
        `;

        // Only add email if it exists
        if (store.email) {
            contentString += `<p class="info-email"><b>Email:</b> <a href="mailto:${store.email}">${escapeHtml(store.email)}</a></p>`;
        }

        // Only add hours if they exist
        if (store.opening_hour && store.closing_hour) {
            contentString += `<p class="info-hours"><b>Hours:</b> ${escapeHtml(store.opening_hour)} - ${escapeHtml(store.closing_hour)}</p>`;
        }

        contentString += `
                <a href="${directionsUrl}" target="_blank" rel="noopener" class="get-directions btn btn-primary btn-sm">
                    <i class="fa-solid fa-route"></i> Get Directions
                </a>
            </div>
        `;

        currentInfoWindow = new google.maps.InfoWindow({ content: contentString });
        currentInfoWindow.open(map, marker);

        // Center map after info window opens
        google.maps.event.addListenerOnce(currentInfoWindow, "domready", () => {
            const iwOuter = document.querySelector(".gm-style-iw");
            if (iwOuter) {
                const iwHeight = iwOuter.offsetHeight;
                map.panBy(0, -iwHeight); // Center better
            }
        });

    }, 150);
}


function zoomToStore(storeId) {

    // Close any existing info window immediately.
    if (currentInfoWindow) {
        currentInfoWindow.close();
    }
    
    const marker = markers.find(m => m.storeId === parseInt(storeId));

    if (marker) {
        // If a store is already selected and it differs from the newly requested store,
        // zoom out to a default level first (e.g., 12) then re-center and zoom in.
        if (currentStoreId !== null && currentStoreId !== storeId) {
            stepZoomWithCallback(12, 250, function() {
                // After zooming out, center on the new marker and zoom in.
                map.setCenter(marker.position);
                stepZoomWithCallback(19, 300, function() {
                    currentStoreId = storeId;
                    openInfoWindow(marker);
                });
            });
        } else {
            // If no store is currently selected, or if the same store is selected,
            // just center on it and zoom in.
            map.setCenter(marker.position);
            stepZoomWithCallback(19, 250, function() {
                currentStoreId = storeId;
                openInfoWindow(marker);
            });
        }
    }
}

// Calculate map center from stores
function calculateCenter(stores) {
    let latSum = 0;
    let lngSum = 0;
    let count = 0;
    
    stores.forEach(store => {
        if (store.latitude && store.longitude) {
            latSum += parseFloat(store.latitude);
            lngSum += parseFloat(store.longitude);
            count++;
        }
    });
    
    return count > 0 
        ? { lat: latSum / count, lng: lngSum / count }
        : { lat: 28.28562, lng: -81.63381 }; // Fallback
}

// Helper function for notifications
function showNotification(type, message) {
    // Using Bootstrap 5 toast
    const toastHtml = `
        <div class="toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'warning'} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    // Create toast container if doesn't exist
    let toastContainer = document.querySelector('.toast-container');

    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Add and show toast
    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = toastContainer.lastElementChild;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
    
    // Remove after hiding
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Get Directions Function
function getDirections(storeAddress) {
    const isAppleDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const baseUrl = isAppleDevice
        ? "https://maps.apple.com/?daddr="
        : "https://www.google.com/maps/dir/?api=1&destination=";
    const encodedAddress = encodeURIComponent(storeAddress);
    window.open(baseUrl + encodedAddress, '_blank');
}


// Add "Use My Location" button
function geolocation() {

    // Retrieve the geolocation button
    const locationBtn = document.getElementById('geolocation');

    locationBtn.addEventListener('click', () => {
        if (!navigator.geolocation) {
            showNotification('error', 'Geolocation not supported');
            return;
        }

        locationBtn.disabled = true;
        locationBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                
                map.setCenter(pos);
                map.setZoom(13);
                findNearestStore(pos);
                showNotification('success', 'Found nearest store');
                
                locationBtn.disabled = false;
                locationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
            },
            () => {
                locationBtn.disabled = false;
                locationBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
                showNotification('error', 'Unable to get your location');
            }
        );
    });
}

function findNearestStore(userPos) {
    let nearestStore = null;
    let minDistance = Infinity;
    
    markers.forEach(marker => {
        const store = marker.storeData;
        const storePos = { lat: parseFloat(store.latitude), lng: parseFloat(store.longitude) };
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(userPos),
            new google.maps.LatLng(storePos)
        );
        
        if (distance < minDistance) {
            minDistance = distance;
            nearestStore = marker;
        }
    });
    
    if (nearestStore) {
        zoomToStore(nearestStore.storeId);
    }
}

// Initialize Map
async function initMap() {
    try {
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        // Get stores data with error handling
        const storesDataElement = document.getElementById("stores-data");
        if (!storesDataElement) {
            console.error("stores-data element not found");
            return;
        }

        let storesData;
        try {
            storesData = JSON.parse(storesDataElement.textContent);
        } catch (e) {
            console.error("Failed to parse stores data:", e);
            return;
        }

        // Calculate center from stores if available
        let center = { lat: 28.28562, lng: -81.63381 }; // Default
        if (storesData.length > 0) {
            center = calculateCenter(storesData);
        }

        const mapElement = document.getElementById("map");
        if (!mapElement) {
            console.warn("Map element not found");
            return;
        }

        map = new Map(mapElement, {
            zoom: 10.5,
            center: center,
            mapTypeId: "hybrid",
            mapId: "map"
        });

        // Create markers
        storesData.forEach(function(store) {
            if (store.latitude && store.longitude) {
                const marker = createAdvancedMarker(store, AdvancedMarkerElement, map);
                markers.push(marker);
            }
        });
        
    } catch (error) {
        console.error("Error initializing map:", error);
    }
}


document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Zoom to store listeners
    document.querySelectorAll('[data-action="zoom-store"]').forEach(item => {
        item.addEventListener('click', function() {
            const storeId = parseInt(this.dataset.storeId);
            zoomToStore(storeId);
        });
        
        // Keyboard accessibility
        item.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const storeId = parseInt(this.dataset.storeId);
                zoomToStore(storeId);
            }
        });
    });

    // 2. Get directions listeners
    document.querySelectorAll('[data-action="get-directions"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const address = this.dataset.address;
            getDirections(address);
        });
    });

    // 3. Form submission handler
    const addressForm = document.getElementById("address-form");
    
    if (addressForm) {
        addressForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';

            const formData = new FormData(this);
            const params = new URLSearchParams(formData);
            const indexUrl = addressForm.getAttribute("data-url");

            try {
                const response = await fetch(indexUrl + "?" + params.toString(), {
                    headers: { "X-Requested-With": "XMLHttpRequest" }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.closest_store) {
                    zoomToStore(data.closest_store.id);
                    showNotification('success', `Closest store found: ${data.closest_store.name}`);
                } else if (data.errors) {
                    showNotification('error', 'Please enter a valid address');
                } else {
                    showNotification('warning', 'No stores found near this address');
                }
            } catch (error) {
                console.error("Error:", error);
                showNotification('error', 'An error occurred. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    // 4. Add geolocation button
    geolocation();
});

// --------------------
// Expose Global Functions for API Callbacks
// --------------------
window.initMap = initMap;
window.zoomToStore = zoomToStore;
window.getDirections = getDirections;