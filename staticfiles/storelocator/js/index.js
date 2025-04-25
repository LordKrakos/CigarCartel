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

    if (ageModal) {
        ageModal.style.display = 'flex';
        document.body.classList.add('modal-active');

        ageYes?.addEventListener('click', () => {
            ageModal.style.display = 'none';
            document.body.classList.remove('modal-active');
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

    if (themeToggleCheckbox) {
        const setTheme = (theme) => {
            root.setAttribute("data-theme", theme);
            localStorage.setItem("theme", theme);
            updateSceneTheme();
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
        hero.innerHTML = "<p>Your browser does not support WebGL. Please update your browser or enable WebGL.</p>";
        return;
    }

    const isMobile = window.innerWidth < 768;
    const goldCount = isMobile ? 1500 : 3000; // Adjust particle count for mobile devices

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
        goldPositions[i * 3] = (Math.random() - 0.5) * 40;
        goldPositions[i * 3 + 1] = Math.random() * 20;
        goldPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        goldVelocities[i * 3] = (Math.random() - 0.7) * 0.001;
        goldVelocities[i * 3 + 1] = (Math.random() - 0.7) * 0.001;
        goldVelocities[i * 3 + 2] = (Math.random() - 0.7) * 0.001;
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
            goldArray[i] += goldVelocities[i] * delta * 100;
            goldArray[i + 1] += goldVelocities[i + 1] * delta * 100;
            goldArray[i + 2] += goldVelocities[i + 2] * delta * 100;
            if (goldArray[i] > 20) goldArray[i] = -20;
            if (goldArray[i] < -20) goldArray[i] = 20;
            if (goldArray[i + 1] > 30) goldArray[i + 1] = 0;
            if (goldArray[i + 1] < 0) goldArray[i + 1] = 30;
            if (goldArray[i + 2] > 20) goldArray[i + 2] = -20;
            if (goldArray[i + 2] < -20) goldArray[i + 2] = 20;
        }
        goldParticles.geometry.attributes.position.needsUpdate = true;
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