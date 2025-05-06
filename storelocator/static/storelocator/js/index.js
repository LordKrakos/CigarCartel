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

// --------------------
// Theme Toggle Functionality
// --------------------
function updateSceneTheme() {
    const styles = getComputedStyle(document.documentElement);
    const bgColor = styles.getPropertyValue('--background').trim();
    const fogColor = styles.getPropertyValue('--fog').trim();
    const dustColor = styles.getPropertyValue('--dust').trim();

    if (scene) {
        scene.background = new THREE.Color(bgColor);
        scene.fog.color.set(fogColor);
    }

    if (goldMaterial) {
        goldMaterial.color.set(dustColor);
        const isLightTheme = document.documentElement.getAttribute('data-theme') === 'light';
        goldMaterial.opacity = isLightTheme ? 1 : 1.0;
        goldMaterial.blending = isLightTheme ? THREE.NormalBlending : THREE.AdditiveBlending;
        goldMaterial.needsUpdate = true;
    }
}

function initializeThemeToggle() {
    const themeToggleCheckbox = document.getElementById("theme-toggle");
    const root = document.documentElement;
    const notification = document.getElementById("theme-notification");
    const notificationText = document.getElementById("notification-text");

    if (themeToggleCheckbox) {
        const setTheme = (theme) => {
            root.setAttribute("data-theme", theme);
            localStorage.setItem("theme", theme);
            updateSceneTheme();

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
// Create Gold Texture
// --------------------
function createGoldTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 204, 36, 1)');
    gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

// Thumbnail gallery functionality
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

// --------------------
// Initialize Hero Section
// --------------------
function initHeroSection() {
    const hero = document.getElementById('hero');
    if (!hero) {
        console.error("No element with id 'hero' was found.");
        return;
    }

    if (!THREE.WebGLRenderer) {
        console.error("WebGL is not supported in this browser.");
        hero.innerHTML = "<p>We're sorry, but your browser doesn't support the full 3D experience on this page. Please update your browser or switch devices to enjoy our full features!</p>";
        return;
    }

    const isMobile = window.innerWidth < 768;
    const goldCount = isMobile ? 1500 : 5000; // Increased particle count for both mobile and desktop devices

    const width = hero.clientWidth;
    const height = hero.clientHeight;
    if (width === 0 || height === 0) {
        console.error("Hero container has zero width or height.");
        return;
    }

    // Initialize global scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x00000000);
    scene.fog = new THREE.FogExp2(0x00000000, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 25, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    hero.appendChild(renderer.domElement);

    // Add lights
    scene.add(new THREE.AmbientLight(0x222222, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(5, 10, 7.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // Create gold particles
    const goldGeometry = new THREE.BufferGeometry();
    const goldPositions = new Float32Array(goldCount * 3);
    const goldVelocities = new Float32Array(goldCount * 3);

    for (let i = 0; i < goldCount; i++) {
        goldPositions[i * 3] = (Math.random() - 0.5) * 40; // X-axis: Spread particles evenly horizontally
        goldPositions[i * 3 + 1] = Math.random() * 40 - 10; // Y-axis: Adjust range to distribute particles vertically
        goldPositions[i * 3 + 2] = (Math.random() - 0.5) * 40; // Z-axis: Spread particles evenly in depth

        goldVelocities[i * 3] = (Math.random() - 0.5) * 0.01; // X-axis velocity
        goldVelocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01; // Y-axis velocity
        goldVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01; // Z-axis velocity
    }
    goldGeometry.setAttribute('position', new THREE.BufferAttribute(goldPositions, 3));

    const goldTexture = createGoldTexture();
    goldMaterial = new THREE.PointsMaterial({
        map: goldTexture,
        color: 0xFFD700,
        size: 4,
        sizeAttenuation: false,
        transparent: true,
        opacity: 1.0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });

    const goldParticles = new THREE.Points(goldGeometry, goldMaterial);
    scene.add(goldParticles);

    // Apply initial theme settings
    updateSceneTheme();

    // Animation loop
    const clock = new THREE.Clock();
    function animate() {
        const delta = clock.getDelta();
        requestAnimationFrame(animate);

        const goldArray = goldParticles.geometry.attributes.position.array;
        for (let i = 0; i < goldArray.length; i += 3) {
            goldArray[i] += goldVelocities[i] * delta * 20; // Further reduced speed multiplier for X-axis
            goldArray[i + 1] += goldVelocities[i + 1] * delta * 20; // Further reduced speed multiplier for Y-axis
            goldArray[i + 2] += goldVelocities[i + 2] * delta * 20; // Further reduced speed multiplier for Z-axis
            if (goldArray[i] > 20) goldArray[i] = -20;
            if (goldArray[i] < -20) goldArray[i] = 20;
            if (goldArray[i + 1] > 30) goldArray[i + 1] = 0;
            if (goldArray[i + 1] < 0) goldArray[i + 1] = 30;
            if (goldArray[i + 2] > 20) goldArray[i + 2] = -20;
            if (goldArray[i + 2] < -20) goldArray[i + 2] = 20;

        }
        if (renderer.info.render.frame % 2 === 0) { 
            // Only update positions every 2 frames (saves a lot)
            goldParticles.geometry.attributes.position.needsUpdate = true;
        }
        scene.rotation.y += delta * 0.03;
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newWidth = hero.clientWidth;
            const newHeight = hero.clientHeight;
            renderer.setSize(newWidth, newHeight);
            camera.aspect = newWidth / newHeight;
            camera.fov = newWidth < 768 ? 60 : 45;
            camera.updateProjectionMatrix();
        }, 200);
    });
}

document.addEventListener('DOMContentLoaded', initHeroSection);
    