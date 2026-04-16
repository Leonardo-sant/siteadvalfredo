document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header Functionality
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });

    // 2. Mobile Menu Toggle (Simplified)
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if(mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            // This could expand to a full mobile menu implementation
            // For now, toggle a class that you can style if needed
            mobileToggle.classList.toggle('active');
            if (navMenu.style.display === 'block') {
                navMenu.style.display = 'none';
            } else {
                navMenu.style.display = 'block';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '100%';
                navMenu.style.left = '0';
                navMenu.style.width = '100%';
                navMenu.style.backgroundColor = 'rgba(7, 14, 28, 0.95)';
                navMenu.style.padding = '2rem';
                navMenu.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                
                const ul = navMenu.querySelector('ul');
                ul.style.flexDirection = 'column';
                ul.style.alignItems = 'center';
                ul.style.gap = '1.5rem';
            }
        });
    }

    // 3. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if(targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            
            if(targetElement) {
                // Adjust scroll position for fixed header
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                if (window.innerWidth <= 768 && navMenu.style.display === 'block') {
                    navMenu.style.display = 'none';
                    mobileToggle.classList.remove('active');
                }
            }
        });
    });

    // 4. Scroll Animations using Intersection Observer
    const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };
    
    const animationObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => {
        animationObserver.observe(el);
    });

    // 5. Solutions Carousel — Pure Transform Engine (GPU only, zero layout)
    const track = document.getElementById('solutionsTrack');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const progressFill = document.getElementById('carouselProgress');

    if (track && prevBtn && nextBtn && progressFill) {
        const cards = track.querySelectorAll('.solution-card');
        let pos = 0;        // current translateX offset (positive = scrolled right)
        let cardW = 0;      // card width
        let gap = 0;        // gap between cards
        let step = 0;       // cardW + gap
        let maxPos = 0;     // maximum translateX
        let viewW = 0;      // viewport width

        // Measure dimensions (call on load & resize)
        function measure() {
            if (!cards.length) return;
            cardW = cards[0].offsetWidth;
            gap = parseFloat(getComputedStyle(track).gap) || 24;
            step = cardW + gap;
            viewW = track.parentElement.offsetWidth;
            const trackW = cards.length * step - gap;
            maxPos = Math.max(0, trackW - viewW + parseFloat(getComputedStyle(track).paddingLeft) * 2);
            // Clamp current position
            pos = Math.max(0, Math.min(pos, maxPos));
            applyTransform(true);
        }

        // Apply transform (animate = use CSS transition)
        function applyTransform(animate) {
            if (animate) {
                track.classList.remove('is-dragging');
            } else {
                track.classList.add('is-dragging');
            }
            track.style.transform = `translate3d(${-pos}px, 0, 0)`;
            updateProgress();
        }

        function updateProgress() {
            const pct = maxPos > 0 ? (pos / maxPos) * 100 : 0;
            progressFill.style.width = `${Math.max(5, Math.min(pct, 100))}%`;
        }

        // --- Button Navigation ---
        nextBtn.addEventListener('click', () => {
            if (pos >= maxPos - 5) {
                pos = 0;  // Loop to start
            } else {
                pos = Math.min(pos + step, maxPos);
            }
            applyTransform(true);
        });

        prevBtn.addEventListener('click', () => {
            if (pos <= 5) {
                pos = maxPos;  // Loop to end
            } else {
                pos = Math.max(pos - step, 0);
            }
            applyTransform(true);
        });

        // --- Drag / Swipe (Pointer Events — mouse + touch) ---
        let dragging = false;
        let startX = 0;
        let startPos = 0;
        let lastX = 0;
        let lastT = 0;
        let vel = 0;
        let momentumRAF = null;

        track.addEventListener('pointerdown', (e) => {
            // Cancel any running momentum
            if (momentumRAF) { cancelAnimationFrame(momentumRAF); momentumRAF = null; }
            dragging = true;
            startX = e.clientX;
            startPos = pos;
            lastX = e.clientX;
            lastT = performance.now();
            vel = 0;
            track.setPointerCapture(e.pointerId);
            applyTransform(false); // Disable CSS transition during drag
        });

        track.addEventListener('pointermove', (e) => {
            if (!dragging) return;
            const dx = startX - e.clientX;
            pos = Math.max(0, Math.min(startPos + dx, maxPos));
            track.style.transform = `translate3d(${-pos}px, 0, 0)`;

            // Track velocity
            const now = performance.now();
            const dt = now - lastT;
            if (dt > 0) {
                vel = (lastX - e.clientX) / dt; // px/ms
            }
            lastX = e.clientX;
            lastT = now;
            updateProgress();
        });

        function endDrag() {
            if (!dragging) return;
            dragging = false;

            // Apply momentum then snap
            const friction = 0.93;
            const applyMomentum = () => {
                if (Math.abs(vel) < 0.08) {
                    // Snap to nearest card boundary
                    pos = Math.round(pos / step) * step;
                    pos = Math.max(0, Math.min(pos, maxPos));
                    applyTransform(true);
                    return;
                }
                pos += vel * 16;
                pos = Math.max(0, Math.min(pos, maxPos));
                vel *= friction;
                track.style.transform = `translate3d(${-pos}px, 0, 0)`;
                updateProgress();

                // If hit bounds, stop momentum
                if (pos <= 0 || pos >= maxPos) {
                    pos = Math.max(0, Math.min(pos, maxPos));
                    applyTransform(true);
                    return;
                }
                momentumRAF = requestAnimationFrame(applyMomentum);
            };
            momentumRAF = requestAnimationFrame(applyMomentum);
        }

        track.addEventListener('pointerup', endDrag);
        track.addEventListener('pointercancel', endDrag);

        // Block click events if the user dragged
        track.addEventListener('click', (e) => {
            if (Math.abs(pos - startPos) > 5) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        // Init & resize
        measure();
        window.addEventListener('resize', () => { measure(); });
    }

    // 6. Contact Form to WhatsApp Integration
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const message = document.getElementById('message').value;
            
            // Format WhatsApp Message
            const whatsappNumber = "558587804612";
            const text = `*Nova Mensagem de Contato - Site*\n\n` +
                         `*Nome:* ${name}\n` +
                         `*E-mail:* ${email}\n` +
                         `*WhatsApp:* ${phone}\n\n` +
                         `*Necessidade Jurídica:*\n${message}`;
            
            const encodedText = encodeURIComponent(text);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
            
            // Open in new tab
            window.open(whatsappUrl, '_blank');
        });
    }
});
