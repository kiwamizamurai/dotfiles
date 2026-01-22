// ============================================
// Anime.js v4 - Beautiful Animations
// ============================================

const { animate, stagger, createTimeline, utils, eases } = anime;

// ============================================
// Hero Section - Spectacular Entrance
// ============================================

function initHeroAnimations() {
    // Floating shapes continuous animation
    animate('.floating-shape', {
        opacity: [0, 0.6],
        scale: [0.8, 1],
        duration: 2000,
        ease: 'outExpo',
    });

    // Continuous floating motion for shapes
    animate('.floating-shape.shape-1', {
        translateY: [-20, 20],
        translateX: [-10, 10],
        duration: 6000,
        ease: 'inOutSine',
        loop: true,
        direction: 'alternate',
    });

    animate('.floating-shape.shape-2', {
        translateY: [15, -15],
        translateX: [10, -10],
        duration: 7000,
        ease: 'inOutSine',
        loop: true,
        direction: 'alternate',
    });

    animate('.floating-shape.shape-3', {
        translateY: [-25, 25],
        translateX: [-15, 15],
        duration: 5000,
        ease: 'inOutSine',
        loop: true,
        direction: 'alternate',
    });

    // Morphing background blobs
    animate('#blob-1', {
        translateX: [0, 100, -50, 0],
        translateY: [0, -80, 60, 0],
        scale: [1, 1.2, 0.9, 1],
        duration: 20000,
        ease: 'inOutSine',
        loop: true,
    });

    animate('#blob-2', {
        translateX: [0, -80, 100, 0],
        translateY: [0, 100, -60, 0],
        scale: [1, 0.8, 1.3, 1],
        duration: 25000,
        ease: 'inOutSine',
        loop: true,
    });

    animate('#blob-3', {
        translateX: [0, 60, -100, 0],
        translateY: [0, -50, 80, 0],
        scale: [1, 1.1, 0.85, 1],
        duration: 22000,
        ease: 'inOutSine',
        loop: true,
    });

    // Hero content entrance timeline
    const heroTimeline = createTimeline({
        defaults: {
            ease: 'outExpo',
        }
    });

    // Badge entrance
    heroTimeline.add('#hero-badge', {
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.9, 1],
        duration: 800,
    }, 100);

    // Title entrance with split text effect
    heroTimeline.add('#hero-title', {
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 1000,
    }, 200);

    // Animated gradient for title accent
    animate('.animated-gradient', {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        duration: 5000,
        ease: 'linear',
        loop: true,
    });

    // Description entrance
    heroTimeline.add('#hero-description', {
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 800,
    }, 400);

    // Terminal box entrance with bounce
    heroTimeline.add('#terminal-box', {
        opacity: [0, 1],
        translateY: [60, 0],
        scale: [0.9, 1],
        duration: 1000,
        ease: 'outBack(1.2)',
    }, 500);

    // CTA buttons entrance
    heroTimeline.add('#cta-group', {
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
    }, 700);

    // Scroll indicator entrance
    heroTimeline.add('#scroll-indicator', {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
    }, 1200);

    // Scroll indicator continuous animation
    setTimeout(() => {
        animate('.scroll-indicator-dot', {
            translateY: [0, 36],
            opacity: [1, 0],
            duration: 1500,
            ease: 'inOutSine',
            loop: true,
        });
    }, 1500);
}

// ============================================
// Typing Animation
// ============================================

function initTypingAnimation() {
    const command = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/kiwamizamurai/dotfiles/refs/heads/main/install.sh)"';
    let charIndex = 0;
    const typingElement = document.getElementById('typing-command');

    function typeCommand() {
        if (charIndex < command.length) {
            typingElement.textContent = command.substring(0, charIndex + 1);
            charIndex++;
            setTimeout(typeCommand, 25);
        }
    }

    setTimeout(typeCommand, 1200);
}

// ============================================
// Magnetic Button Effect
// ============================================

