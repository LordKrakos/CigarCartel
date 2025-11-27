// smokeshop/storelocator/static/storelocator/js/index.js

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Register GSAP's ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger, SplitText);

// Scroll-triggered panel animations
// ----------------------------------
document.addEventListener("DOMContentLoaded", () => {

    // Retrieve all panels
    const panels = gsap.utils.toArray('.sub-panel');
    // Get the total number of panels
    const totalPanels = panels.length;

    // Create a timeline
    const tl = gsap.timeline({

        // Configure ScrollTrigger
        scrollTrigger: {
            // Set the element that triggers the animation
            trigger: '#about',
            // Define the start and end points for the animation
            start: 'top 64px',
            // Calculate the end point based on the number of panels
            end: () => `+=${window.innerHeight * totalPanels}`,
            // Pin the trigger element during the animation
            pin: true,
            // Add spacing to the pinned element
            pinSpacing: true,
            // Enable scrubbing for smooth scrolling
            scrub: 1.2,
        }

    });

    // Animate each panel sequentially
    panels.forEach((panel, i) => {

        tl.from(panel, {
            xPercent: i % 2 === 0 ? -100 : 100,
            opacity: 0,
            delay: 0.3,
        }, i); // add at index so it progresses panel-by-panel

    });
});


// About Section Text Animations
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

    // Gold shimmer sweep on company name
    const company = document.querySelector(".company-name");

    gsap.fromTo(".company-name",
        { backgroundPosition: "400% center" },   // start left edge
        {
            backgroundPosition: "100% center",   // sweep to right
            duration: 15,                        // elegant, slow
            ease: "power1.inOut",
            repeat: -1,                          // infinite loop
            delay: 10,                           // brief pause

            scrollTrigger: {
                trigger: ".company-name",
                start: "top 85%",                // start when in view
                end: "bottom 10%",
                toggleActions: "play pause resume pause",
                once: false,                     // keeps looping
            }
        }
    );


    // 3. Line-by-line reveal for each <li>
    document.fonts.ready.then(() => {
        const listItems = gsap.utils.toArray("#thanks .split-text");
        if (listItems.length > 0) {

            listItems.forEach((item) => {
                const splitWords = new SplitText(item, { type: "words" });

                gsap.from(splitWords.words, {
                    yPercent: 'random([-100, 100])',
                    autoAlpha: 0,
                    stagger: {
                        amount: 3,
                        from: 'random'
                    },
                    scrollTrigger: {
                        trigger: item,
                        start: "top 85%",
                        toggleActions: "restart pause reverse pause",
                    }
                });
            });
        }
    });

    // 4. Gentle fade for the footer CTA
    
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