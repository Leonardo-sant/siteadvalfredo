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
        const cards = Array.from(solutionsTrack.querySelectorAll('.solution-card'));
        const cardCount = cards.length;
        const cloneCount = 4; // Clone 4 to ensure enough visual coverage for seamless jumping

        // 1. Clone cards for infinite effect
        // Append first cards to end
        for(let i=0; i < cloneCount; i++) {
            const clone = cards[i].cloneNode(true);
            solutionsTrack.appendChild(clone);
        }
        // Prepend last cards to beginning
        for(let i = cardCount - 1; i >= cardCount - cloneCount; i--) {
            const clone = cards[i].cloneNode(true);
            solutionsTrack.prepend(clone);
        }

        // 2. Constants for measurement
        const getCardWidth = () => {
            const card = solutionsTrack.querySelector('.solution-card');
            return card ? card.offsetWidth + 24 : 364; // card width + gap
        };

        // 3. Initial Position: Scroll past clones at the start
        const setInitialPosition = () => {
            const offset = getCardWidth() * cloneCount;
            solutionsTrack.scrollLeft = offset;
        };

        // Wait for images/layout to settle
        window.addEventListener('load', setInitialPosition);
        setTimeout(setInitialPosition, 500);

        // 4. Navigation Buttons
        nextBtn.addEventListener('click', () => {
            solutionsTrack.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            solutionsTrack.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
        });

        // 5. Seamless Loop & Progress Update
        let isJumping = false;
        const updateCarousel = () => {
            if (isJumping) return;

            const scrollLeft = solutionsTrack.scrollLeft;
            const cardWidth = getCardWidth();
            const startOffset = cardWidth * cloneCount;
            const endOffset = cardWidth * cardCount;

            // Infinite Jump Check (Logical Start/End)
            if (scrollLeft <= 5) { // At the clones-start
                isJumping = true;
                const oldSnap = solutionsTrack.style.scrollSnapType;
                solutionsTrack.style.scrollSnapType = 'none'; // Disable snap for jump
                solutionsTrack.scrollLeft = endOffset;
                setTimeout(() => {
                    solutionsTrack.style.scrollSnapType = oldSnap;
                    isJumping = false;
                }, 50);
            } else if (scrollLeft >= (endOffset + startOffset - 20)) { // At the clones-end
                isJumping = true;
                const oldSnap = solutionsTrack.style.scrollSnapType;
                solutionsTrack.style.scrollSnapType = 'none';
                solutionsTrack.scrollLeft = startOffset;
                setTimeout(() => {
                    solutionsTrack.style.scrollSnapType = oldSnap;
                    isJumping = false;
                }, 50);
            }

            // Update Progress Bar (Based on real items index)
            const relativeScroll = scrollLeft - startOffset;
            const maxScroll = cardWidth * (cardCount - 1);
            const percentage = (relativeScroll / maxScroll) * 100;
            progressFill.style.width = `${Math.max(10, Math.min(percentage, 100))}%`;
        };

        solutionsTrack.addEventListener('scroll', updateCarousel);
        window.addEventListener('resize', setInitialPosition);
    }
});
