import * as THREE from 'three';

// Global variables for scene and materials
let scene, goldMaterial;


// --------------------
// Age Verification Modal
// --------------------
document.addEventListener('DOMContentLoaded', () => {
    const ageModal = document.getElementById('age-modal');
    const ageYes = document.getElementById('ageYes');
    const ageNo = document.getElementById('ageNo');
    const pageContent = document.getElementById('page-content'); // Reference to the page content

    if (ageModal) {
        ageModal.style.display = 'flex';
        document.body.classList.add('modal-active');

        // Add the 'no-animations' class to pause animations
        if (pageContent) {
            pageContent.classList.add('no-animations');
        }

        ageYes?.addEventListener('click', () => {
            ageModal.style.display = 'none';
            document.body.classList.remove('modal-active');

            // Remove the 'no-animations' class to enable animations
            if (pageContent) {
                pageContent.classList.remove('no-animations');
            }
        });

        ageNo?.addEventListener('click', () => {
            window.location.href = 'https://www.google.com';
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", function () {
        if (window.scrollY > 50) { // adjust threshold if needed
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
});

// --------------------
// Theme Toggle Functionality
// --------------------
function initializeThemeToggle() {
    const themeToggleCheckbox = document.getElementById("theme-toggle");
    const root = document.documentElement;
    const notification = document.getElementById("theme-notification");
    const notificationText = document.getElementById("notification-text");

    if (themeToggleCheckbox) {
        const setTheme = (theme) => {
            root.setAttribute("data-theme", theme);
            localStorage.setItem("theme", theme);

            // Show theme notification
            if (notification && notificationText) {
                notificationText.textContent = `Theme changed to ${theme} mode`;
                notification.style.opacity = "1";
                notification.style.transform = "translateX(0)";
                notification.style.pointerEvents = "auto";

                // Hide notification after 3 seconds
                setTimeout(() => {
                    notification.style.opacity = "0";
                    notification.style.transform = "translateX(30px)";
                    notification.style.pointerEvents = "none";
                }, 3000);
            }
        };

        const savedTheme = localStorage.getItem("theme") || "light";
        setTheme(savedTheme);
        themeToggleCheckbox.checked = savedTheme === "dark";

        themeToggleCheckbox.addEventListener("change", () => {
            const newTheme = themeToggleCheckbox.checked ? "dark" : "light";
            setTheme(newTheme);
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeThemeToggle);

// --------------------
// Update CSS Variable for Header Height
// --------------------
function updateHeaderHeight() {
    const header = document.querySelector('header');
    if (header) {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
}

window.addEventListener('resize', updateHeaderHeight);
document.addEventListener('DOMContentLoaded', updateHeaderHeight);

// --------------------
// Thumbnail gallery functionality
// --------------------
document.addEventListener('DOMContentLoaded', function () {
    const thumbnails = document.querySelectorAll('.cigar-thumbnail');
    const featuredImage = document.querySelector('.featured-cigar');

    // Store original featured image for reset
    const originalFeatured = featuredImage ? featuredImage.src : '';

    if (thumbnails.length > 0 && featuredImage) {
        // Function to handle thumbnail selection
        function selectThumbnail(thumbnail) {
            // Remove active class from all thumbnails
            thumbnails.forEach(t => t.classList.remove('active'));

            // Add active class to clicked thumbnail
            thumbnail.classList.add('active');

            // Swap images with animation
            featuredImage.style.opacity = '0';
            setTimeout(() => {
                featuredImage.src = thumbnail.src;
                featuredImage.style.opacity = '1';
            }, 300);
        }

        // Click event for thumbnails
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function () {
                selectThumbnail(this);
            });

            // Keyboard accessibility
            thumbnail.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectThumbnail(this);
                }
            });
        });

        // Preload images for smoother transitions
        thumbnails.forEach(thumbnail => {
            const img = new Image();
            img.src = thumbnail.src;
        });
    }
});  