function initMagneticButtons() {
    document.querySelectorAll('.btn-magnetic').forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            animate(button, {
                translateX: x * 0.2,
                translateY: y * 0.2,
                duration: 300,
                ease: 'outExpo',
            });

            const btnText = button.querySelector('.btn-text');
            if (btnText) {
                animate(btnText, {
                    translateX: x * 0.1,
                    translateY: y * 0.1,
                    duration: 300,
                    ease: 'outExpo',
                });
            }
        });

        button.addEventListener('mouseleave', () => {
            animate(button, {
                translateX: 0,
                translateY: 0,
                duration: 600,
                ease: 'outElastic(1, 0.5)',
            });

            const btnText = button.querySelector('.btn-text');
            if (btnText) {
                animate(btnText, {
                    translateX: 0,
                    translateY: 0,
                    duration: 600,
                    ease: 'outElastic(1, 0.5)',
                });
            }
        });

        // Ripple effect on click
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.left = (e.clientX - rect.left) + 'px';
            ripple.style.top = (e.clientY - rect.top) + 'px';
            button.appendChild(ripple);

            animate(ripple, {
                scale: [0, 4],
                opacity: [0.4, 0],
                duration: 600,
                ease: 'outExpo',
                onComplete: () => ripple.remove(),
            });
        });
    });
}

// ============================================
// Feature Cards - Layout Animation
// ============================================

