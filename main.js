/**
 * VIVEDFX — Premium Marketing Agency
 * Main JavaScript: Animations, Interactions & Behaviors
 */

'use strict';

/* ============================================================
   UTILITY: DOM Query Helpers
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. HEADER — Scroll-activated glass effect
   ============================================================ */
(function initHeader() {
  const header = $('#header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   2. HAMBURGER / MOBILE MENU
   ============================================================ */
(function initMobileMenu() {
  const hamburger = $('#hamburger');
  const mobileMenu = $('#mobile-menu');
  if (!hamburger || !mobileMenu) return;

  const toggle = (open) => {
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', open);
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('menu-open', open);
  };

  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('active');
    toggle(!isOpen);
  });

  // Close on any link click inside the mobile menu
  $$('a', mobileMenu).forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') toggle(false);
  });
})();

/* ============================================================
   3. SCROLL REVEAL — Intersection Observer
   ============================================================ */
(function initScrollReveal() {
  const targets = $$('.reveal-up, .reveal-scale');
  if (!targets.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  targets.forEach(el => observer.observe(el));
})();

/* ============================================================
   4. NUMBER COUNT-UP ANIMATION
   ============================================================ */
(function initCountUp() {
  const statNumbers = $$('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. MAGNETIC BUTTONS
   ============================================================ */
(function initMagneticButtons() {
  const buttons = $$('.magnetic-btn');
  if (!buttons.length) return;

  // Only on non-touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const STRENGTH = 0.35;

  buttons.forEach(btn => {
    let raf;

    btn.addEventListener('mousemove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) * STRENGTH;
        const dy = (e.clientY - cy) * STRENGTH;
        btn.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    });

    btn.addEventListener('mouseleave', () => {
      cancelAnimationFrame(raf);
      btn.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      btn.style.transform = 'translate(0, 0)';
      setTimeout(() => { btn.style.transition = ''; }, 500);
    });
  });
})();

/* ============================================================
   6. PORTFOLIO FILTER
   ============================================================ */
(function initPortfolioFilter() {
  const filterBtns = $$('.filter-btn');
  const portfolioItems = $$('.portfolio-item');
  if (!filterBtns.length || !portfolioItems.length) return;

  const isHomepage = $('.portfolio-masonry') !== null;

  const applyFilter = (filter) => {
    let shownCount = 0;
    portfolioItems.forEach(item => {
      const cat = item.dataset.category;
      let shouldShow = false;

      if (isHomepage) {
        if (filter === 'all') {
          if (shownCount < 4) {
            shouldShow = true;
            shownCount++;
          }
        } else if (cat === filter) {
          if (shownCount < 4) {
            shouldShow = true;
            shownCount++;
          }
        }
      } else {
        if (filter === 'all' || cat === filter) {
          shouldShow = true;
        }
      }

      if (shouldShow) {
        item.classList.remove('hidden');
        item.style.animation = 'none';
        item.offsetHeight; // reflow
        item.style.animation = 'fade-in-item 0.4s ease forwards';
      } else {
        item.classList.add('hidden');
      }
    });
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      applyFilter(filter);
    });
  });

  // Apply initial filter on homepage load to show only 4 items
  if (isHomepage) {
    applyFilter('all');
  }
})();

/* ============================================================
   6b. PORTFOLIO OVERLAY — Mobile tap toggle
   First tap  → show overlay
   Second tap → hide overlay
   ============================================================ */
(function initPortfolioTouchOverlay() {
  // Only on touch devices
  if (!window.matchMedia('(pointer: coarse)').matches) return;

  const items = $$('.portfolio-item');
  if (!items.length) return;

  items.forEach(item => {
    item.addEventListener('click', (e) => {
      const isActive = item.classList.contains('touch-active');

      // Close all open overlays first
      items.forEach(i => i.classList.remove('touch-active'));

      // If it wasn't open, open it; if it was open, leave it closed
      if (!isActive) {
        item.classList.add('touch-active');
      }

      e.stopPropagation();
    });
  });

  // Tap anywhere outside → close all
  document.addEventListener('click', () => {
    items.forEach(i => i.classList.remove('touch-active'));
  });
})();

/* ============================================================
   7. INDUSTRY CARDS — Toggle expand/collapse
   ============================================================ */
