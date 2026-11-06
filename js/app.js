/**
 * DABBOOS (دبوس) - Luxury Awwwards-style Interactive Restaurant Website
 * Principal Creative Frontend Architecture:
 * - GSAP 3.12+ (ScrollTrigger, MotionPath, quickSetter)
 * - Lenis Smooth Scroll (Synced with 60FPS lock & zero scroll-jacking)
 * - Lazy-loaded Matter.js 2D Physics with IntersectionObserver sleep mode
 * - Full-featured SPA Router: Home View & Full Menu View (/menu)
 * - Minimalist High-Conversion Menu Cards (Photo + Title + Micro-tag + Price)
 * - Interactive Cart Drawer & WhatsApp Order Generator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Prevent initial scroll jump
  document.body.classList.add('is-loading');
  window.scrollTo(0, 0);

  // Register GSAP Plugins & enforce iOS Safari mobile resize stabilization
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  gsap.config({ ignoreMobileResize: true });

  // Initialize Modules in optimal order
  initMenuPage();
  initCart();
  initI18n();
  initLenis();
  initCustomCursor();
  initPreloader();
  initNavigation();
  initHeroInteractions();
  initPolaroidGallery();
  initExplodedIngredients();
  initMotionPathTravel();
  initEditorialSection();
  setupFooterPhysicsObserver();
  handleInitialRoute();
});

/* ==========================================================================
   1. Lenis Smooth Scroll (Desktop Only, Native iOS Inertial Scroll on Mobile)
   ========================================================================== */
let lenis = null;
function initLenis() {
  const isTouch = (window.matchMedia && (
    window.matchMedia('(pointer: coarse)').matches ||
    !window.matchMedia('(pointer: fine)').matches
  )) || ('ontouchstart' in window);
  if (isTouch) {
    // Disable Lenis completely on touch devices to eliminate iOS Safari jitter
    window.lenis = null;
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#menu') {
          e.preventDefault();
          window.switchView('menu');
          return;
        }
        if (targetId && targetId !== '#' && targetId.length > 1) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            if (window.currentView === 'menu') {
              window.switchView('home');
              setTimeout(() => {
                targetEl.scrollIntoView({ behavior: 'smooth' });
              }, 300);
            } else {
              targetEl.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      });
    });
    return;
  }

  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  });
  window.lenis = lenis;

  lenis.stop();
  lenis.scrollTo(0, { immediate: true });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#menu') {
        e.preventDefault();
        window.switchView('menu');
        return;
      }
      if (targetId && targetId !== '#' && targetId.length > 1) {
        if (window.currentView === 'menu') {
          window.switchView('home');
          setTimeout(() => {
            const targetEl = document.querySelector(targetId);
            if (targetEl) lenis.scrollTo(targetEl, { offset: -80, duration: 1.2 });
          }, 300);
          return;
        }
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -80, duration: 1.2 });
        }
      }
    });
  });
}

/* ==========================================================================
   2. Hardware-Accelerated Fast Custom Cursor (gsap.quickSetter)
   ========================================================================== */
function initCustomCursor() {
  if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    return; // Completely disable on mobile / touch devices
  }

  const cursorDot = document.querySelector('.custom-cursor-dot');
  const cursorFollower = document.querySelector('.custom-cursor-follower');

  if (!cursorDot || !cursorFollower) return;

  const setDotX = gsap.quickSetter(cursorDot, "x", "px");
  const setDotY = gsap.quickSetter(cursorDot, "y", "px");
  const setFollowerX = gsap.quickSetter(cursorFollower, "x", "px");
  const setFollowerY = gsap.quickSetter(cursorFollower, "y", "px");

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    setDotX(mouseX);
    setDotY(mouseY);
  }, { passive: true });

  gsap.ticker.add(() => {
    followerX += (mouseX - followerX) * 0.22;
    followerY += (mouseY - followerY) * 0.22;
    setFollowerX(followerX);
    setFollowerY(followerY);
  });

  const interactiveElements = document.querySelectorAll('a, button, .polaroid-card, .btn-dabboos, .sticker-badge, .menu-product-card, #physics-canvas-container');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'), { passive: true });
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'), { passive: true });
  });
}

/* ==========================================================================
   3. Strict Preloader: 100dvh Lock, Clean Assembly, Zero Peeking
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const percentText = document.getElementById('preloader-percent');
  const statusText = document.getElementById('preloader-status');
  const progressBar = document.getElementById('preloader-progress-bar');

  const layers = [
    { el: '#layer-bun-bottom', pct: 0 },
    { el: '#layer-patty', pct: 25 },
    { el: '#layer-cheese', pct: 45 },
    { el: '#layer-lettuce', pct: 65 },
    { el: '#layer-sauce', pct: 80 },
    { el: '#layer-bun-top', pct: 90 },
    { el: '#layer-eyes', pct: 96 }
  ];

  const messages = [
    { threshold: 0, text: 'جاري تحضير القرمشة... — PREPARING THE CRUNCH' },
    { threshold: 30, text: 'خلطة الـ 12 بهار السرية... — INFUSING 12-SPICE BRINE' },
    { threshold: 65, text: 'طبقات الشيدر الذائبة... — MELTING CHEDDAR LAYERS' },
    { threshold: 92, text: 'جاهز لأقوى تجربة طعم! — READY TO DABBOOS!' }
  ];

  let progress = { value: 0 };
  let currentMsgIdx = 0;

  window.scrollTo(0, 0);

  gsap.to(progress, {
    value: 100,
    duration: 1.8,
    ease: 'power2.inOut',
    onUpdate: () => {
      const currentVal = Math.round(progress.value);
      if (percentText) percentText.textContent = `${currentVal}%`;
      if (progressBar) progressBar.style.width = `${currentVal}%`;

      layers.forEach((layer) => {
        const elem = document.querySelector(layer.el);
        if (elem && currentVal >= layer.pct && !elem.classList.contains('dropped')) {
          elem.classList.add('dropped');
          gsap.fromTo(elem, 
            { y: -30, opacity: 0, scale: 0.9 }, 
            { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }
          );
        }
      });

      for (let i = messages.length - 1; i >= 0; i--) {
        if (currentVal >= messages[i].threshold && currentMsgIdx !== i) {
          currentMsgIdx = i;
          if (statusText) {
            statusText.textContent = messages[i].text;
          }
          break;
        }
      }
    },
    onComplete: () => {
      setTimeout(() => {
        exitPreloader();
      }, 150);
    }
  });

  function exitPreloader() {
    const preloaderContent = document.getElementById('preloader-content');
    const curtainRed = document.getElementById('preloader-curtain-red');
    const curtainBlue = document.getElementById('preloader-curtain-blue');
    const curtainYellow = document.getElementById('preloader-curtain-yellow');

    const exitTl = gsap.timeline({
      onComplete: () => {
        if (preloader) preloader.style.display = 'none';
        
        window.scrollTo(0, 0);
        document.body.classList.remove('is-loading');
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
          lenis.start();
        }

        setTimeout(() => {
          ScrollTrigger.refresh();
          playHeroEntrance();
        }, 150);
      }
    });

    exitTl
      .to(preloaderContent, {
        scale: 0.9,
        opacity: 0,
        y: -30,
        duration: 0.25,
        ease: 'power2.in'
      })
      .to(curtainRed, {
        yPercent: -130,
        duration: 0.75,
        ease: 'power4.inOut'
      }, '-=0.1')
      .to(curtainBlue, {
        yPercent: -130,
        duration: 0.75,
        ease: 'power4.inOut'
      }, '-=0.6')
      .to(curtainYellow, {
        yPercent: -130,
        duration: 0.75,
        ease: 'power4.inOut'
      }, '-=0.6')
      .to('#preloader', {
        yPercent: -130,
        duration: 0.6,
        ease: 'power4.inOut'
      }, '-=0.6');
  }
}

/* ==========================================================================
   4. Sticky Header Navigation & Blur Menu Overlay
   ========================================================================== */
window.toggleNavOverlay = function(show) {
  const overlay = document.getElementById('nav-overlay');
  const card = document.getElementById('nav-overlay-card');
  if (!overlay || !card) return;

  if (show) {
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      overlay.classList.remove('opacity-0');
      card.classList.remove('translate-y-4');
    });
  } else {
    overlay.classList.add('opacity-0');
    card.classList.add('translate-y-4');
    setTimeout(() => {
      overlay.classList.add('hidden');
    }, 300);
  }
};

