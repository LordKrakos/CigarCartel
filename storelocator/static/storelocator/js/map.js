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

        const contentString = `
            <div class="info-window fade-in">
                <h3>${store.name}</h3>
                <p class="info-address">${store.address}</p>
                <p class="info-city">${store["city__name"]}, ${store.city__state__abbreviation} ${store.zip_code}</p>
                <p class="info-phone"><b>Phone:</b> ${store.phone_number}</p>
                <p class="info-email"><b>Email:</b> ${store.email}</p>
                <p class="info-hours"><b>Hours:</b> 8:00 AM - 1:00 AM</p>
                <a href="${directionsUrl}" target="_blank" class="get-directions">Get Directions</a>
            </div>
        `;

        currentInfoWindow = new google.maps.InfoWindow({ content: contentString });
        currentInfoWindow.open(map, marker);
    }, 150); // brief pause
}


function zoomToStore(storeId) {

    // Close any existing info window immediately.
    if (currentInfoWindow) {
        currentInfoWindow.close();
    }
    
    const marker = markers.find(m => m.storeId == storeId);
    if (marker) {
        // If a store is already selected and it differs from the newly requested store,
        // zoom out to a default level first (e.g., 12) then re-center and zoom in.
        if (currentStoreId !== null && currentStoreId !== storeId) {
            stepZoomWithCallback(12, 250, function() {
                // After zooming out, center on the new marker and zoom in.
                map.setCenter(marker.position);
                stepZoomWithCallback(17, 300, function() {
                    currentStoreId = storeId;
                    openInfoWindow(marker);
                });
            });
        } else {
            // If no store is currently selected, or if the same store is selected,
            // just center on it and zoom in.
            map.setCenter(marker.position);
            stepZoomWithCallback(17, 250, function() {
                currentStoreId = storeId;
                openInfoWindow(marker);
            });
        }
    }
}

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // Default center (adjust as needed)
    const center = { lat: 28.28562, lng: -81.63381 };
    map = new Map(document.getElementById("map"), {
        zoom: 11,
        center: center,
        mapTypeId: "hybrid",
        mapId: "map"
    });

    // Parse store data once and create markers.
    storesDataGlobal = JSON.parse(document.getElementById("stores-data").textContent);
    storesDataGlobal.forEach(function(store) {
        if (store.latitude && store.longitude) {
            const marker = createAdvancedMarker(store, AdvancedMarkerElement, map);
            markers.push(marker);
        }
    });
}

function getDirections(storeAddress) {
    const isAppleDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const baseUrl = isAppleDevice
        ? "https://maps.apple.com/?daddr="
        : "https://www.google.com/maps/dir/?api=1&destination=";
    const encodedAddress = encodeURIComponent(storeAddress);
    window.open(baseUrl + encodedAddress, '_blank');
}

// Place this in a JS file that loads on your page (after the DOM is ready)
document.addEventListener("DOMContentLoaded", function() {

    const addressForm = document.getElementById("address-form");

    addressForm.addEventListener("submit", function(event) {
        
        event.preventDefault(); // Prevent page reload

        const formData = new FormData(this);
        const params = new URLSearchParams(formData);
        const indexUrl = addressForm.getAttribute("data-url");

        fetch(indexUrl + "?" + params.toString(), {
            headers: { "X-Requested-With": "XMLHttpRequest" }
        })

        .then(response => response.json())

        .then(data => {
            if (data.closest_store) {
                zoomToStore(data.closest_store.id);
            } else if (data.errors) {
                alert("Error: " + JSON.stringify(data.errors));
            } else {
                alert("No store found or geocoding failed.");
            }
        })
        
        .catch(error => {
            console.error("Error:", error);
        });
    });
});

// --------------------
// Expose Global Functions for API Callbacks
// --------------------
window.initMap = initMap;
window.zoomToStore = zoomToStore;
// Expose the function globally
window.getDirections = getDirections;