(function initIndustryCards() {
  const cards = $$('.industry-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const trigger = $('.industry-card-header', card);

    const toggle = () => {
      const isExpanded = card.getAttribute('aria-expanded') === 'true';
      // Close all others
      cards.forEach(c => {
        if (c !== card) c.setAttribute('aria-expanded', 'false');
      });
      card.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    };

    card.addEventListener('click', toggle);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
})();

/* ============================================================
   8. TESTIMONIALS SLIDER
   ============================================================ */
(function initTestimonialsSlider() {
  const track = $('#testimonials-track');
  const prevBtn = $('#testimonial-prev');
  const nextBtn = $('#testimonial-next');
  const dots = $$('.testimonial-dot');
  if (!track) return;

  const slides = $$('.testimonial-slide', track);
  const wrapper = track.closest('.testimonials-slider-wrapper');
  let current = 0;
  let autoPlay;
  const AUTOPLAY_DELAY = 5000;

  // Sync wrapper height to the currently active slide to prevent
  // vertical clipping caused by overflow:hidden on the wrapper.
  const syncHeight = () => {
    if (!wrapper) return;
    const activeSlide = slides[current];
    if (!activeSlide) return;
    // Use scrollHeight so padding + full text content is measured
    const slideH = activeSlide.scrollHeight;
    // Controls live outside the track — keep wrapper height = slide only;
    // the controls sit below in normal flow so no extra height needed here.
    wrapper.style.minHeight = slideH + 'px';
  };

  const goTo = (index) => {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', i === current);
    });
    // After transition completes, re-sync height
    setTimeout(syncHeight, 650);
  };

  const startAutoPlay = () => {
    autoPlay = setInterval(() => goTo(current + 1), AUTOPLAY_DELAY);
  };

  const stopAutoPlay = () => clearInterval(autoPlay);

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); stopAutoPlay(); startAutoPlay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); stopAutoPlay(); startAutoPlay(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); stopAutoPlay(); startAutoPlay(); });
  });

  // Touch/drag support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoPlay();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
    startAutoPlay();
  }, { passive: true });

  // Pause on hover
  track.closest('.testimonials-slider-wrapper')?.addEventListener('mouseenter', stopAutoPlay);
  track.closest('.testimonials-slider-wrapper')?.addEventListener('mouseleave', startAutoPlay);

  // Re-sync height on orientation change / resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncHeight, 150);
  }, { passive: true });

  goTo(0);
  // Initial height sync after layout settles
  setTimeout(syncHeight, 100);
  startAutoPlay();
})();

/* ============================================================
   9. CONTACT FORM
   ============================================================ */
(function initContactForm() {
  const form = $('#contact-form');
  const successEl = $('#form-success');
  if (!form) return;

  const showError = (input, msg) => {
    input.style.borderColor = '#FF1023';
    let errEl = input.nextElementSibling;
    if (!errEl || !errEl.classList.contains('form-err')) {
      errEl = document.createElement('span');
      errEl.className = 'form-err';
      errEl.style.cssText = 'color:#FF1023;font-size:0.72rem;font-weight:500;';
      input.parentNode.appendChild(errEl);
    }
    errEl.textContent = msg;
  };

  const clearErrors = () => {
    $$('.form-err', form).forEach(el => el.remove());
    $$('.form-input', form).forEach(el => el.style.borderColor = '');
  };

  const validate = () => {
    clearErrors();
    let valid = true;

    const name = $('#contact-name');
    const email = $('#contact-email');
    const business = $('#contact-business');
    const message = $('#contact-message');

    if (!name.value.trim()) { showError(name, 'Please enter your name'); valid = false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, 'Please enter a valid email address'); valid = false;
    }
    if (!business.value) { showError(business, 'Please select your industry'); valid = false; }
    if (!message.value.trim()) { showError(message, 'Please describe your project'); valid = false; }

    return valid;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;

    const submitBtn = $('#form-submit-btn');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending...';

    // Simulate form submission
    setTimeout(() => {
      form.style.display = 'none';
      if (successEl) successEl.style.display = 'flex';
    }, 1200);
  });
})();

/* ============================================================
   10. SMOOTH SCROLL — Anchor links
   ============================================================ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = $(href);
      if (!target) return;
      e.preventDefault();
      const headerH = $('#header')?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   11. FLOATING BADGES — Subtle float on scroll
   ============================================================ */
(function initFloatingBadges() {
  const heroBadges = $$('.hero-floating-badge');
  if (!heroBadges.length) return;

  if (window.matchMedia('(pointer: coarse)').matches) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        heroBadges.forEach((badge, i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          badge.style.transform = `translateY(${dir * scrollY * 0.05}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ============================================================
   12. MOBILE STICKY CTA — Show after scrolling past hero
   ============================================================ */
(function initMobileStickyCTA() {
  const cta = $('#mobile-sticky-cta');
  const hero = $('#hero');
  if (!cta || !hero) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      cta.style.display = entry.isIntersecting ? 'none' : 'block';
    });
  }, { threshold: 0 });

  observer.observe(hero);
})();

/* ============================================================
   13. PORTFOLIO ITEM — Fade-in keyframe injection
   ============================================================ */
(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fade-in-item {
      from { opacity: 0; transform: scale(0.97) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

/* ============================================================
   14. CURSOR GLOW (Desktop only)
   ============================================================ */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  glow.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 320px; height: 320px;
    background: radial-gradient(circle, rgba(255,16,35,0.06) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.12s ease;
    will-change: transform;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let raf;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      glow.style.left = `${mouseX}px`;
      glow.style.top = `${mouseY}px`;
    });
  }, { passive: true });
})();

/* ============================================================
   15. ACTIVE NAV LINK — Highlight on scroll
   ============================================================ */
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.toggle('active', href === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s));
})();