window.handleNavOverlayClick = function(target) {
  window.toggleNavOverlay(false);
  if (target === 'menu') {
    window.switchView('menu');
  } else if (target === 'home') {
    window.switchView('home');
    if (window.lenis) window.lenis.scrollTo(0, { immediate: false });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (target === 'spices') {
    window.switchView('home');
    setTimeout(() => {
      const el = document.getElementById('exploded-section');
      if (el && window.lenis) window.lenis.scrollTo(el);
      else if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  } else if (target === 'location') {
    window.switchView('home');
    setTimeout(() => {
      const el = document.getElementById('travel-section');
      if (el && window.lenis) window.lenis.scrollTo(el);
      else if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }
};

function initNavigation() {
  const directMenuBtn = document.getElementById('header-direct-menu-btn');
  if (directMenuBtn) {
    directMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.switchView('menu');
    });
  }

  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      window.toggleNavOverlay(true);
    });
  }
}

/* ==========================================================================
   5. Hero Section (Parallax, Mouse Eyes, 3D Typography)
   ========================================================================== */
function playHeroEntrance() {
  const heroTl = gsap.timeline();

  heroTl
    .fromTo('#hero-bg-text', 
      { scale: 1.12, opacity: 0, letterSpacing: '0.08em' },
      { scale: 1, opacity: 1, letterSpacing: '-0.02em', duration: 0.9, ease: 'power3.out', overwrite: 'auto' }
    )
    .fromTo('#hero-burger-centerpiece',
      { y: 70, opacity: 0, scale: 0.85, rotate: -3 },
      { y: 0, opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.6)', overwrite: 'auto' },
      '-=0.7'
    )
    .fromTo('#hero-3d-title',
      { y: 40, opacity: 0, scale: 0.85 },
      { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.8)', overwrite: 'auto' },
      '-=0.6'
    )
    .fromTo('.hero-badge-sticker',
      { scale: 0, opacity: 0, rotate: 0 },
      { scale: 1, opacity: 1, rotate: (i) => (i === 0 ? -9 : 11), stagger: 0.1, duration: 0.5, ease: 'back.out(2)', overwrite: 'auto' },
      '-=0.5'
    )
    .fromTo('.hero-corner-card',
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out', overwrite: 'auto' },
      '-=0.4'
    );
}

function initHeroInteractions() {
  const heroBurger = document.getElementById('hero-burger-centerpiece');
  const heroContainer = document.getElementById('hero-section');
  const eyePupils = document.querySelectorAll('.hero-eye-pupil');

  if (!heroContainer) return;

  // Eyes mouse tracking (desktop only)
  if (window.matchMedia && !window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    window.addEventListener('mousemove', (e) => {
      if (!eyePupils.length) return;
      const heroRect = heroContainer.getBoundingClientRect();
      if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight * 0.45;
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      const maxMove = 7;
      const moveX = Math.max(-maxMove, Math.min(maxMove, deltaX * maxMove));
      const moveY = Math.max(-maxMove, Math.min(maxMove, deltaY * maxMove));

      eyePupils.forEach((pupil) => {
        pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    }, { passive: true });
  }

  // Periodic blinking eyes
  setInterval(() => {
    const eyeWhites = document.querySelectorAll('.hero-eye-white');
    if (!eyeWhites.length) return;
    gsap.to(eyeWhites, {
      scaleY: 0.1,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      transformOrigin: 'center center'
    });
  }, 4200);

  // Responsive Parallax: Smooth scrub on Desktop; Rock-solid zero-jitter on Mobile
  const mm = gsap.matchMedia();

  mm.add('(min-width: 769px) and (pointer: fine)', () => {
    gsap.to('#hero-bg-text', {
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      y: 120,
      scale: 0.95,
      overwrite: 'auto'
    });

    gsap.to(heroBurger, {
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      y: 70,
      scale: 0.94,
      rotate: 2,
      overwrite: 'auto'
    });

    gsap.to('#hero-3d-title', {
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      y: 130,
      scale: 0.96,
      overwrite: 'auto'
    });
  });

  mm.add('(max-width: 768px), (pointer: coarse)', () => {
    // Mobile Touch Devices: Strictly preserve static, hardware-accelerated transform
    // to eliminate 100% of scroll-scrub vibration and layout jitter.
    gsap.set(['#hero-bg-text', heroBurger, '#hero-3d-title'], {
      clearProps: 'transform'
    });
  });
}

/* ==========================================================================
   6. Section 2: "Juicy Cheesy Fully Loaded" & Polaroid Gallery Fan-out
   ========================================================================== */
function initPolaroidGallery() {
  const polaroids = document.querySelectorAll('.polaroid-item');
  if (!polaroids.length) return;

  const mm = gsap.matchMedia();

  // Desktop (min-width: 769px): Dramatic fan-out with 3D tilt & rotation
  mm.add("(min-width: 769px)", () => {
    const fanTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#gallery-section',
        start: 'top 75%',
        end: 'center center',
        scrub: 1.2
      }
    });

    fanTl
      .fromTo(polaroids[0],
        { x: 120, y: 80, rotate: 0, opacity: 0.4 },
        { x: 0, y: 0, rotate: -13, opacity: 1, duration: 1 }
      )
      .fromTo(polaroids[1],
        { y: 100, rotate: 0, opacity: 0.5 },
        { y: -15, rotate: 1, opacity: 1, duration: 1 },
        '-=1'
      )
      .fromTo(polaroids[2],
        { x: -120, y: 80, rotate: 0, opacity: 0.4 },
        { x: 0, y: 0, rotate: 15, opacity: 1, duration: 1 },
        '-=1'
      );
  });

  // Mobile (max-width: 768px): Tailored, zero horizontal displacement vertical stack
  mm.add("(max-width: 768px)", () => {
    gsap.fromTo(polaroids,
      { y: 40, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#gallery-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  });

  if (window.matchMedia && !window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    polaroids.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPct = (x / rect.width - 0.5) * 2;
        const yPct = (y / rect.height - 0.5) * 2;

        gsap.to(card, {
          rotateY: xPct * 12,
          rotateX: -yPct * 12,
          transformPerspective: 800,
          duration: 0.3,
          ease: 'power2.out'
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        const originalRot = card.getAttribute('data-tilt') || 0;
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          rotate: Number(originalRot),
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)'
        });
      }, { passive: true });
    });
  }
}

/* ==========================================================================
   7. Section 4: Exploded Ingredients Scroll Parallax
   ========================================================================== */
function initExplodedIngredients() {
  const ingredients = document.querySelectorAll('.parallax-ingredient');
  if (!ingredients.length) return;

  ingredients.forEach((item) => {
    const speed = parseFloat(item.getAttribute('data-speed') || 1.2);
    const rotSpeed = parseFloat(item.getAttribute('data-rot') || 25);
    const startY = parseFloat(item.getAttribute('data-start-y') || 60);

    gsap.fromTo(item,
      { y: startY, rotate: -rotSpeed * 0.5 },
      {
        y: -180 * speed,
        rotate: rotSpeed,
        ease: 'none',
        scrollTrigger: {
          trigger: '#exploded-section',
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1.5
        }
      }
    );
  });
}

/* ==========================================================================
   8. Section 5: Motion-Path Travel Section (Single Flagship & Fast Delivery)
   ========================================================================== */
function initMotionPathTravel() {
  const airplane = document.getElementById('travel-airplane');
  const flightPath = document.getElementById('flight-path-svg');
  const flagshipCard = document.getElementById('flagship-card');

  if (!airplane || !flightPath) return;

  const travelTl = gsap.timeline({
    scrollTrigger: {
      trigger: '#travel-section',
      start: 'top top',
      end: '+=150%',
      pin: true,
      scrub: 1.2,
      anticipatePin: 1
    }
  });

  travelTl.to(airplane, {
    motionPath: {
      path: '#flight-path-svg',
      align: '#flight-path-svg',
      autoRotate: 90,
      alignOrigin: [0.5, 0.5],
      start: 0,
      end: 1
    },
    duration: 10,
    ease: 'none'
  });

  if (flagshipCard) {
    gsap.fromTo(flagshipCard,
      { scale: 0.9, opacity: 0, y: 35 },
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.6)',
        scrollTrigger: {
          trigger: '#travel-section',
          start: 'top 75%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  }
}

/* ==========================================================================
   9. Section 6: Editorial "Feel The Change" Animations
   ========================================================================== */
function initEditorialSection() {
  const splitLeft = document.getElementById('editorial-left');
  const splitRight = document.getElementById('editorial-right');

  if (!splitLeft || !splitRight) return;

  gsap.fromTo(splitLeft,
    { x: -50, opacity: 0 },
    {
      x: 0,
      opacity: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#editorial-section',
        start: 'top 70%'
      }
    }
  );

  gsap.fromTo(splitRight,
    { x: 50, opacity: 0, scale: 0.95 },
    {
      x: 0,
      opacity: 1,
      scale: 1,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '#editorial-section',
        start: 'top 70%'
      }
    }
  );
}

