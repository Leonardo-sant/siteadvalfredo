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

    // 5. Solutions Horizontal Carousel
    const solutionsTrack = document.getElementById('solutionsTrack');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const progressFill = document.getElementById('carouselProgress');

    if (solutionsTrack && prevBtn && nextBtn && progressFill) {
        // Native, Elegant Carousel without cloning bugs
        const getCardWidth = () => {
            const card = solutionsTrack.querySelector('.solution-card');
            return card ? card.offsetWidth + 24 : 364; // card width + gap
        };

        // Navigation Buttons
        nextBtn.addEventListener('click', () => {
            const maxScroll = solutionsTrack.scrollWidth - solutionsTrack.clientWidth;
            // If already at the very end (with a 10px margin of error) => Loop back to Start
            if (solutionsTrack.scrollLeft >= maxScroll - 10) {
                solutionsTrack.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                solutionsTrack.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
            }
        });

        prevBtn.addEventListener('click', () => {
            // If already at the very beginning => Loop to End
            if (solutionsTrack.scrollLeft <= 10) {
                const maxScroll = solutionsTrack.scrollWidth - solutionsTrack.clientWidth;
                solutionsTrack.scrollTo({ left: maxScroll, behavior: 'smooth' });
            } else {
                solutionsTrack.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
            }
        });

        // Elegant Progress Update
        const updateCarousel = () => {
            const maxScroll = solutionsTrack.scrollWidth - solutionsTrack.clientWidth;
            let percentage = 0;
            
            if (maxScroll > 0) {
                percentage = (solutionsTrack.scrollLeft / maxScroll) * 100;
            }
            
            // Start progress bar at 10% minimum for better visual feedback
            progressFill.style.width = `${Math.max(10, Math.min(percentage, 100))}%`;
        };

        solutionsTrack.addEventListener('scroll', updateCarousel);
        
        // Setup initial progress
        updateCarousel();
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
