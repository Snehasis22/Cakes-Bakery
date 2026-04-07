document.addEventListener('DOMContentLoaded', () => {

    // ── Intro Animations ──────────────────────────────────────────────
    const mainHeading = document.querySelector('.main-heading');
    const description = document.querySelector('.description');

    if (mainHeading) {
        mainHeading.style.opacity = '0';
        mainHeading.style.transform = 'translateY(50px) scale(0.95)';
        mainHeading.style.filter = 'blur(10px)';

        setTimeout(() => {
            mainHeading.style.transition = 'all 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
            mainHeading.style.opacity = '1';
            mainHeading.style.transform = 'translateY(0) scale(1)';
            mainHeading.style.filter = 'blur(0px)';
        }, 400);
    }

    if (description) {
        description.style.opacity = '0';
        description.style.transform = 'translateY(20px)';

        setTimeout(() => {
            description.style.transition = 'all 1s ease-out';
            description.style.opacity = '1';
            description.style.transform = 'translateY(0)';
        }, 1000);
    }

    // ── Button Press Interactions ──────────────────────────────────────
    const buttons = document.querySelectorAll('.Btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', () => {
            btn.style.transform = 'scale(0.95)';
        });
        btn.addEventListener('mouseup', () => {
            btn.style.transform = 'scale(1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
        });
    });

    // ── Lenis Premium Smooth Scrolling ────────────────────────────────
    const lenis = new Lenis({
        duration: 2.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ── GSAP ScrollTrigger ────────────────────────────────────────────
    gsap.registerPlugin(ScrollTrigger);

    // Fade out hero text on scroll
    gsap.to('.hero-text', {
        scrollTrigger: {
            trigger: '.scroll-proxy',
            start: 'top top',
            end: '15% top',
            scrub: 1.5
        },
        opacity: 0,
        x: -100,
        y: -50,
        filter: 'blur(20px)',
        scale: 0.9
    });

    // Fade out bottom-right panel on scroll
    gsap.to('.bottom-right-panel', {
        scrollTrigger: {
            trigger: '.scroll-proxy',
            start: 'top top',
            end: '15% top',
            scrub: 1.5
        },
        opacity: 0,
        x: 100,
        y: 50,
        filter: 'blur(20px)',
        scale: 0.9
    });

    // Fade out social center panel on scroll
    gsap.to('.bottom-center-panel', {
        scrollTrigger: {
            trigger: '.scroll-proxy',
            start: 'top top',
            end: '15% top',
            scrub: 1.5
        },
        opacity: 0,
        y: 50,
        filter: 'blur(20px)',
        scale: 0.9
    });

    // ══════════════════════════════════════════════════════════════════
    // ██  HIGH-PERFORMANCE VIDEO SCROLL ENGINE (Optimized LERP)      ██
    // ══════════════════════════════════════════════════════════════════
    //
    //  SMOOTHNESS TUNING GUIDE  (tweak these 3 values):
    //
    //  ┌────────────────────┬──────────┬──────────────────────────────┐
    //  │ Parameter          │ Default  │ Effect                       │
    //  ├────────────────────┼──────────┼──────────────────────────────┤
    //  │ LERP_FACTOR        │  0.07    │ Lower = silkier, slower      │
    //  │                    │          │ Higher = snappier, jumpier    │
    //  │                    │          │ Range: 0.03 – 0.15           │
    //  ├────────────────────┼──────────┼──────────────────────────────┤
    //  │ DEAD_ZONE          │  0.0005  │ Ignores micro-jitter below   │
    //  │                    │          │ this delta (seconds).         │
    //  │                    │          │ Range: 0.0001 – 0.002        │
    //  ├────────────────────┼──────────┼──────────────────────────────┤
    //  │ scroll-proxy height│ 1000vh   │ More height = slower scrub   │
    //  │ (in CSS)           │          │ = more frames per scroll-px  │
    //  │                    │          │ Range: 600vh – 1500vh        │
    //  └────────────────────┴──────────┴──────────────────────────────┘
    //
    // ══════════════════════════════════════════════════════════════════

    const video = document.getElementById('bg-video');
    const LERP_FACTOR = 0.07;   // ◀ Main smoothness knob
    const DEAD_ZONE = 0.0005;   // ◀ Jitter suppression threshold (seconds)

    let targetTime = 0;
    let currentTime = 0;
    let ticking = false;

    function initVideoScroll() {
        if (!video) return;
        const duration = video.duration;
        if (!duration || duration === Infinity) return;

        video.pause();

        // Use passive scroll listener for max performance
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const maxScroll = document.body.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) return;

            // Clamp scroll fraction 0→1
            const scrollFraction = Math.min(Math.max(scrollTop / maxScroll, 0), 1);

            // Map to video time
            targetTime = scrollFraction * duration;
        }, { passive: true });

        function animateVideo() {
            // LERP interpolation
            const delta = targetTime - currentTime;

            // Dead-zone: skip if difference is negligible (prevents micro-jitter)
            if (Math.abs(delta) > DEAD_ZONE) {
                currentTime += delta * LERP_FACTOR;

                // Only seek if the video buffer is ready
                if (video.readyState >= 2) {
                    // Use fastSeek when available (much smoother in Chrome/Firefox)
                    if (typeof video.fastSeek === 'function') {
                        video.fastSeek(currentTime);
                    } else {
                        video.currentTime = currentTime;
                    }
                }
            }

            requestAnimationFrame(animateVideo);
        }

        animateVideo();

        // Force-pause to prevent native playback from interfering
        video.addEventListener('play', () => video.pause());
    }

    // Initialize after metadata is available
    if (video) {
        if (video.readyState >= 1 && video.duration && video.duration !== Infinity) {
            initVideoScroll();
        } else {
            video.addEventListener('loadedmetadata', initVideoScroll);
        }
    }

    // ── Navigation Button Scroll Targets ──────────────────────────────
    const navButtons = document.querySelectorAll('.wooden-nav-btn');
    if (navButtons.length > 0) {
        navButtons[0].addEventListener('click', (e) => {
            e.preventDefault();
            lenis.scrollTo(0, { duration: 2 });
            navButtons.forEach(btn => btn.classList.remove('active'));
            navButtons[0].classList.add('active');
        });

        navButtons[1].addEventListener('click', (e) => {
            e.preventDefault();
            lenis.scrollTo(document.body.scrollHeight, { duration: 3 });
            navButtons.forEach(btn => btn.classList.remove('active'));
            navButtons[1].classList.add('active');
        });

        for (let i = 2; i < navButtons.length; i++) {
            navButtons[i].addEventListener('click', (e) => {
                e.preventDefault();
                lenis.scrollTo(document.body.scrollHeight, { duration: 3 });
                navButtons.forEach(btn => btn.classList.remove('active'));
                navButtons[i].classList.add('active');
            });
        }
    }

    // ── Action Buttons (Explore & Order) ──────────────────────────────
    const actionBtns = document.querySelectorAll('.bottom-right-panel .Btn');
    if (actionBtns.length > 1) {
        actionBtns[1].addEventListener('click', () => {
            lenis.scrollTo(document.body.scrollHeight, { duration: 3 });
            if (navButtons.length > 1) {
                navButtons.forEach(btn => btn.classList.remove('active'));
                navButtons[1].classList.add('active');
            }
        });
    }

    // ── Phase Text Scroll Animations ──────────────────────────────────
    const phaseTexts = document.querySelectorAll('.phase-text');
    phaseTexts.forEach(text => {
        let section = text.parentElement;

        gsap.fromTo(text,
            { opacity: 0, y: 150, filter: 'blur(15px)', scale: 0.8 },
            {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                scale: 1,
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'center 50%',
                    scrub: 1.5
                }
            }
        );

        gsap.to(text, {
            opacity: 0,
            y: -150,
            filter: 'blur(15px)',
            scale: 1.2,
            scrollTrigger: {
                trigger: section,
                start: 'center 40%',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    });
});