/* ==========================================================================
   10. Lazy-Loaded 2D Physics Footer with Sleep Mode & Accurate Floor Bounds
   ========================================================================== */
let physicsEngine, physicsRunner, physicsInitialized = false;

function setupFooterPhysicsObserver() {
  const footerEl = document.getElementById('footer-section');
  if (!footerEl) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!physicsInitialized) {
          initMatterPhysicsFooter();
          physicsInitialized = true;
        } else if (physicsRunner && physicsEngine) {
          Matter.Runner.run(physicsRunner, physicsEngine);
        }
      } else {
        if (physicsRunner && physicsEngine) {
          Matter.Runner.stop(physicsRunner);
        }
      }
    });
  }, { rootMargin: '200px 0px' });

  observer.observe(footerEl);
}

function initMatterPhysicsFooter() {
  const container = document.getElementById('physics-canvas-container');
  if (!container) return;

  const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Body, Events } = Matter;

  physicsEngine = Engine.create({
    gravity: { x: 0, y: 1.2 }
  });

  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || 550;

  const render = Render.create({
    element: container,
    engine: physicsEngine,
    options: {
      width: width,
      height: height,
      wireframes: false,
      background: 'transparent',
      pixelRatio: Math.min(window.devicePixelRatio || 1, 2)
    }
  });

  Render.run(render);

  physicsRunner = Runner.create();
  Runner.run(physicsRunner, physicsEngine);

  // Boundaries: Ground rests cleanly above the 48px bottom bar
  const wallThickness = 60;
  const groundFloorY = height - 25;
  let ground = Bodies.rectangle(width / 2, groundFloorY + wallThickness / 2, width * 2, wallThickness, {
    isStatic: true,
    render: { visible: false }
  });
  let leftWall = Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height * 2, {
    isStatic: true,
    render: { visible: false }
  });
  let rightWall = Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height * 2, {
    isStatic: true,
    render: { visible: false }
  });

  // Invisible letter collision ledges matching the tops of the giant DABBOOS letters
  const letterLedgeY = height - 60;
  const ledge1 = Bodies.rectangle(width * 0.22, letterLedgeY, width * 0.28, 20, {
    isStatic: true,
    angle: 0.04,
    render: { visible: false }
  });
  const ledge2 = Bodies.rectangle(width * 0.5, letterLedgeY - 10, width * 0.25, 20, {
    isStatic: true,
    angle: -0.03,
    render: { visible: false }
  });
  const ledge3 = Bodies.rectangle(width * 0.78, letterLedgeY, width * 0.28, 20, {
    isStatic: true,
    angle: 0.04,
    render: { visible: false }
  });

  Composite.add(physicsEngine.world, [ground, leftWall, rightWall, ledge1, ledge2, ledge3]);

  // Food Ingredients Configuration
  const ingredientTypes = [
    { name: 'patty', width: 85, height: 38, type: 'rectangle', color: '#4A1D0D', stroke: '#240A04', chamfer: { radius: 12 }, restitution: 0.5 },
    { name: 'cheese', width: 75, height: 75, type: 'rectangle', color: '#F5C518', stroke: '#B8860B', chamfer: { radius: 6 }, restitution: 0.65 },
    { name: 'tomato', radius: 36, type: 'circle', color: '#E62419', stroke: '#9E1007', restitution: 0.7 },
    { name: 'lettuce', width: 95, height: 32, type: 'rectangle', color: '#48BB78', stroke: '#276749', chamfer: { radius: 14 }, restitution: 0.4 },
    { name: 'bunTop', width: 100, height: 48, type: 'rectangle', color: '#D69E2E', stroke: '#975A16', chamfer: { radius: [24, 24, 6, 6] }, restitution: 0.6 },
    { name: 'chili', width: 70, height: 25, type: 'rectangle', color: '#C53030', stroke: '#742A2A', chamfer: { radius: 10 }, restitution: 0.75 },
    { name: 'fry', width: 80, height: 18, type: 'rectangle', color: '#ECC94B', stroke: '#B7791F', chamfer: { radius: 4 }, restitution: 0.55 }
  ];

  const isMobile = window.innerWidth < 768;
  const pScale = isMobile ? 0.5 : 1.0;

  function spawnIngredient(typeObj, customX, customY) {
    const x = customX || Math.random() * (width - 160) + 80;
    const y = customY || -Math.random() * 200 - 40;
    let body;

    const commonOptions = {
      restitution: typeObj.restitution || 0.6,
      friction: 0.15,
      frictionAir: 0.015,
      render: {
        fillStyle: typeObj.color,
        strokeStyle: typeObj.stroke,
        lineWidth: isMobile ? 2 : 3
      }
    };

    if (typeObj.type === 'circle') {
      body = Bodies.circle(x, y, typeObj.radius * pScale, commonOptions);
    } else {
      let chamferOpt = undefined;
      if (typeObj.chamfer && typeObj.chamfer.radius) {
        if (Array.isArray(typeObj.chamfer.radius)) {
          chamferOpt = { radius: typeObj.chamfer.radius.map(r => r * pScale) };
        } else {
          chamferOpt = { radius: typeObj.chamfer.radius * pScale };
        }
      }
      body = Bodies.rectangle(x, y, typeObj.width * pScale, typeObj.height * pScale, {
        ...commonOptions,
        chamfer: chamferOpt
      });
    }

    Body.setAngle(body, (Math.random() - 0.5) * Math.PI);
    Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.12);
    Body.setVelocity(body, { x: (Math.random() - 0.5) * 4, y: Math.random() * 3 + 2 });

    body.customIngredient = typeObj.name;
    Composite.add(physicsEngine.world, body);
    return body;
  }

  Events.on(render, 'afterRender', () => {
    const ctx = render.context;
    const bodies = Composite.allBodies(physicsEngine.world);

    bodies.forEach((body) => {
      if (!body.customIngredient) return;
      const pos = body.position;
      const angle = body.angle;

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(angle);

      if (body.customIngredient === 'tomato') {
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#FFE066';
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + 0.3;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 14, Math.sin(a) * 14, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (body.customIngredient === 'bunTop') {
        ctx.fillStyle = '#FFFFFF';
        const seeds = [
          [-25, -6], [-10, -12], [8, -14], [25, -8],
          [-18, 2], [3, 0], [20, 2], [-2, 8]
        ];
        seeds.forEach(([sx, sy]) => {
          ctx.beginPath();
          ctx.ellipse(sx, sy, 3, 1.8, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        });
      } else if (body.customIngredient === 'cheese') {
        ctx.fillStyle = '#ECC94B';
        ctx.beginPath();
        ctx.arc(-15, 15, 6, 0, Math.PI * 2);
        ctx.arc(18, -12, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (body.customIngredient === 'chili') {
        ctx.fillStyle = '#38A169';
        ctx.beginPath();
        ctx.ellipse(-28, 0, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (body.customIngredient === 'patty') {
        ctx.strokeStyle = '#270c06';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-24, -8);
        ctx.lineTo(-12, 8);
        ctx.moveTo(-4, -8);
        ctx.lineTo(8, 8);
        ctx.moveTo(16, -8);
        ctx.lineTo(28, 8);
        ctx.stroke();
      }

      ctx.restore();
    });
  });

  const mouse = Mouse.create(render.canvas);
  const mouseConstraint = MouseConstraint.create(physicsEngine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: { visible: false }
    }
  });

  if (mouse.element) {
    mouse.element.removeEventListener('mousewheel', mouse.mousewheel);
    mouse.element.removeEventListener('DOMMouseScroll', mouse.mousewheel);
    mouse.element.removeEventListener('wheel', mouse.mousewheel);
  }

  Composite.add(physicsEngine.world, mouseConstraint);
  render.mouse = mouse;

  // Initial Food Drop (Proportionally scaled for mobile)
  const initialDropCount = isMobile ? 6 : 14;
  for (let i = 0; i < initialDropCount; i++) {
    setTimeout(() => {
      const randomType = ingredientTypes[i % ingredientTypes.length];
      spawnIngredient(randomType);
    }, i * 80);
  }

  const dropBtn = document.getElementById('btn-drop-ingredients');
  if (dropBtn) {
    dropBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const dropCount = isMobile ? 4 : 8;
      for (let i = 0; i < dropCount; i++) {
        setTimeout(() => {
          const randomType = ingredientTypes[Math.floor(Math.random() * ingredientTypes.length)];
          spawnIngredient(randomType, width / 2 + (Math.random() - 0.5) * (isMobile ? 180 : 320), -50);
        }, i * 60);
      }
    });
  }

  window.addEventListener('resize', () => {
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || 550;

    render.canvas.width = width;
    render.canvas.height = height;

    const updatedGroundY = height - 25;
    Body.setPosition(ground, { x: width / 2, y: updatedGroundY + wallThickness / 2 });
    Body.setPosition(rightWall, { x: width + wallThickness / 2, y: height / 2 });

    const newLedgeY = height - 60;
    Body.setPosition(ledge1, { x: width * 0.22, y: newLedgeY });
    Body.setPosition(ledge2, { x: width * 0.5, y: newLedgeY - 10 });
    Body.setPosition(ledge3, { x: width * 0.78, y: newLedgeY });
  });
}

