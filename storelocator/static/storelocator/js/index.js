// CigarCartel/storelocator/static/storelocator/js/index.js

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP's ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);


// About Section Text Animations
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

    // Gold shimmer sweep on company name
    const company = document.querySelector("#about .company-name") || document.querySelector("h1.company-name");

    gsap.fromTo(company,
        { backgroundPosition: "400% center" },   // start left edge
        {
            backgroundPosition: "100% center",   // sweep to right
            duration: 33,                        // elegant, slow
            ease: "power1.inOut",
            repeat: -1,                          // infinite loop

            scrollTrigger: {
                trigger: company,
                start: "top 85%",                // start when in view
                end: "bottom 10%",
                toggleActions: "play reset play reset", // loop on scroll
            }
        }
    );
    
});


// Thumbnail gallery functionality
// --------------------------------
document.addEventListener("DOMContentLoaded", () => {
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
            gsap.to(featuredImage, {
                opacity: 0,
                duration: 0.7,
                filter: 'blur(5px)',

                onComplete: () => {
                    featuredImage.src = thumbnail.src;

                    gsap.to(featuredImage, {
                        opacity: 1,
                        duration: 0.7,
                        filter: 'blur(0px)',
                    });
                }
            });
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