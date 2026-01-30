/**
 * GrabKeepWin - Main JavaScript
 * Handles all interactive functionality
 */

(function() {
    'use strict';

    // ================================
    // Configuration
    // ================================
    const CONFIG = {
        PRICE: 39.99,
        CURRENCY: '$',
        COOKIE_NAME: 'gkw_cookies_accepted',
        COOKIE_DAYS: 365
    };

    // ================================
    // DOM Elements
    // ================================
    const elements = {
        header: document.querySelector('.header'),
        navToggle: document.querySelector('.nav-toggle'),
        nav: document.querySelector('.nav'),
        quantityInput: document.getElementById('quantity'),
        totalPrice: document.getElementById('total-price'),
        preorderForm: document.getElementById('preorder-form'),
        waitlistForm: document.getElementById('waitlist-form'),
        cookieBanner: document.getElementById('cookie-banner'),
        acceptCookies: document.getElementById('accept-cookies'),
        rejectCookies: document.getElementById('reject-cookies'),
        cookieSettings: document.getElementById('cookie-settings'),
        filterBtns: document.querySelectorAll('.filter-btn'),
        galleryItems: document.querySelectorAll('.gallery-item'),
        playBtns: document.querySelectorAll('.play-btn')
    };

    // ================================
    // Mobile Navigation
    // ================================
    function initMobileNav() {
        if (!elements.navToggle || !elements.nav) return;

        elements.navToggle.addEventListener('click', () => {
            elements.nav.classList.toggle('open');
            elements.navToggle.classList.toggle('active');
        });

        // Close nav when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav') && !e.target.closest('.nav-toggle')) {
                elements.nav.classList.remove('open');
                elements.navToggle.classList.remove('active');
            }
        });

        // Close nav when clicking nav links
        elements.nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                elements.nav.classList.remove('open');
                elements.navToggle.classList.remove('active');
            });
        });
    }

    // ================================
    // Header Scroll Effect
    // ================================
    function initHeaderScroll() {
        if (!elements.header) return;

        let lastScroll = 0;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                elements.header.classList.add('scrolled');
            } else {
                elements.header.classList.remove('scrolled');
            }

            lastScroll = currentScroll;
        });
    }

    // ================================
    // Quantity Selector
    // ================================
    function initQuantitySelector() {
        if (!elements.quantityInput) return;

        const qtyBtns = document.querySelectorAll('.qty-btn');

        qtyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                let value = parseInt(elements.quantityInput.value) || 1;

                if (action === 'increase' && value < 10) {
                    value++;
                } else if (action === 'decrease' && value > 1) {
                    value--;
                }

                elements.quantityInput.value = value;
                updateTotalPrice(value);
            });
        });

        elements.quantityInput.addEventListener('change', () => {
            let value = parseInt(elements.quantityInput.value) || 1;
            value = Math.max(1, Math.min(10, value));
            elements.quantityInput.value = value;
            updateTotalPrice(value);
        });
    }

    function updateTotalPrice(quantity) {
        if (!elements.totalPrice) return;
        const total = (CONFIG.PRICE * quantity).toFixed(2);
        elements.totalPrice.textContent = `${CONFIG.CURRENCY}${total}`;
    }

    // ================================
    // Form Handling
    // ================================
    function initForms() {
        // Pre-order form
        if (elements.preorderForm) {
            elements.preorderForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(elements.preorderForm);
                const data = {
                    email: formData.get('email'),
                    name: formData.get('name'),
                    quantity: formData.get('quantity')
                };

                // Track event
                trackEvent('begin_checkout', {
                    value: CONFIG.PRICE * data.quantity,
                    currency: 'USD',
                    items: [{
                        item_name: 'GrabKeepWin Set',
                        quantity: data.quantity,
                        price: CONFIG.PRICE
                    }]
                });

                // TODO: Integrate with Stripe or your payment processor
                // For now, show a message
                alert('Pre-order functionality coming soon! We\'ll notify you when payments are live.');

                console.log('Pre-order data:', data);
            });
        }

        // Waitlist form
        if (elements.waitlistForm) {
            elements.waitlistForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(elements.waitlistForm);
                const email = formData.get('email');
                const marketing = document.querySelector('input[name="marketing"]')?.checked || false;

                // Track event
                trackEvent('lead', {
                    content_name: 'Waitlist Signup',
                    email_consent: marketing
                });

                // TODO: Integrate with your email service (Mailchimp, Brevo, etc.)
                alert('Thanks for joining the waitlist! We\'ll keep you updated.');

                elements.waitlistForm.reset();
                console.log('Waitlist signup:', { email, marketing });
            });
        }
    }

    // ================================
    // Video Gallery
    // ================================
    function initVideoGallery() {
        // Filter buttons
        elements.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;

                // Update active button
                elements.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filter gallery items
                elements.galleryItems.forEach(item => {
                    const categories = item.dataset.category || '';

                    if (filter === 'all' || categories.includes(filter)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });

        // Play buttons
        elements.playBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = btn.closest('.gallery-item');
                const video = item.querySelector('video');

                if (video) {
                    if (video.paused) {
                        // Pause all other videos
                        document.querySelectorAll('.gallery-item video').forEach(v => {
                            if (v !== video) {
                                v.pause();
                                v.closest('.gallery-item').classList.remove('playing');
                            }
                        });

                        video.play();
                        item.classList.add('playing');

                        // Track video play
                        trackEvent('video_play', {
                            video_title: item.dataset.category || 'gallery_video'
                        });
                    } else {
                        video.pause();
                        item.classList.remove('playing');
                    }
                }
            });
        });

        // Reset playing state when video ends
        elements.galleryItems.forEach(item => {
            const video = item.querySelector('video');
            if (video) {
                video.addEventListener('ended', () => {
                    item.classList.remove('playing');
                });
            }
        });
    }

    // ================================
    // Cookie Banner
    // ================================
    function initCookieBanner() {
        if (!elements.cookieBanner) return;

        // Check if user already made a choice
        if (!getCookie(CONFIG.COOKIE_NAME)) {
            elements.cookieBanner.hidden = false;
        }

        elements.acceptCookies?.addEventListener('click', () => {
            setCookie(CONFIG.COOKIE_NAME, 'accepted', CONFIG.COOKIE_DAYS);
            elements.cookieBanner.hidden = true;
            enableAnalytics();
        });

        elements.rejectCookies?.addEventListener('click', () => {
            setCookie(CONFIG.COOKIE_NAME, 'rejected', CONFIG.COOKIE_DAYS);
            elements.cookieBanner.hidden = true;
        });

        elements.cookieSettings?.addEventListener('click', () => {
            elements.cookieBanner.hidden = false;
        });
    }

    // ================================
    // Cookie Helpers
    // ================================
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
    }

    function getCookie(name) {
        const nameEQ = name + '=';
        const cookies = document.cookie.split(';');

        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length, cookie.length);
            }
        }
        return null;
    }

    // ================================
    // Analytics
    // ================================
    function enableAnalytics() {
        // Enable GA4 if available
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }

        // Enable Meta Pixel if available
        if (typeof fbq !== 'undefined') {
            fbq('consent', 'grant');
        }

        console.log('Analytics enabled');
    }

    function trackEvent(eventName, params = {}) {
        // GA4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, params);
        }

        // Meta Pixel
        if (typeof fbq !== 'undefined') {
            fbq('track', eventName, params);
        }

        // TikTok Pixel
        if (typeof ttq !== 'undefined') {
            ttq.track(eventName, params);
        }

        console.log('Track event:', eventName, params);
    }

    // ================================
    // Smooth Scroll
    // ================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                if (href === '#') return;

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    const headerHeight = elements.header?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Track navigation
                    trackEvent('click', {
                        link_text: this.textContent,
                        link_url: href
                    });
                }
            });
        });
    }

    // ================================
    // Lazy Load Videos
    // ================================
    function initLazyLoadVideos() {
        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const video = entry.target;
                        const source = video.querySelector('source');

                        if (source && source.dataset.src) {
                            source.src = source.dataset.src;
                            video.load();
                        }

                        videoObserver.unobserve(video);
                    }
                });
            }, {
                rootMargin: '100px'
            });

            document.querySelectorAll('video[data-lazy]').forEach(video => {
                videoObserver.observe(video);
            });
        }
    }

    // ================================
    // Track Page View
    // ================================
    function trackPageView() {
        trackEvent('view_content', {
            content_name: 'GrabKeepWin Landing Page',
            content_type: 'product'
        });
    }

    // ================================
    // Initialize
    // ================================
    function init() {
        initMobileNav();
        initHeaderScroll();
        initQuantitySelector();
        initForms();
        initVideoGallery();
        initCookieBanner();
        initSmoothScroll();
        initLazyLoadVideos();

        // Track page view after consent check
        if (getCookie(CONFIG.COOKIE_NAME) === 'accepted') {
            enableAnalytics();
            trackPageView();
        }

        console.log('GrabKeepWin initialized');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