/* ==========================================================================
   11. Multi-View / SPA Routing Architecture (Home & Full Menu Page /menu)
   ========================================================================= */
window.currentView = 'home';

window.switchView = function(viewName) {
  const homeView = document.getElementById('home-view');
  const menuView = document.getElementById('menu-view');
  const navBackHomeBtn = document.getElementById('nav-back-home');
  const directMenuBtn = document.getElementById('header-direct-menu-btn');

  if (viewName === 'menu') {
    window.currentView = 'menu';
    window.location.hash = '#menu';
    document.title = (window.I18N_DICT && window.I18N_DICT[currentLang]) ? window.I18N_DICT[currentLang].doc_title_menu : 'منيو دبوس — DABBOOS FULL MENU';

    if (homeView) homeView.style.display = 'none';
    if (menuView) {
      menuView.style.display = 'block';
      gsap.fromTo(menuView, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }

    if (navBackHomeBtn) navBackHomeBtn.classList.remove('hidden');
    if (directMenuBtn) directMenuBtn.classList.add('hidden');

    window.scrollTo(0, 0);
    if (lenis) lenis.scrollTo(0, { immediate: true });

  } else {
    window.currentView = 'home';
    if (window.location.hash === '#menu') {
      history.pushState(null, '', window.location.pathname);
    }
    document.title = (window.I18N_DICT && window.I18N_DICT[currentLang]) ? window.I18N_DICT[currentLang].doc_title_home : 'DABBOOS (دبوس) — Smashed, Crispy & Fully Loaded';

    if (menuView) menuView.style.display = 'none';
    if (homeView) {
      homeView.style.display = 'block';
      gsap.fromTo(homeView, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.35, ease: 'power2.out' }
      );
      ScrollTrigger.refresh();
    }

    if (navBackHomeBtn) navBackHomeBtn.classList.add('hidden');
    if (directMenuBtn) directMenuBtn.classList.remove('hidden');

    window.scrollTo(0, 0);
    if (lenis) lenis.scrollTo(0, { immediate: true });
  }
};

function handleInitialRoute() {
  if (window.location.hash === '#menu') {
    setTimeout(() => {
      window.switchView('menu');
    }, 1900);
  }
}

window.addEventListener('popstate', () => {
  if (window.location.hash === '#menu') {
    window.switchView('menu');
  } else {
    window.switchView('home');
  }
});

/* ==========================================================================
   12. FULL BILINGUAL i18n ENGINE & DICTIONARY (Arabic / English)
   ========================================================================== */