function initFeatureCards() {
    const featuresRoot = document.getElementById('features-root');
    const featureOverlay = document.getElementById('feature-overlay');
    const toggleButtons = document.querySelectorAll('.layout-toggle');
    const actionButtons = document.querySelectorAll('.layout-action');
    const featureCards = document.querySelectorAll('#features-root .feature-card');

    if (!featuresRoot || featureCards.length === 0) return;

    let currentLayout = 'grid';

    // Apply layout transforms
    const applyLayout = (layout) => {
        const cards = document.querySelectorAll('#features-root .feature-card');

        // First animate out
        animate(cards, {
            opacity: [1, 0],
            scale: [1, 0.8],
            duration: 300,
            ease: 'inQuad',
            onComplete: () => {
                // Change layout
                featuresRoot.dataset.layout = layout;
                currentLayout = layout;

                // Apply 3D transforms for stack/chaos
                cards.forEach((card, i) => {
                    if (layout === 'stack') {
                        const offset = (cards.length - 1 - i) * 8;
                        const zOffset = (cards.length - 1 - i) * -15;
                        card.style.transform = `translateY(${offset}px) translateZ(${zOffset}px)`;
                    } else if (layout === 'chaos') {
                        const x = (Math.random() - 0.5) * 20;
                        const y = (Math.random() - 0.5) * 20;
                        const z = Math.random() * 300 + 200;
                        const rx = (Math.random() - 0.5) * 60;
                        const ry = (Math.random() - 0.5) * 60;
                        const rz = (Math.random() - 0.5) * 30;
                        const s = 0.4 + Math.random() * 0.3;
                        card.style.transform = `translate3d(${x}vw, ${y}vh, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
                    } else {
                        card.style.transform = '';
                    }
                });

                // Animate in
                animate(cards, {
                    opacity: [0, 1],
                    scale: [0.8, 1],
                    duration: 500,
                    ease: 'outExpo',
                    delay: stagger(50, { from: 'center' }),
                });
            }
        });
    };

    // Layout toggle click handlers
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const layout = btn.dataset.layout;
            if (layout === currentLayout) return;

            toggleButtons.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');

            applyLayout(layout);
        });
    });

    // Shuffle action
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.dataset.action === 'shuffle') {
                const cards = [...document.querySelectorAll('#features-root .feature-card')];

                // Animate out
                animate(cards, {
                    opacity: [1, 0],
                    rotateZ: (el, i) => (i % 2 ? 15 : -15),
                    translateY: (el, i) => (i % 2 ? -30 : 30),
                    duration: 300,
                    ease: 'inQuad',
                    onComplete: () => {
                        // Shuffle DOM
                        const shuffled = cards.sort(() => Math.random() - 0.5);
                        shuffled.forEach(card => featuresRoot.appendChild(card));

                        // Reset and animate in
                        shuffled.forEach(card => {
                            card.style.transform = '';
                        });

                        animate(shuffled, {
                            opacity: [0, 1],
                            rotateZ: [0, 0],
                            translateY: [30, 0],
                            duration: 500,
                            ease: 'outBack(1.5)',
                            delay: stagger(60),
                        });
                    }
                });
            }
        });
    });

    // Card click - open overlay
    featureCards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const $clone = document.createElement('div');
            $clone.innerHTML = card.innerHTML;
            $clone.className = card.className;
            $clone.dataset.color = card.dataset.color;

            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-overlay';
            closeBtn.innerHTML = '×';
            closeBtn.type = 'button';
            $clone.insertBefore(closeBtn, $clone.firstChild);

            featureOverlay.innerHTML = '';
            featureOverlay.appendChild($clone);

            // Show modal
            featureOverlay.showModal();
            card.classList.add('is-open');

            // Animate in
            animate($clone, {
                opacity: [0, 1],
                scale: [0.9, 1],
                translateY: [30, 0],
                duration: 400,
                ease: 'outExpo',
            });
        });
    });

    // Close modal
    const closeModal = () => {
        const $card = featureOverlay.querySelector('.feature-card');
        if ($card) {
            animate($card, {
                opacity: [1, 0],
                scale: [1, 0.9],
                translateY: [0, 30],
                duration: 250,
                ease: 'inQuad',
                onComplete: () => {
                    featureOverlay.close();
                    const openCard = document.querySelector('#features-root .feature-card.is-open');
                    if (openCard) openCard.classList.remove('is-open');
                }
            });
        }
    };

    featureOverlay.addEventListener('click', (e) => {
        if (e.target === featureOverlay || e.target.closest('.close-overlay')) {
            closeModal();
        }
    });

    featureOverlay.addEventListener('cancel', (e) => {
        e.preventDefault();
        closeModal();
    });

    // Initial entrance animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cards = entry.target.querySelectorAll('.feature-card');

                // Initial state
                cards.forEach(card => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(80px) translateZ(-100px) rotateX(15deg) scale(0.8)';
                });

                // Cascade animation
                animate(cards, {
                    opacity: [0, 1],
                    translateY: [80, 0],
                    translateZ: [-100, 0],
                    rotateX: [15, 0],
                    scale: [0.8, 1],
                    duration: 1000,
                    ease: 'outExpo',
                    delay: stagger(100, { from: 0 }),
                });

                // Bounce icons
                const icons = entry.target.querySelectorAll('.feature-card-icon');
                animate(icons, {
                    scale: [0.5, 1.2, 1],
                    rotate: ['-10deg', '5deg', '0deg'],
                    duration: 800,
                    ease: 'outBack(2)',
                    delay: stagger(100, { start: 400 }),
                });

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    observer.observe(featuresRoot);
}

// ============================================
// Carousel Animation
// ============================================

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById('carousel-dots');
    const labelElement = document.getElementById('carousel-label');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    let currentSlide = 0;
    let isAnimating = false;
    let autoplayInterval = null;

    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.carousel-dot');

    function updateDots(index) {
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
                animate(dot, {
                    scale: [1, 1.3, 1.2],
                    duration: 400,
                    ease: 'outBack(2)',
                });
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function updateLabel(index) {
        const name = slides[index].dataset.name;
        animate(labelElement, {
            opacity: [1, 0],
            translateY: [0, -10],
            duration: 200,
            ease: 'inQuad',
            onComplete: () => {
                labelElement.textContent = name;
                animate(labelElement, {
                    opacity: [0, 1],
                    translateY: [10, 0],
                    duration: 200,
                    ease: 'outQuad',
                });
            }
        });
    }

    function goToSlide(index, direction = 'next') {
        if (isAnimating || index === currentSlide) return;
        isAnimating = true;

        const currentEl = slides[currentSlide];
        const nextEl = slides[index];
        const currentWindow = currentEl.querySelector('.preview-window');
        const nextWindow = nextEl.querySelector('.preview-window');
        const nextLines = nextEl.querySelectorAll('.preview-line');

        const xOut = direction === 'next' ? -80 : 80;
        const xIn = direction === 'next' ? 80 : -80;

        // Animate out
        animate(currentWindow, {
            opacity: [1, 0],
            translateX: [0, xOut],
            scale: [1, 0.9],
            rotate: direction === 'next' ? ['0deg', '-3deg'] : ['0deg', '3deg'],
            duration: 500,
            ease: 'inBack(1.5)',
            onComplete: () => {
                currentEl.classList.remove('active');
                currentEl.style.display = 'none';

                nextEl.style.display = 'block';
                nextEl.classList.add('active');

                // Reset
                nextWindow.style.opacity = '0';
                nextWindow.style.transform = `translateX(${xIn}px) scale(0.9) rotate(${direction === 'next' ? '3deg' : '-3deg'})`;
                nextLines.forEach(line => {
                    line.style.opacity = '0';
                    line.style.transform = 'translateX(-20px)';
                });

                // Animate in with shine effect
                nextWindow.classList.add('shine');
                setTimeout(() => nextWindow.classList.remove('shine'), 1500);

                animate(nextWindow, {
                    opacity: [0, 1],
                    translateX: [xIn, 0],
                    scale: [0.9, 1],
                    rotate: [direction === 'next' ? '3deg' : '-3deg', '0deg'],
                    duration: 700,
                    ease: 'outExpo',
                });

                animate(nextLines, {
                    opacity: [0, 1],
                    translateX: [-20, 0],
                    duration: 500,
                    ease: 'outExpo',
                    delay: stagger(40, { start: 200 }),
                    onComplete: () => {
                        isAnimating = false;
                    }
                });
            }
        });

        updateDots(index);
        updateLabel(index);
        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next, 'next');
    }

    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(prev, 'prev');
    }

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoplay();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoplay();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetAutoplay();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetAutoplay();
        }
    });

    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    // Initial animation
    let previewAnimated = false;
    const previewObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !previewAnimated) {
                previewAnimated = true;
                animatePreviewEntrance();
                startAutoplay();
            }
        });
    }, { threshold: 0.3 });

    previewObserver.observe(document.querySelector('.carousel-wrapper'));

    function animatePreviewEntrance() {
        const previewWindow = slides[0].querySelector('.preview-window');
        const previewLines = slides[0].querySelectorAll('.preview-line');

        // Create particles
        const particlesContainer = document.getElementById('preview-particles');
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.background = [
                'var(--accent-indigo)',
                'var(--accent-sakura)',
                'var(--accent-matcha)',
                'var(--accent-wisteria)'
            ][Math.floor(Math.random() * 4)];
            particlesContainer.appendChild(particle);
        }

        // Window entrance
        animate(previewWindow, {
            opacity: [0, 1],
            translateY: [80, 0],
            scale: [0.85, 1],
            rotate: ['5deg', '0deg'],
            duration: 1200,
            ease: 'outExpo',
        });

        // Particles burst
        animate('.particle', {
            opacity: [0, 0.8, 0],
            scale: [0, 2],
            translateY: () => utils.random(-150, 150),
            translateX: () => utils.random(-150, 150),
            duration: 2500,
            ease: 'outExpo',
            delay: stagger(50, { from: 'center', start: 300 }),
        });

        // Lines cascade
        animate(previewLines, {
            opacity: [0, 1],
            translateX: [-30, 0],
            duration: 600,
            ease: 'outExpo',
            delay: stagger(60, { start: 500 }),
        });

        // Add shine effect
        setTimeout(() => {
            previewWindow.classList.add('shine');
            setTimeout(() => previewWindow.classList.remove('shine'), 1500);
        }, 800);
    }
}

// ============================================
// Stack Grid - 3D Layout Animation (Periodic Table style)
// ============================================

function initStackGrid() {
    const stackScene = document.getElementById('stack-scene');
    const stackGrid = document.getElementById('stack-grid');
    const stackItems = document.querySelectorAll('.stack-item');
    const toggleButtons = document.querySelectorAll('.stack-toggle');

    if (!stackScene || !stackGrid || stackItems.length === 0) return;

    // Pointer tracking state
    const pointer = {
        x: 0,
        y: 0,
        rotateX: 10,
        rotateY: 15,
        rx: 0,
        ry: 0
    };

    // Layout transform functions
    const transformLayout = {
        grid: () => {
            pointer.rotateX = 8;
            pointer.rotateY = 12;
            stackItems.forEach(item => {
                item.style.position = '';
                item.style.left = '';
                item.style.top = '';
                item.style.width = '';
                item.style.height = '';
                item.style.margin = '';
                item.style.transform = 'translateZ(10px)';
            });
        },
        sphere: () => {
            const radius = 220;
            pointer.rotateX = 25;
            pointer.rotateY = 180;
            stackItems.forEach((item, i) => {
                // Set absolute positioning first
                item.style.position = 'absolute';
                item.style.left = '50%';
                item.style.top = '50%';
                item.style.width = '130px';
                item.style.height = '90px';
                item.style.margin = '-45px 0 0 -65px';

                const phi = Math.acos(-1 + (2 * i) / stackItems.length);
                const theta = Math.sqrt(stackItems.length * Math.PI) * phi;
                const sinPhi = Math.sin(phi);
                const x = radius * sinPhi * Math.cos(theta);
                const y = radius * Math.cos(phi);
                const z = radius * sinPhi * Math.sin(theta);
                const yaw = Math.atan2(x, z);
                const pitch = -Math.atan2(y, Math.hypot(x, z));
                item.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${yaw}rad) rotateX(${pitch}rad)`;
            });
        },
        helix: () => {
            const radius = 200;
            const thetaStep = 0.35;
            const verticalSpacing = 25;
            const yOffset = (stackItems.length * verticalSpacing) / 2;
            pointer.rotateX = 20;
            pointer.rotateY = 120;
            stackItems.forEach((item, i) => {
                // Set absolute positioning first
                item.style.position = 'absolute';
                item.style.left = '50%';
                item.style.top = '50%';
                item.style.width = '130px';
                item.style.height = '90px';
                item.style.margin = '-45px 0 0 -65px';

                const theta = i * thetaStep + Math.PI;
                const y = -(i * verticalSpacing) + yOffset;
                const x = radius * Math.sin(theta);
                const z = radius * Math.cos(theta);
                const yaw = Math.atan2(x, z);
                item.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateY(${yaw}rad)`;
            });
        }
    };

    // Lerp utility
    const lerp = (start, end, factor) => start + (end - start) * factor;

    // Animation loop for smooth pointer tracking
    let animationId;
    const updateSceneRotation = () => {
        pointer.rx = lerp(pointer.rx, pointer.rotateX, 0.05);
        pointer.ry = lerp(pointer.ry, pointer.rotateY, 0.05);
        stackScene.style.transform = `rotateX(${pointer.y * pointer.rx}deg) rotateY(${pointer.x * pointer.ry}deg)`;
        animationId = requestAnimationFrame(updateSceneRotation);
    };

    // Pointer move handler
    const handlePointerMove = (e) => {
        const rect = stackScene.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        pointer.x = (e.clientX - centerX) / (rect.width / 2);
        pointer.y = (e.clientY - centerY) / (rect.height / 2);
    };

    // Toggle layout handler
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const layout = btn.dataset.layout;

            // Update active state
            toggleButtons.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');

            // Animate transition
            animate(stackItems, {
                opacity: [1, 0],
                scale: [1, 0.5],
                duration: 400,
                ease: 'inQuad',
                delay: stagger(20, { from: 'random' }),
                onComplete: () => {
                    stackGrid.dataset.layout = layout;
                    transformLayout[layout]();

                    animate(stackItems, {
                        opacity: [0, 1],
                        scale: [0.5, 1],
                        duration: 600,
                        ease: 'outBack(1.5)',
                        delay: stagger(30, { from: 'random' }),
                    });
                }
            });
        });
    });

    // Intersection observer for initial animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Start pointer tracking
                stackScene.addEventListener('mousemove', handlePointerMove);
                updateSceneRotation();

                // Initial state - scattered randomly
                stackItems.forEach(item => {
                    item.style.opacity = '0';
                    const randomX = (Math.random() - 0.5) * 600;
                    const randomY = (Math.random() - 0.5) * 400;
                    const randomZ = (Math.random() - 0.5) * 300;
                    const randomRotate = (Math.random() - 0.5) * 90;
                    item.style.transform = `translate3d(${randomX}px, ${randomY}px, ${randomZ}px) rotate(${randomRotate}deg) scale(0.3)`;
                });

                // Animate to grid layout
                setTimeout(() => {
                    transformLayout.grid();
                    animate(stackItems, {
                        opacity: [0, 1],
                        scale: [0.3, 1],
                        duration: 1200,
                        ease: 'outExpo',
                        delay: stagger(50, { from: 'center' }),
                    });

                    // Bounce icons
                    const icons = document.querySelectorAll('.stack-item .stack-icon');
                    animate(icons, {
                        scale: [0, 1.3, 1],
                        rotate: ['-30deg', '15deg', '0deg'],
                        duration: 800,
                        ease: 'outElastic(1, 0.5)',
                        delay: stagger(50, { from: 'center', start: 400 }),
                    });
                }, 100);

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(stackScene);

    // Hover effects
    stackItems.forEach(item => {
        const icon = item.querySelector('.stack-icon');

        item.addEventListener('mouseenter', () => {
            animate(item, {
                scale: 1.1,
                translateZ: 30,
                duration: 400,
                ease: 'outBack(2)',
            });
            if (icon) {
                animate(icon, {
                    scale: 1.3,
                    rotate: '15deg',
                    duration: 400,
                    ease: 'outElastic(1, 0.5)',
                });
            }
        });

        item.addEventListener('mouseleave', () => {
            const currentLayout = stackGrid.dataset.layout;
            if (currentLayout === 'grid') {
                animate(item, {
                    scale: 1,
                    translateZ: 10,
                    duration: 500,
                    ease: 'outElastic(1, 0.5)',
                });
            } else {
                animate(item, {
                    scale: 1,
                    duration: 500,
                    ease: 'outElastic(1, 0.5)',
                });
            }
            if (icon) {
                animate(icon, {
                    scale: 1,
                    rotate: '0deg',
                    duration: 500,
                    ease: 'outElastic(1, 0.5)',
                });
            }
        });
    });

    // Cleanup on page hide
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && animationId) {
            cancelAnimationFrame(animationId);
        }
    });
}

// ============================================
// Quickstart Steps - Slide In Animation
// ============================================

function initQuickstartSteps() {
    const steps = document.querySelectorAll('.quickstart-step');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const allSteps = document.querySelectorAll('.quickstart-step');
                animate(allSteps, {
                    opacity: [0, 1],
                    translateX: [-50, 0],
                    duration: 800,
                    ease: 'outExpo',
                    delay: stagger(150),
                });

                // Animate step numbers with bounce
                const stepNumbers = document.querySelectorAll('.step-number');
                animate(stepNumbers, {
                    scale: [0, 1],
                    rotate: ['-180deg', '0deg'],
                    duration: 600,
                    ease: 'outBack(2)',
                    delay: stagger(150, { start: 200 }),
                });

                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const quickstartContainer = document.querySelector('.quickstart-container');
    if (quickstartContainer) {
        observer.observe(quickstartContainer);
    }
}

// ============================================
// Section Headers Animation
// ============================================

function initSectionHeaders() {
    const headers = document.querySelectorAll('.section-header');

    headers.forEach(header => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const emoji = header.querySelector('.section-emoji');
                    const label = header.querySelector('.section-label');
                    const title = header.querySelector('.section-title');
                    const desc = header.querySelector('.section-description');

                    const timeline = createTimeline({ defaults: { ease: 'outExpo' } });

                    if (emoji) {
                        timeline.add(emoji, {
                            opacity: [0, 1],
                            scale: [0, 1],
                            rotate: ['-30deg', '0deg'],
                            duration: 600,
                        }, 0);
                    }

                    if (label) {
                        timeline.add(label, {
                            opacity: [0, 1],
                            translateY: [20, 0],
                            duration: 500,
                        }, 100);
                    }

                    if (title) {
                        timeline.add(title, {
                            opacity: [0, 1],
                            translateY: [30, 0],
                            duration: 600,
                        }, 200);
                    }

                    if (desc) {
                        timeline.add(desc, {
                            opacity: [0, 1],
                            translateY: [20, 0],
                            duration: 500,
                        }, 300);
                    }

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(header);
    });
}

// ============================================
// Copy to Clipboard with Animation
// ============================================

function copyToClipboard(button) {
    const codeBlock = button.parentElement;
    const text = codeBlock.textContent.replace('Copy', '').replace('$', '').trim();

    navigator.clipboard.writeText(text).then(() => {
        const originalText = button.textContent;
        button.textContent = '✓';
        button.style.background = 'var(--accent-matcha)';
        button.style.color = 'white';
        button.style.borderColor = 'var(--accent-matcha)';

        animate(button, {
            scale: [1, 1.2, 1],
            duration: 400,
            ease: 'outElastic(1, 0.5)',
        });

        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.color = '';
            button.style.borderColor = '';
        }, 1500);
    });
}

// ============================================
// Smooth Scroll
// ============================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// Nav Animation on Scroll
// ============================================

function initNavAnimation() {
    let lastScroll = 0;
    const nav = document.querySelector('nav');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.style.boxShadow = 'var(--shadow-md)';
        } else {
            nav.style.boxShadow = 'none';
        }

        // Hide scroll indicator after scrolling
        if (currentScroll > 50) {
            const scrollIndicator = document.getElementById('scroll-indicator');
            if (scrollIndicator && scrollIndicator.style.opacity !== '0') {
                animate(scrollIndicator, {
                    opacity: [1, 0],
                    translateY: [0, 20],
                    duration: 300,
                    ease: 'inQuad',
                });
            }
        }

        lastScroll = currentScroll;
    });
}

// ============================================
// Initialize All Animations
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initHeroAnimations();
    initTypingAnimation();
    initMagneticButtons();
    initFeatureCards();
    initCarousel();
    initStackGrid();
    initQuickstartSteps();
    initSectionHeaders();
    initSmoothScroll();
    initNavAnimation();
});
