document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // Theme Management System
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    const currentTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(currentTheme);

    themeToggle.addEventListener('click', () => {
        const targetTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(targetTheme);
    });

    function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }

    // ==========================================
    // Navbar: Scroll & Active Link
    // ==========================================
    const navbar = document.getElementById('navbar');
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    const navOverlay = document.getElementById('nav-overlay');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 80);
        highlightNavLink();
    }, { passive: true });

    function highlightNavLink() {
        const sections = document.querySelectorAll('section, header');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const id = section.getAttribute('id');
            if (!id) return;
            const offset = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPos >= offset && scrollPos < offset + height) {
                document.querySelectorAll('.nav-menu a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
                });
            }
        });
    }

    // ==========================================
    // Mobile Menu Toggle
    // ==========================================
    function openMenu() {
        navMenu.classList.add('active');
        navOverlay.classList.add('active');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        body.style.overflow = 'hidden'; // Prevent background scroll
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        navOverlay.classList.remove('active');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';
    }

    hamburger.addEventListener('click', () => {
        navMenu.classList.contains('active') ? closeMenu() : openMenu();
    });

    // Close on overlay click
    navOverlay.addEventListener('click', closeMenu);

    // Close on Escape
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) closeMenu();
    });

    // ==========================================
    // Smooth Scroll + Auto-Close Mobile Menu
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                closeMenu();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // Intersection Observer – Reveal Animations
    // ==========================================
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('appear');
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));

    // ==========================================
    // Hover Parallax for Cards (Desktop only)
    // ==========================================
    const parallaxCards = document.querySelectorAll('.p-method-card, .coach-box');
    parallaxCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 992) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 25;
            const rotateY = (centerX - x) / 25;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ==========================================
    // Packages Carousel / Slider
    // ==========================================
    const sliderTrack = document.getElementById('packages-track');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dotsContainer = document.getElementById('slider-dots');

    if (sliderTrack && prevBtn && nextBtn && dotsContainer) {
        const sliderCards = sliderTrack.querySelectorAll('.package-card');
        const totalCards = sliderCards.length;
        let currentIndex = 0;

        function getVisibleCount() {
            if (window.innerWidth <= 600) return 1;
            if (window.innerWidth <= 991) return 2;
            return 3;
        }

        function buildDots() {
            dotsContainer.innerHTML = '';
            const visible = getVisibleCount();
            const totalSteps = totalCards - visible + 1;
            for (let i = 0; i < totalSteps; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            }
        }

        function goTo(index) {
            const visible = getVisibleCount();
            const maxIndex = totalCards - visible;
            currentIndex = Math.max(0, Math.min(index, maxIndex));

            const cardWidth = sliderCards[0].offsetWidth;
            const gap = 30;
            const offset = currentIndex * (cardWidth + gap);
            sliderTrack.style.transform = `translateX(-${offset}px)`;

            document.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });

            prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
            prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
            nextBtn.style.opacity = currentIndex >= maxIndex ? '0.4' : '1';
            nextBtn.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'auto';
        }

        prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
        nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

        // ----------------------------------------
        // Touch Swipe Support (with velocity)
        // ----------------------------------------
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let isDragging = false;

        sliderTrack.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            isDragging = true;
        }, { passive: true });

        sliderTrack.addEventListener('touchmove', e => {
            if (!isDragging) return;
            const dx = Math.abs(e.touches[0].clientX - touchStartX);
            const dy = Math.abs(e.touches[0].clientY - touchStartY);
            // If horizontal swipe is dominant, prevent page scroll
            if (dx > dy && dx > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        sliderTrack.addEventListener('touchend', e => {
            if (!isDragging) return;
            isDragging = false;
            const delta = touchStartX - e.changedTouches[0].clientX;
            const duration = Date.now() - touchStartTime;
            const velocity = Math.abs(delta) / duration;

            // Swipe if delta > 40px OR fast flick (velocity > 0.3)
            if (Math.abs(delta) > 40 || velocity > 0.3) {
                delta > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
            }
        });

        // Re-init on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                buildDots();
                goTo(0);
            }, 200);
        });

        buildDots();
        goTo(0);
    }

    // ==========================================
    // Coaches Carousel / Slider
    // ==========================================
    const coachTrack = document.getElementById('coaches-track');
    const coachPrevBtn = document.getElementById('coach-prev');
    const coachNextBtn = document.getElementById('coach-next');
    const coachDotsContainer = document.getElementById('coach-dots');

    if (coachTrack && coachPrevBtn && coachNextBtn && coachDotsContainer) {
        const coachCards = coachTrack.querySelectorAll('.coach-box');
        const totalCoaches = coachCards.length;
        let cIndex = 0;

        function getVisibleCoachesCount() {
            if (window.innerWidth <= 600) return 1;
            if (window.innerWidth <= 991) return 2;
            return 3;
        }

        function buildCoachDots() {
            coachDotsContainer.innerHTML = '';
            const visible = getVisibleCoachesCount();
            const totalSteps = totalCoaches - visible + 1;
            for (let i = 0; i < totalSteps; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goCoachTo(i));
                coachDotsContainer.appendChild(dot);
            }
        }

        function goCoachTo(index) {
            const visible = getVisibleCoachesCount();
            const maxIndex = totalCoaches - visible;
            cIndex = Math.max(0, Math.min(index, maxIndex));

            const cardWidth = coachCards[0].offsetWidth;
            const gap = 30; // matches CSS gap
            const offset = cIndex * (cardWidth + gap);
            coachTrack.style.transform = `translateX(-${offset}px)`;

            coachDotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === cIndex);
            });

            coachPrevBtn.style.opacity = cIndex === 0 ? '0.4' : '1';
            coachPrevBtn.style.pointerEvents = cIndex === 0 ? 'none' : 'auto';
            coachNextBtn.style.opacity = cIndex >= maxIndex ? '0.4' : '1';
            coachNextBtn.style.pointerEvents = cIndex >= maxIndex ? 'none' : 'auto';
        }

        coachPrevBtn.addEventListener('click', () => goCoachTo(cIndex - 1));
        coachNextBtn.addEventListener('click', () => goCoachTo(cIndex + 1));

        // Touch Swipe Support
        let cTouchStartX = 0;
        let cTouchStartY = 0;
        let cTouchStartTime = 0;
        let cIsDragging = false;

        coachTrack.addEventListener('touchstart', e => {
            cTouchStartX = e.touches[0].clientX;
            cTouchStartY = e.touches[0].clientY;
            cTouchStartTime = Date.now();
            cIsDragging = true;
        }, { passive: true });

        coachTrack.addEventListener('touchmove', e => {
            if (!cIsDragging) return;
            const dx = Math.abs(e.touches[0].clientX - cTouchStartX);
            const dy = Math.abs(e.touches[0].clientY - cTouchStartY);
            if (dx > dy && dx > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        coachTrack.addEventListener('touchend', e => {
            if (!cIsDragging) return;
            cIsDragging = false;
            const delta = cTouchStartX - e.changedTouches[0].clientX;
            const duration = Date.now() - cTouchStartTime;
            const velocity = Math.abs(delta) / duration;

            if (Math.abs(delta) > 40 || velocity > 0.3) {
                delta > 0 ? goCoachTo(cIndex + 1) : goCoachTo(cIndex - 1);
            }
        });

        // Re-init on resize
        let cResizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(cResizeTimer);
            cResizeTimer = setTimeout(() => {
                buildCoachDots();
                goCoachTo(0);
            }, 200);
        });

        buildCoachDots();
        goCoachTo(0);
    }

    // ==========================================
    // Testimonials Carousel / Slider
    // ==========================================
    const testTrack = document.getElementById('test-track');
    const testPrevBtn = document.getElementById('test-prev');
    const testNextBtn = document.getElementById('test-next');
    const testDotsContainer = document.getElementById('test-dots');

    if (testTrack && testPrevBtn && testNextBtn && testDotsContainer) {
        const testCards = testTrack.querySelectorAll('.test-card');
        const totalTests = testCards.length;
        let tIndex = 0;

        function getVisibleTestCount() {
            if (window.innerWidth <= 600) return 1;
            if (window.innerWidth <= 991) return 2;
            return 3;
        }

        function buildTestDots() {
            testDotsContainer.innerHTML = '';
            const visible = getVisibleTestCount();
            const totalSteps = totalTests - visible + 1;
            for (let i = 0; i < totalSteps; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => goTestTo(i));
                testDotsContainer.appendChild(dot);
            }
        }

        function goTestTo(index) {
            const visible = getVisibleTestCount();
            const maxIndex = totalTests - visible;
            tIndex = Math.max(0, Math.min(index, maxIndex));

            const cardWidth = testCards[0].offsetWidth;
            const gap = 24; // matches CSS gap
            const offset = tIndex * (cardWidth + gap);
            testTrack.style.transform = `translateX(-${offset}px)`;

            testDotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === tIndex);
            });

            testPrevBtn.style.opacity = tIndex === 0 ? '0.4' : '1';
            testPrevBtn.style.pointerEvents = tIndex === 0 ? 'none' : 'auto';
            testNextBtn.style.opacity = tIndex >= maxIndex ? '0.4' : '1';
            testNextBtn.style.pointerEvents = tIndex >= maxIndex ? 'none' : 'auto';
        }

        testPrevBtn.addEventListener('click', () => goTestTo(tIndex - 1));
        testNextBtn.addEventListener('click', () => goTestTo(tIndex + 1));

        // Touch Swipe Support
        let tTouchStartX = 0;
        let tTouchStartY = 0;
        let tTouchStartTime = 0;
        let tIsDragging = false;

        testTrack.addEventListener('touchstart', e => {
            tTouchStartX = e.touches[0].clientX;
            tTouchStartY = e.touches[0].clientY;
            tTouchStartTime = Date.now();
            tIsDragging = true;
        }, { passive: true });

        testTrack.addEventListener('touchmove', e => {
            if (!tIsDragging) return;
            const dx = Math.abs(e.touches[0].clientX - tTouchStartX);
            const dy = Math.abs(e.touches[0].clientY - tTouchStartY);
            if (dx > dy && dx > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        testTrack.addEventListener('touchend', e => {
            if (!tIsDragging) return;
            tIsDragging = false;
            const delta = tTouchStartX - e.changedTouches[0].clientX;
            const duration = Date.now() - tTouchStartTime;
            const velocity = Math.abs(delta) / duration;

            if (Math.abs(delta) > 40 || velocity > 0.3) {
                delta > 0 ? goTestTo(tIndex + 1) : goTestTo(tIndex - 1);
            }
        });

        // Re-init on resize
        let tResizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(tResizeTimer);
            tResizeTimer = setTimeout(() => {
                buildTestDots();
                goTestTo(0);
            }, 200);
        });

        buildTestDots();
        goTestTo(0);
    }
});