const I18N_DICT = {
  ar: {
    doc_title_home: 'DABBOOS (دبوس) — Smashed, Crispy & Fully Loaded',
    doc_title_menu: 'منيو دبوس — DABBOOS FULL MENU',
    brand_sub: 'دبــوس • برجر وقرمشة',
    nav_home: 'الرئيسية',
    nav_explore_menu: 'تصفح المنيو الكامل',
    nav_order: 'اطلب الآن',
    nav_order_now: '',
    nav_menu: 'المنيو',
    overlay_title: 'القائمة السريعة',
    overlay_home: '01. الرئيسية',
    overlay_home_sub: 'الصفحة الرئيسية',
    overlay_menu: '02. المنيو الكامل',
    overlay_menu_sub: 'قائمة الأصناف والأسعار',
    overlay_spices: '03. سر بهاراتنا',
    overlay_spices_sub: 'خلطة الـ 12 بهار السرية',
    overlay_location: '04. موقع الفرع والتوصيل',
    overlay_location_sub: 'خدمة التوصيل السريع والفرع',
    overlay_cta: '🍔 تصفح المنيو الكامل واطلب الآن',
    hero_badge_1: '⚡ مقرمش وسماش طازج',
    hero_badge_2: '🔥 نكهة نارية حارة',
    hero_marquee_badge: 'دبوس — ملوك القرمشة والنكهة النارية!',
    hero_box1_title: 'تتبيلة الـ 48 ساعة السرية',
    hero_box1_desc: 'دجاج ولحم سماش طازج متبل لمدة 48 ساعة في خلطتنا السرية مع خبز البريوش المحمص وصوص دبوس الناري.',
    hero_scroll: 'مرر للأسفل لاكتشاف المنيو',
    hero_box2_title: 'شيدر معتقة ذائبة',
    hero_box2_desc: 'جبنة شيدر معتقة وذائبة، مخلل منزلي مقرمش، ومكونات طازجة يومياً بدون أي تهاون!',
    sec2_badge: '★ TOP CLASSIC SELECTION ★',
    sec2_title: 'JUICY<br>CHEESY<br>FULLY LOADED',
    sec2_sub: 'كل وجبة معمولة بحب وانفجار نكهات! تذوق البطاطس الغرقانة والبرجر المقرمش اللي ما تقدر تقاومه.',
    sec2_btn: 'تصفح المنيو واطلب الآن 🔥',
    card1_badge: 'MUST TRY',
    card1_title: '01. LOADED FRIES',
    card1_desc: 'بطاطس غرقانة جبن وهالبينو وتندرز دجاج مقرمش!',
    card2_badge: 'SIGNATURE #1',
    card2_title: '02. CRISPY BURGER',
    card2_desc: 'برجر دجاج مقرمش بصوص هريسة التمر والمخلل!',
    card3_badge: 'FIRE DIP',
    card3_title: '03. VOLCANO DIP',
    card3_desc: 'تندر مقرمش يتغمس بصوص العسل الحار والسريراتشا!',
    sec3_badge: '★ THE DABBOOS EXPERIENCE ★',
    sec3_title: 'FOOD THAT FEELS GOOD',
    sec3_sub: 'لا تنازلات في الطعم، لا برجر عادي! طاقة شوارع حقيقية وقرمشة تهز كيانك من أول لقمة.',
    sec3_mascot_badge: '🔥 BOLD FLAVOUR!',
    sec3_pill_1: '🔥 دجاج ولحم بلدي طازج يومياً 100%',
    sec3_pill_2: '🧀 صوص جبنة معتقة 48 ساعة',
    sec3_pill_3: '⚡ درجات حرارة وتتبيلة حسب اختيارك',
    sec4_macro_badge: 'THE ART OF CRUNCH',
    sec4_macro_title: 'UNAPOLOGETICALLY MESSY.<br>UNFORGETTABLY CRISPY.',
    sec4_macro_sub: 'طعم يضرب في الرأس! كل قضمة محشوة صوص ساخن وجبنة ما توقف.',
    sec4_exp_badge: 'INSIDE THE DABBOOS FORMULA',
    sec4_exp_title: 'EVERY LAYER PACKED WITH SIGNATURE FLAVOR',
    sec4_exp_sub: 'كل طبقة مدروسة بقرمشة وتتبيلة سرية ما تلقاها في مكان ثاني.. من الخبز المحمص إلى صوص الدبوس الناري!',
    sec5_badge: '★ FAST DELIVERY & PICKUP ★',
    sec5_title: 'QUALITY THAT TRAVELS TO YOU',
    sec5_sub: 'طعم دبّوس الأصلي من فرعنا الرئيسي إليك وين ما كنت — توصيل سريع يحفظ القرمشة والحرارة!',
    flagship_pill: '📍 فرعنا الرئيسي الوحيد',
    flagship_name: 'مطعم دبّوس — DABBOOS',
    flagship_address: 'شارع الأمير سلطان — تجربة البرجر والقرمشة الأقوى في المملكة',
    flagship_feat_1: '🔥 تحضير طازج يومياً',
    flagship_feat_2: '🛵 توصيل سريع ومباشر',
    flagship_feat_3: '📦 تغليف حراري يحفظ القرمشة',
    flagship_order_btn: '🍔 اطلب الآن',
    flagship_map_btn: '📍 موقع الفرع على الخريطة',
    flagship_footer_note: 'معبأ ساخناً في بوكسات حرارية خاصة تحفظ القرمشة',
    sec6_badge: 'THE DABBOOS MANIFESTO',
    sec6_title: 'FEEL THE<br>CHANGE',
    sec6_sub: 'حس بالفرق مع كل قضمة مقرمشة وصوص ساخن لا يُقاوم.',
    sec6_desc: 'في دبوس، كسرنا القواعد التقليدية للفاست فود! نتبل الدجاج لمدة 48 ساعة في خلطتنا السرية مع خبز البريوش المحمص وصوص دبوس الناري.',
    sec6_chef_title: 'MASTER CHEF APPROVED',
    sec6_chef_desc: 'تتبيلة خاصة وبرجر محضر يدوياً بكل فخر وشغف!',
    sec6_menu_btn: 'تصفح المنيو الكامل للطلب 🍔',
    sec6_whatsapp_btn: '💬 طلب واتساب فوري',
    sec6_photo_quote: 'لحظات تجمع الحبايب على ألذ وجبة برجر وبطاطس!',
    sec6_sticker_1: '★ 100% FRESH DAILY ★',
    sec6_sticker_2: '🌶️ SECRET 12-SPICE RECIPE',
    footer_drop_btn: '🌶️ أسقط مكونات إضافية',
    footer_drop_hint: '(اضغط وأسقط مكونات إضافية، والعب بها!)',
    footer_nav_home: 'HOME',
    footer_nav_menu: 'FULL MENU',
    footer_nav_burgers: 'BURGERS',
    footer_nav_fries: 'LOADED FRIES',
    footer_nav_location: '04. LOCATION',
    footer_copy: '© 2026 DABBOOS RESTAURANT — ALL RIGHTS RESERVED.',
    footer_passion: 'صنع بشغف لعشاق القرمشة والنكهة النارية 🔥',
    footer_tagline: 'CRAFTED FOR FLAVOR ADDICTS',
    menu_badge: 'OFFICIAL RESTAURANT MENU',
    menu_fresh: 'طازج يومياً 100%',
    menu_title: 'منيو دبّوس — DABBOOS MENU',
    menu_desc: 'تصفح أصنافنا المقرمشة: البرجر، التندرز، الصاج، الأرز، والبوكسات العائلية.',
    menu_search_placeholder: 'ابحث عن صنف (مثلاً: هريسة، تندر، بوكس)...',
    tab_all: '🔥 الكل (جميع الأصناف)',
    tab_burgers: '🍔 البرجر',
    tab_crispy: '🍗 المقرمشات والتندرز',
    tab_saj: '🌯 الصاج والتويستر',
    tab_rice: '🍛 الأرز والمكرونة',
    tab_sides: '🍟 الجانبية والبوكسات',
    menu_no_results_title: 'لم نعثر على أي صنف يطابق بحثك!',
    menu_no_results_desc: 'جرب البحث بكلمة أخرى مثل "برجر"، "تندر"، أو "بوكس".',
    menu_back_home: '← العودة للصفحة الرئيسية واستكشاف المؤثرات',
    btn_add: '+ أضف',
    currency: 'ر.س',
    cart_pill_label: 'السلة:',
    cart_title: 'سلة الطلبات',
    cart_sub: 'DABBOOS ORDER CART',
    cart_total_label: 'المجموع الإجمالي (شامل الضريبة):',
    cart_checkout: '💬 إتمام الطلب عبر واتساب',
    cart_clear: 'تفريغ السلة',
    cart_empty_title: 'السلة فارغة حالياً',
    cart_empty_desc: 'تصفح المنيو واختر وجبتك المفضلة لإضافتها!',
    toast_added: 'تمت إضافة "{title}" للسلة!'
  },
  en: {
    doc_title_home: 'DABBOOS — Smashed, Crispy & Fully Loaded',
    doc_title_menu: 'DABBOOS FULL MENU — Street Food & Burgers',
    brand_sub: 'DABBOOS • STREET BURGER',
    nav_home: 'HOME',
    nav_explore_menu: 'EXPLORE FULL MENU',
    nav_order: 'ORDER NOW',
    nav_order_now: '',
    nav_menu: 'MENU',
    overlay_title: 'QUICK NAVIGATION',
    overlay_home: '01. HOME',
    overlay_home_sub: 'MAIN HOME',
    overlay_menu: '02. FULL MENU',
    overlay_menu_sub: 'ITEMS & PRICES',
    overlay_spices: '03. OUR SPICES',
    overlay_spices_sub: '12-SPICE SECRET BLEND',
    overlay_location: '04. LOCATION',
    overlay_location_sub: 'FLAGSHIP & DELIVERY',
    overlay_cta: '🍔 OPEN FULL MENU & ORDER',
    hero_badge_1: '⚡ SMASHED & CRISPY',
    hero_badge_2: '🔥 BOLD SPICY FLAVOR',
    hero_marquee_badge: 'DABBOOS — KINGS OF CRUNCH & FIERY FLAVOR!',
    hero_box1_title: 'SECRET BRINE RECIPE',
    hero_box1_desc: 'Double smashed chicken & beef, 48-hr spice brine, toasted golden brioche & signature Dabboos hot sauce.',
    hero_scroll: 'SCROLL TO DEVOUR',
    hero_box2_title: 'MOLTEN AGED CHEDDAR',
    hero_box2_desc: 'Rich melted aged cheddar, crunchy house-made pickles, and daily fresh ingredients with zero compromise!',
    sec2_badge: '★ TOP CLASSIC SELECTION ★',
    sec2_title: 'JUICY<br>CHEESY<br>FULLY LOADED',
    sec2_sub: 'Every meal is crafted with passion and explosive flavor! Taste our loaded fries and irresistible crispy burgers.',
    sec2_btn: 'EXPLORE MENU & ORDER NOW 🔥',
    card1_badge: 'MUST TRY',
    card1_title: '01. LOADED FRIES',
    card1_desc: 'Crispy fries loaded with molten cheese, jalapeños & chicken tenders!',
    card2_badge: 'SIGNATURE #1',
    card2_title: '02. CRISPY BURGER',
    card2_desc: 'Crispy chicken burger glazed with date harissa & pickles!',
    card3_badge: 'FIRE DIP',
    card3_title: '03. VOLCANO DIP',
    card3_desc: 'Crispy tenders dipped in flaming honey sriracha sauce!',
    sec3_badge: '★ THE DABBOOS EXPERIENCE ★',
    sec3_title: 'FOOD THAT FEELS GOOD',
    sec3_sub: 'Zero compromises on taste, no ordinary burgers! Pure street-food energy and a crunch that hits from the first bite.',
    sec3_mascot_badge: '🔥 BOLD FLAVOUR!',
    sec3_pill_1: '🔥 100% Fresh Daily Local Chicken & Beef',
    sec3_pill_2: '🧀 Signature 48-Hour Molten Cheese',
    sec3_pill_3: '⚡ Custom Spice & Heat Levels',
    sec4_macro_badge: 'THE ART OF CRUNCH',
    sec4_macro_title: 'UNAPOLOGETICALLY MESSY.<br>UNFORGETTABLY CRISPY.',
    sec4_macro_sub: 'Hits right on the spot! Every bite packed with fiery sauce and endless cheese.',
    sec4_exp_badge: 'INSIDE THE DABBOOS FORMULA',
    sec4_exp_title: 'EVERY LAYER PACKED WITH SIGNATURE FLAVOR',
    sec4_exp_sub: 'Every layer calculated with signature crunch and secret spices you won\'t find anywhere else.. from toasted brioche to fiery sauce!',
    sec5_badge: '★ FAST DELIVERY & PICKUP ★',
    sec5_title: 'QUALITY THAT TRAVELS TO YOU',
    sec5_sub: 'Authentic Dabboos flavor straight from our flagship kitchen to your door — fast delivery that locks in the heat and crunch!',
    flagship_pill: '📍 OUR FLAGSHIP SPOT',
    flagship_name: 'DABBOOS RESTAURANT',
    flagship_address: 'Prince Sultan St. — The Ultimate Burger & Crunch Experience',
    flagship_feat_1: '🔥 Prepared Fresh Daily',
    flagship_feat_2: '🛵 Fast Direct Delivery',
    flagship_feat_3: '📦 Thermal Crisp-Lock Packaging',
    flagship_order_btn: '🍔 ORDER NOW',
    flagship_map_btn: '📍 GET DIRECTIONS',
    flagship_footer_note: 'PACKED HOT IN SPECIAL CRISP-LOCK THERMAL BOXES',
    sec6_badge: 'THE DABBOOS MANIFESTO',
    sec6_title: 'FEEL THE<br>CHANGE',
    sec6_sub: 'Feel the change with every crispy bite and irresistible hot sauce.',
    sec6_desc: 'At Dabboos, we broke traditional fast food rules! 48-hr spice-brined chicken, ultra-crispy light crunch, and explosive signature dips.',
    sec6_chef_title: 'MASTER CHEF APPROVED',
    sec6_chef_desc: 'Signature seasoning and burgers crafted by hand with passion!',
    sec6_menu_btn: 'EXPLORE FULL MENU & ORDER 🍔',
    sec6_whatsapp_btn: '💬 INSTANT WHATSAPP ORDER',
    sec6_photo_quote: 'Unforgettable moments over the crispiest burgers and loaded fries!',
    sec6_sticker_1: '★ 100% FRESH DAILY ★',
    sec6_sticker_2: '🌶️ SECRET 12-SPICE RECIPE',
    footer_drop_btn: '🌶️ DROP MORE INGREDIENTS',
    footer_drop_hint: '(Click to drop more ingredients & play with them!)',
    footer_nav_home: 'HOME',
    footer_nav_menu: 'FULL MENU',
    footer_nav_burgers: 'BURGERS',
    footer_nav_fries: 'LOADED FRIES',
    footer_nav_location: '04. LOCATION',
    footer_copy: '© 2026 DABBOOS RESTAURANT — ALL RIGHTS RESERVED.',
    footer_passion: 'CRAFTED FOR FLAVOR ADDICTS 🔥',
    footer_tagline: 'AUTHENTIC STREET FOOD',
    menu_badge: 'OFFICIAL RESTAURANT MENU',
    menu_fresh: '100% FRESH DAILY',
    menu_title: 'DABBOOS FULL MENU',
    menu_desc: 'Explore our crispy lineup: Burgers, Tenders, Saj wraps, Rice bowls, and Family Boxes.',
    menu_search_placeholder: 'Search menu items (e.g., Harissa, Tenders, Box)...',
    tab_all: '🔥 All Items',
    tab_burgers: '🍔 Burgers',
    tab_crispy: '🍗 Crispy & Tenders',
    tab_saj: '🌯 Saj & Wraps',
    tab_rice: '🍛 Rice & Pasta',
    tab_sides: '🍟 Sides & Boxes',
    menu_no_results_title: 'No items match your search!',
    menu_no_results_desc: 'Try searching for another keyword like "burger", "tenders", or "box".',
    menu_back_home: '← Back to Home & Interactive Visuals',
    btn_add: '+ ADD',
    currency: 'SAR',
    cart_pill_label: 'CART:',
    cart_title: 'YOUR ORDER CART',
    cart_sub: 'DABBOOS ORDER CART',
    cart_total_label: 'Total Amount (VAT incl.):',
    cart_checkout: '💬 CHECKOUT VIA WHATSAPP',
    cart_clear: 'Clear Cart',
    cart_empty_title: 'Your cart is empty',
    cart_empty_desc: 'Explore the menu and add your favorite meals!',
    toast_added: 'Added "{title}" to cart!'
  }
};
window.I18N_DICT = I18N_DICT;

let currentLang = 'ar';
window.currentLang = currentLang;

function initI18n() {
  const savedLang = localStorage.getItem('dabboos_lang');
  if (savedLang === 'en' || savedLang === 'ar') {
    currentLang = savedLang;
  } else {
    currentLang = 'ar';
  }
  window.currentLang = currentLang;
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  currentLang = lang;
  window.currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

  const dict = I18N_DICT[lang];
  if (!dict) return;

  // Update Title
  if (window.currentView === 'menu') {
    document.title = dict.doc_title_menu;
  } else {
    document.title = dict.doc_title_home;
  }

  // Update Language Toggle Button text (shows EN when in AR, عربي when in EN)
  const langToggleText = document.getElementById('lang-toggle-text');
  if (langToggleText) {
    langToggleText.textContent = (lang === 'ar') ? 'EN' : 'عربي';
  }

  // Update text elements
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) {
      el.textContent = dict[key];
    }
  });

  // Update HTML elements (with <br>, etc.)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    if (dict[key] !== undefined) {
      el.innerHTML = dict[key];
    }
  });

  // Update input placeholder elements
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key] !== undefined) {
      el.placeholder = dict[key];
    }
  });

  // Re-render menu items
  if (typeof window.renderMenuItems === 'function') {
    window.renderMenuItems();
  }

  // Re-render cart and badges
  if (typeof renderCart === 'function') {
    renderCart();
  }
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }

  localStorage.setItem('dabboos_lang', lang);

  if (window.ScrollTrigger) {
    ScrollTrigger.refresh();
  }
}

window.toggleLanguage = function() {
  const nextLang = (currentLang === 'ar') ? 'en' : 'ar';
  applyLanguage(nextLang);
};

/* ==========================================================================
   13. ULTRA-SIMPLE, BILINGUAL MENU DATA (22 Complete Menu Items)
   ========================================================================== */
const MENU_DATA = [
  // 🍔 1. Burgers (البرجر)
  {
    id: 'b1',
    category: 'burgers',
    nameAr: 'وجبة برجر هريسة التمر',
    nameEn: 'Date Harissa Chicken Burger Meal',
    tagAr: 'دجاج مقرمش • صوص التمر • بطاطا ومشروب',
    tagEn: 'Crispy chicken • Date harissa • Fries & drink',
    price: 23.50,
    image: 'assets/images/menu-date-harissa.jpg'
  },
  {
    id: 'b2',
    category: 'burgers',
    nameAr: 'وجبة برجر دجاج حراق',
    nameEn: 'Spicy Chicken Burger Meal',
    tagAr: 'دجاج حراق • شيدر وثوم • بطاطا ومشروب',
    tagEn: 'Spicy fillet • Cheddar & garlic • Fries & drink',
    price: 22.50,
    image: 'assets/images/crispy-burger-card.jpg'
  },
  {
    id: 'b3',
    category: 'burgers',
    nameAr: 'برجر دجاج كلاسيك',
    nameEn: 'Classic Chicken Burger',
    tagAr: 'مفرد 19 • وجبة كاملة 32',
    tagEn: 'Sandwich 19 • Full Meal 32',
    price: 19.00,
    image: 'assets/images/hero-burger-cutout.png'
  },
  {
    id: 'b4',
    category: 'burgers',
    nameAr: 'وجبة برجر هوني سريراتشا',
    nameEn: 'Honey Sriracha Burger Meal',
    tagAr: 'عسل وسريراتشا • بطاطا ومشروب',
    tagEn: 'Honey sriracha glaze • Fries & drink',
    price: 27.50,
    image: 'assets/images/volcano-dip-card.jpg'
  },

  // 🍗 2. Crispy & Tenders (الوجبات المقرمشة والتندرز)
  {
    id: 't1',
    category: 'crispy',
    nameAr: 'وجبة تندر 3 قطع',
    nameEn: '3 Pcs Crispy Tenders Meal',
    tagAr: 'بطاطا حائل • عيش دبوس • صوصات',
    tagEn: 'Hail fries • Dabboos bread • Dips',
    price: 18.50,
    image: 'assets/images/menu-tenders-meal.jpg'
  },
  {
    id: 't2',
    category: 'crispy',
    nameAr: 'وجبة روبيان 13 قطعة',
    nameEn: '13 Pcs Crispy Shrimp Meal',
    tagAr: 'بطاطا • خبز صاج • صوص كوكتيل',
    tagEn: 'Fries • Saj bread • Cocktail sauce',
    price: 30.00,
    image: 'assets/images/menu-shrimp-saj.jpg'
  },
  {
    id: 't3',
    category: 'crispy',
    nameAr: 'وجبة أطفال (بايتس)',
    nameEn: 'Kids Chicken Bites Meal',
    tagAr: '5 بايتس • بطاطا • عصير تفاح',
    tagEn: '5 Bites • Fries • Organic apple juice',
    price: 15.50,
    image: 'assets/images/menu-tenders-meal.jpg'
  },

  // 🌯 3. Saj & Wraps (الصاج والتويستر)
  {
    id: 's1',
    category: 'saj',
    nameAr: 'صاج دجاج (مشوي / كريسبي)',
    nameEn: 'Chicken Saj Wrap (Grilled/Crispy)',
    tagAr: 'ساندويتش 15 • وجبة 28',
    tagEn: 'Wrap 15 • Full Meal 28',
    price: 15.00,
    image: 'assets/images/menu-shrimp-saj.jpg'
  },
  {
    id: 's2',
    category: 'saj',
    nameAr: 'صاج كريسبي روبيان',
    nameEn: 'Crispy Shrimp Saj Wrap',
    tagAr: 'روبيان مقرمش • صوص خاص',
    tagEn: 'Crispy shrimp • Signature sauce',
    price: 22.50,
    image: 'assets/images/menu-shrimp-saj.jpg'
  },
  {
    id: 's3',
    category: 'saj',
    nameAr: 'بوريتو دبوس (مشوي / تشيبوتلي)',
    nameEn: 'Dabboos Burrito (Grilled/Chipotle)',
    tagAr: 'أرز • جبن • صوص مدخن',
    tagEn: 'Seasoned rice • Cheese • Smoky chipotle',
    price: 34.00,
    image: 'assets/images/menu-burrito-bowl.jpg'
  },

  // 🍛 4. Rice & Pasta (الأرز والمكرونة)
  {
    id: 'r1',
    category: 'rice',
    nameAr: 'المشوي بالرز البسمتي',
    nameEn: 'Grilled Chicken Basmati Rice',
    tagAr: 'مسحب مشوي • لبن ودقوس',
    tagEn: 'Grilled strips • Yogurt & Daqoos',
    price: 25.00,
    image: 'assets/images/menu-rice-bowl.jpg'
  },
  {
    id: 'r2',
    category: 'rice',
    nameAr: 'المشوي بالرز الأحمر',
    nameEn: 'Grilled Chicken Red Rice',
    tagAr: 'صدر ونصف مشوي • أرز أحمر',
    tagEn: '1.5 Grilled breast • Red rice',
    price: 20.00,
    image: 'assets/images/menu-rice-bowl.jpg'
  },
  {
    id: 'r3',
    category: 'rice',
    nameAr: 'تندر بالرز الأحمر',
    nameEn: 'Crispy Tenders Red Rice',
    tagAr: 'تندر مقرمش • أرز أحمر',
    tagEn: 'Crispy tenders • Red rice',
    price: 26.50,
    image: 'assets/images/menu-tenders-meal.jpg'
  },
  {
    id: 'r4',
    category: 'rice',
    nameAr: 'روبيان بالرز الأحمر',
    nameEn: 'Crispy Shrimp Red Rice',
    tagAr: 'روبيان مقرمش • أرز أحمر',
    tagEn: 'Crispy shrimp • Red rice',
    price: 29.50,
    image: 'assets/images/menu-shrimp-saj.jpg'
  },
  {
    id: 'r5',
    category: 'rice',
    nameAr: 'المشوي بالمكرونة الحمراء',
    nameEn: 'Grilled Chicken Red Pasta',
    tagAr: 'دجاج مشوي • مكرونة حمراء',
    tagEn: 'Grilled chicken • Rich red pasta',
    price: 24.00,
    image: 'assets/images/menu-rice-bowl.jpg'
  },

  // 🍟 5. Sides & Boxes (الجانبية والبوكسات)
  {
    id: 'sd1',
    category: 'sides',
    nameAr: 'سريراتشا تندرز فرايز',
    nameEn: 'Sriracha Tenders Loaded Fries',
    tagAr: 'بطاطا محملة بالدجاج والصوص',
    tagEn: 'Fries loaded with chicken & sriracha',
    price: 24.00,
    image: 'assets/images/loaded-fries-card.jpg'
  },
  {
    id: 'sd2',
    category: 'sides',
    nameAr: 'ماك أند تشيز دبوس',
    nameEn: 'Dabboos Mac & Cheese',
    tagAr: 'شيدر ذائبة • فتات البانكو',
    tagEn: 'Melted cheddar • Crispy panko',
    price: 12.00,
    image: 'assets/images/loaded-fries-card.jpg'
  },
  {
    id: 'sd3',
    category: 'sides',
    nameAr: 'كرسبي ذرة',
    nameEn: 'Crispy Corn Ribs',
    tagAr: 'أضلاع ذرة مقرمشة متبلة',
    tagEn: 'Spiced crispy corn ribs',
    price: 13.00,
    image: 'assets/images/menu-burrito-bowl.jpg'
  },
  {
    id: 'sd4',
    category: 'sides',
    nameAr: 'بطاطا بملح الهيمالايا',
    nameEn: 'Himalayan Salt Fries',
    tagAr: 'بطاطا حائل الذهبية',
    tagEn: 'Golden Hail crinkle fries',
    price: 11.00,
    image: 'assets/images/loaded-fries-card.jpg'
  },
  {
    id: 'sd5',
    category: 'sides',
    nameAr: 'كولسلو منزلي',
    nameEn: 'Homemade Coleslaw',
    tagAr: 'سلطة كولسلو طازجة',
    tagEn: 'Fresh creamy house coleslaw',
    price: 8.50,
    image: 'assets/images/crispy-burger-card.jpg'
  },
  {
    id: 'fx1',
    category: 'sides',
    nameAr: 'دا-بوكس (4-6 أشخاص)',
    nameEn: 'DA-BOX (4–6 Persons)',
    tagAr: 'بوكس الجمعات المشكل',
    tagEn: 'Ultimate sharing party box',
    price: 150.00,
    image: 'assets/images/menu-family-box.jpg'
  },
  {
    id: 'fx2',
    category: 'sides',
    nameAr: 'غمسها دبوكس (بوكس العائلة)',
    nameEn: 'Ghammisha Family Box',
    tagAr: '25 جناح • 8 تندر • بطاطا وصوصات',
    tagEn: '25 Wings • 8 Tenders • Fries & dips',
    price: 170.00,
    image: 'assets/images/menu-family-box.jpg'
  }
];
window.MENU_DATA = MENU_DATA;

function initMenuPage() {
  const gridContainer = document.getElementById('menu-items-grid');
  const searchInput = document.getElementById('menu-search-input');
  const categoryTabs = document.querySelectorAll('.category-tab-btn');
  const backHomeBtn = document.getElementById('nav-back-home');

  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.switchView('home');
    });
  }

  let activeCategory = 'all';
  let searchTerm = '';

  function renderMenuItems() {
    if (!gridContainer) return;

    const query = searchTerm.toLowerCase();
    const filtered = MENU_DATA.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const title = currentLang === 'ar' ? item.nameAr : item.nameEn;
      const tag = currentLang === 'ar' ? item.tagAr : item.tagEn;
      const matchesSearch = query === '' || 
        title.toLowerCase().includes(query) || 
        tag.toLowerCase().includes(query) ||
        item.nameAr.includes(query) ||
        item.nameEn.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });

    const dict = I18N_DICT[currentLang] || I18N_DICT.ar;

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <span class="text-5xl block mb-3">🔍</span>
          <h3 class="font-arabic font-extrabold text-2xl text-gray-800 mb-2">${dict.menu_no_results_title}</h3>
          <p class="font-arabic text-gray-600 text-sm">${dict.menu_no_results_desc}</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = filtered.map((item) => {
      const title = currentLang === 'ar' ? item.nameAr : item.nameEn;
      const tag = currentLang === 'ar' ? item.tagAr : item.tagEn;
      const formattedPrice = `${item.price.toFixed(2)} ${dict.currency}`;

      return `
        <div class="menu-product-card p-2 sm:p-3.5 flex flex-col justify-between">
          <div>
            <!-- 1. Large Appetizing Image (decoding="async", NO lazy loading, explicit 4/3 aspect ratio) -->
            <div class="relative w-full aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden border-2 border-black bg-amber-50 mb-2 sm:mb-3">
              <img 
                src="${item.image}" 
                alt="${title}" 
                decoding="async"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                style="aspect-ratio: 4 / 3; object-fit: cover; width: 100%; display: block;"
              >
            </div>

            <!-- 2. Dish Title (Allows wrap up to 2 lines without any ellipsis truncation) -->
            <h3 class="font-arabic font-extrabold text-[13.5px] sm:text-base text-gray-900 leading-[1.3] mb-1 min-h-[36px] flex items-center text-start">
              ${title}
            </h3>

            <!-- 3. Micro-Tag (Clean badge, no ellipsis clipping) -->
            <div class="mb-2 sm:mb-3 text-start">
              <span class="font-arabic text-[10.5px] sm:text-xs font-bold text-gray-700 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-md inline-block max-w-full leading-normal">
                ${tag}
              </span>
            </div>
          </div>

          <!-- 4. Clean Starting Price + Touch-Friendly Quick '+' Button (Never collides) -->
          <div class="pt-2 sm:pt-3 border-t-2 border-black/10 flex items-center justify-between mt-auto gap-1">
            <span class="font-bungee text-xs sm:text-base text-dabboos-blue shrink-0">
              ${formattedPrice}
            </span>
            <button 
              onclick="window.addToCart('${item.id}')"
              class="btn-dabboos py-1.5 px-2.5 sm:px-4 min-h-[36px] text-xs font-bungee flex items-center justify-center gap-1 cursor-pointer shrink-0"
              aria-label="Add ${title} to cart"
            >
              <span>${dict.btn_add}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  window.renderMenuItems = renderMenuItems;
  renderMenuItems();

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      if (searchTerm.length > 0 && activeCategory !== 'all') {
        activeCategory = 'all';
        categoryTabs.forEach((t) => {
          if ((t.getAttribute('data-cat') || 'all') === 'all') {
            t.classList.add('active');
          } else {
            t.classList.remove('active');
          }
        });
      }
      renderMenuItems();
    });
  }

  categoryTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-cat') || 'all';
      renderMenuItems();
    });
  });
}

/* ==========================================================================
   14. Interactive Cart Drawer & Bilingual WhatsApp Order Generator
   ========================================================================== */
let cart = [];
window.cart = cart;

function initCart() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartTriggerPill = document.getElementById('cart-floating-pill');

  window.openCart = function() {
    if (!cartDrawer || !cartBackdrop) return;
    cartBackdrop.classList.remove('hidden');
    cartBackdrop.classList.remove('pointer-events-none');
    gsap.to(cartBackdrop, { opacity: 1, duration: 0.3 });
    gsap.to(cartDrawer, { x: 0, duration: 0.4, ease: 'power3.out' });
    renderCart();
  };

  window.closeCart = function() {
    if (!cartDrawer || !cartBackdrop) return;
    gsap.to(cartDrawer, { x: '100%', duration: 0.3, ease: 'power3.in' });
    gsap.to(cartBackdrop, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        cartBackdrop.classList.add('hidden');
        cartBackdrop.classList.add('pointer-events-none');
      }
    });
  };

  if (cartCloseBtn) cartCloseBtn.addEventListener('click', window.closeCart);
  if (cartBackdrop) {
    cartBackdrop.addEventListener('click', (e) => {
      if (e.target === cartBackdrop) window.closeCart();
    });
  }
  if (cartTriggerPill) {
    cartTriggerPill.addEventListener('click', window.openCart);
  }

  window.addToCart = function(productId) {
    const item = MENU_DATA.find((m) => m.id === productId);
    if (!item) return;

    const existing = cart.find((c) => c.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ ...item, qty: 1 });
    }

    updateCartBadge();
    const itemTitle = currentLang === 'ar' ? item.nameAr : item.nameEn;
    const toastTemplate = (I18N_DICT[currentLang] || I18N_DICT.ar).toast_added;
    showToastNotification(toastTemplate.replace('{title}', itemTitle));
  };

  window.changeQty = function(productId, delta) {
    const item = cart.find((c) => c.id === productId);
    if (!item) return;

    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter((c) => c.id !== productId);
    }
    window.cart = cart;
    updateCartBadge();
    renderCart();
  };

  window.clearCart = function() {
    cart = [];
    window.cart = cart;
    updateCartBadge();
    renderCart();
  };

  window.checkoutWhatsApp = function() {
    if (cart.length === 0) return;

    let total = 0;
    let message = '';

    if (currentLang === 'ar') {
      message = 'السلام عليكم مطعم دبوس 🔥\nأرغب في تقديم طلب جديد:\n\n';
      cart.forEach((item, idx) => {
        const itemSubtotal = item.price * item.qty;
        total += itemSubtotal;
        message += `${idx + 1}. ${item.nameAr} (العدد: ${item.qty}) — ${itemSubtotal.toFixed(2)} ر.س\n`;
      });
      message += `\n💰 الإجمالي: ${total.toFixed(2)} ر.س\n`;
      message += `📍 العنوان: يرجى إرسال اللوكيشن أو تحديد الفرع للاستلام.\nشكراً لكم!`;
    } else {
      message = 'Hello DABBOOS Restaurant 🔥\nI would like to place a new order:\n\n';
      cart.forEach((item, idx) => {
        const itemSubtotal = item.price * item.qty;
        total += itemSubtotal;
        message += `${idx + 1}. ${item.nameEn} (Qty: ${item.qty}) — ${itemSubtotal.toFixed(2)} SAR\n`;
      });
      message += `\n💰 Total: ${total.toFixed(2)} SAR\n`;
      message += `📍 Delivery Address: Please find my location or pickup branch.\nThank you!`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/966500000000?text=${encoded}`, '_blank');
  };
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count-badge');
  const pillTotal = document.getElementById('cart-pill-total');
  const pillContainer = document.getElementById('cart-floating-pill');

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const dict = I18N_DICT[currentLang] || I18N_DICT.ar;

  if (badge) badge.textContent = totalItems;
  if (pillTotal) pillTotal.textContent = `${totalPrice.toFixed(2)} ${dict.currency}`;

  if (pillContainer) {
    if (totalItems > 0) {
      pillContainer.classList.remove('hidden');
      gsap.fromTo(pillContainer, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
    } else {
      pillContainer.classList.add('hidden');
    }
  }
}

function renderCart() {
  const itemsContainer = document.getElementById('cart-items-container');
  const totalAmountEl = document.getElementById('cart-total-amount');
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  const dict = I18N_DICT[currentLang] || I18N_DICT.ar;

  if (!itemsContainer) return;

  if (cart.length === 0) {
    itemsContainer.innerHTML = `
      <div class="py-16 text-center">
        <span class="text-5xl block mb-2">🛒</span>
        <h4 class="font-arabic font-extrabold text-lg text-gray-800">${dict.cart_empty_title}</h4>
        <p class="font-arabic text-xs text-gray-500 mt-1">${dict.cart_empty_desc}</p>
      </div>
    `;
    if (totalAmountEl) totalAmountEl.textContent = `0.00 ${dict.currency}`;
    if (checkoutBtn) checkoutBtn.classList.add('opacity-50', 'pointer-events-none');
    return;
  }

  if (checkoutBtn) checkoutBtn.classList.remove('opacity-50', 'pointer-events-none');

  let total = 0;
  itemsContainer.innerHTML = cart.map((item) => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;
    const title = currentLang === 'ar' ? item.nameAr : item.nameEn;
    return `
      <div class="p-3 bg-white rounded-xl border-2 border-black shadow-[3px_3px_0px_#111] flex items-center justify-between gap-3">
        <img src="${item.image}" alt="${title}" class="w-14 h-14 object-cover rounded-lg border border-black shrink-0">
        <div class="flex-1 min-w-0 text-start">
          <h4 class="font-arabic font-bold text-xs text-gray-900 truncate">${title}</h4>
          <span class="font-bungee text-xs text-dabboos-red">${item.price.toFixed(2)} ${dict.currency}</span>
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          <button onclick="window.changeQty('${item.id}', -1)" class="w-6 h-6 rounded bg-gray-200 text-black font-bungee flex items-center justify-center text-xs hover:bg-dabboos-red hover:text-white transition-colors">-</button>
          <span class="font-bungee text-xs w-4 text-center">${item.qty}</span>
          <button onclick="window.changeQty('${item.id}', 1)" class="w-6 h-6 rounded bg-dabboos-yellow text-black font-bungee flex items-center justify-center text-xs hover:scale-105 transition-transform">+</button>
        </div>
      </div>
    `;
  }).join('');

  if (totalAmountEl) totalAmountEl.textContent = `${total.toFixed(2)} ${dict.currency}`;
}

function showToastNotification(text) {
  let toast = document.getElementById('dabboos-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dabboos-toast';
    toast.className = 'fixed z-[100] bg-dabboos-dark text-white font-arabic font-bold text-xs py-2.5 px-4 rounded-full border-2 border-dabboos-yellow shadow-[4px_4px_0px_#000] pointer-events-none flex items-center gap-2 transition-all';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>🔥</span><span>${text}</span>`;
  gsap.fromTo(toast, 
    { y: 30, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
  );
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    gsap.to(toast, { y: 20, opacity: 0, duration: 0.3 });
  }, 2400);
}
