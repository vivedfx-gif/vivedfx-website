/**
 * vivedfx â€” Premium Marketing Agency
 * Main JavaScript: Animations, Interactions & Behaviors
 */

'use strict';

/* ============================================================
   UTILITY: DOM Query Helpers
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. HEADER â€” Scroll-activated glass effect
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
   3. SCROLL REVEAL â€” Intersection Observer
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
   6b. PORTFOLIO OVERLAY â€” Mobile tap toggle
   First tap  â†’ show overlay
   Second tap â†’ hide overlay
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

  // Tap anywhere outside â†’ close all
  document.addEventListener('click', () => {
    items.forEach(i => i.classList.remove('touch-active'));
  });
})();

/* ============================================================
   7. INDUSTRY CARDS â€” Toggle expand/collapse
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
    // Controls live outside the track â€” keep wrapper height = slide only;
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
   9. PROJECT MODAL
   ============================================================ */
(function initProjectModal() {
  const backdrop = $('#pm-backdrop');
  const modal = $('#pm-modal');
  const closeBtn = $('#pm-close');
  const form = $('#pm-form');
  const successEl = $('#pm-success');
  const successClose = $('#pm-success-close');
  if (!backdrop || !modal) return;

  // ── Country data ──
  const countries = [
    { code:'EG', name:'Egypt', dial:'+20', flag:'🇪🇬' },
    { code:'SA', name:'Saudi Arabia', dial:'+966', flag:'🇸🇦' },
    { code:'AE', name:'United Arab Emirates', dial:'+971', flag:'🇦🇪' },
    { code:'QA', name:'Qatar', dial:'+974', flag:'🇶🇦' },
    { code:'KW', name:'Kuwait', dial:'+965', flag:'🇰🇼' },
    { code:'BH', name:'Bahrain', dial:'+973', flag:'🇧🇭' },
    { code:'OM', name:'Oman', dial:'+968', flag:'🇴🇲' },
    { code:'JO', name:'Jordan', dial:'+962', flag:'🇯🇴' },
    { code:'LB', name:'Lebanon', dial:'+961', flag:'🇱🇧' },
    { code:'IQ', name:'Iraq', dial:'+964', flag:'🇮🇶' },
    { code:'LY', name:'Libya', dial:'+218', flag:'🇱🇾' },
    { code:'TN', name:'Tunisia', dial:'+216', flag:'🇹🇳' },
    { code:'DZ', name:'Algeria', dial:'+213', flag:'🇩🇿' },
    { code:'MA', name:'Morocco', dial:'+212', flag:'🇲🇦' },
    { code:'SD', name:'Sudan', dial:'+249', flag:'🇸🇩' },
    { code:'PS', name:'Palestine', dial:'+970', flag:'🇵🇸' },
    { code:'SY', name:'Syria', dial:'+963', flag:'🇸🇾' },
    { code:'YE', name:'Yemen', dial:'+967', flag:'🇾🇪' },
    { code:'US', name:'United States', dial:'+1', flag:'🇺🇸' },
    { code:'GB', name:'United Kingdom', dial:'+44', flag:'🇬🇧' },
    { code:'CA', name:'Canada', dial:'+1', flag:'🇨🇦' },
    { code:'AU', name:'Australia', dial:'+61', flag:'🇦🇺' },
    { code:'DE', name:'Germany', dial:'+49', flag:'🇩🇪' },
    { code:'FR', name:'France', dial:'+33', flag:'🇫🇷' },
    { code:'IT', name:'Italy', dial:'+39', flag:'🇮🇹' },
    { code:'ES', name:'Spain', dial:'+34', flag:'🇪🇸' },
    { code:'PT', name:'Portugal', dial:'+351', flag:'🇵🇹' },
    { code:'NL', name:'Netherlands', dial:'+31', flag:'🇳🇱' },
    { code:'BE', name:'Belgium', dial:'+32', flag:'🇧🇪' },
    { code:'CH', name:'Switzerland', dial:'+41', flag:'🇨🇭' },
    { code:'AT', name:'Austria', dial:'+43', flag:'🇦🇹' },
    { code:'SE', name:'Sweden', dial:'+46', flag:'🇸🇪' },
    { code:'NO', name:'Norway', dial:'+47', flag:'🇳🇴' },
    { code:'DK', name:'Denmark', dial:'+45', flag:'🇩🇰' },
    { code:'FI', name:'Finland', dial:'+358', flag:'🇫🇮' },
    { code:'IE', name:'Ireland', dial:'+353', flag:'🇮🇪' },
    { code:'PL', name:'Poland', dial:'+48', flag:'🇵🇱' },
    { code:'CZ', name:'Czech Republic', dial:'+420', flag:'🇨🇿' },
    { code:'RO', name:'Romania', dial:'+40', flag:'🇷🇴' },
    { code:'HU', name:'Hungary', dial:'+36', flag:'🇭🇺' },
    { code:'BG', name:'Bulgaria', dial:'+359', flag:'🇧🇬' },
    { code:'HR', name:'Croatia', dial:'+385', flag:'🇭🇷' },
    { code:'SK', name:'Slovakia', dial:'+421', flag:'🇸🇰' },
    { code:'SI', name:'Slovenia', dial:'+386', flag:'🇸🇮' },
    { code:'LT', name:'Lithuania', dial:'+370', flag:'🇱🇹' },
    { code:'LV', name:'Latvia', dial:'+371', flag:'🇱🇻' },
    { code:'UA', name:'Ukraine', dial:'+380', flag:'🇺🇦' },
    { code:'RU', name:'Russia', dial:'+7', flag:'🇷🇺' },
    { code:'TR', name:'Turkey', dial:'+90', flag:'🇹🇷' },
    { code:'IN', name:'India', dial:'+91', flag:'🇮🇳' },
    { code:'CN', name:'China', dial:'+86', flag:'🇨🇳' },
    { code:'JP', name:'Japan', dial:'+81', flag:'🇯🇵' },
    { code:'KR', name:'South Korea', dial:'+82', flag:'🇰🇷' },
    { code:'BR', name:'Brazil', dial:'+55', flag:'🇧🇷' },
    { code:'MX', name:'Mexico', dial:'+52', flag:'🇲🇽' },
    { code:'AR', name:'Argentina', dial:'+54', flag:'🇦🇷' },
    { code:'CL', name:'Chile', dial:'+56', flag:'🇨🇱' },
    { code:'CO', name:'Colombia', dial:'+57', flag:'🇨🇴' },
    { code:'PE', name:'Peru', dial:'+51', flag:'🇵🇪' },
    { code:'PK', name:'Pakistan', dial:'+92', flag:'🇵🇰' },
    { code:'BD', name:'Bangladesh', dial:'+880', flag:'🇧🇩' },
    { code:'ID', name:'Indonesia', dial:'+62', flag:'🇮🇩' },
    { code:'MY', name:'Malaysia', dial:'+60', flag:'🇲🇾' },
    { code:'PH', name:'Philippines', dial:'+63', flag:'🇵🇭' },
    { code:'TH', name:'Thailand', dial:'+66', flag:'🇹🇭' },
    { code:'VN', name:'Vietnam', dial:'+84', flag:'🇻🇳' },
    { code:'SG', name:'Singapore', dial:'+65', flag:'🇸🇬' },
    { code:'NZ', name:'New Zealand', dial:'+64', flag:'🇳🇿' },
    { code:'ZA', name:'South Africa', dial:'+27', flag:'🇿🇦' },
    { code:'NG', name:'Nigeria', dial:'+234', flag:'🇳🇬' },
    { code:'KE', name:'Kenya', dial:'+254', flag:'🇰🇪' },
    { code:'GH', name:'Ghana', dial:'+233', flag:'🇬🇭' },
    { code:'IL', name:'Israel', dial:'+972', flag:'🇮🇱' },
    { code:'CY', name:'Cyprus', dial:'+357', flag:'🇨🇾' },
    { code:'MT', name:'Malta', dial:'+356', flag:'🇲🇹' },
    { code:'IS', name:'Iceland', dial:'+354', flag:'🇮🇸' },
    { code:'LU', name:'Luxembourg', dial:'+352', flag:'🇱🇺' },
    { code:'EE', name:'Estonia', dial:'+372', flag:'🇪🇪' },
    { code:'BY', name:'Belarus', dial:'+375', flag:'🇧🇾' },
    { code:'GE', name:'Georgia', dial:'+995', flag:'🇬🇪' },
    { code:'AM', name:'Armenia', dial:'+374', flag:'🇦🇲' },
    { code:'AZ', name:'Azerbaijan', dial:'+994', flag:'🇦🇿' },
    { code:'KZ', name:'Kazakhstan', dial:'+7', flag:'🇰🇿' },
    { code:'UZ', name:'Uzbekistan', dial:'+998', flag:'🇺🇿' },
    { code:'TM', name:'Turkmenistan', dial:'+993', flag:'🇹🇲' },
    { code:'TJ', name:'Tajikistan', dial:'+992', flag:'🇹🇯' },
    { code:'KG', name:'Kyrgyzstan', dial:'+996', flag:'🇰🇬' },
    { code:'MN', name:'Mongolia', dial:'+976', flag:'🇲🇳' },
    { code:'NP', name:'Nepal', dial:'+977', flag:'🇳🇵' },
    { code:'LK', name:'Sri Lanka', dial:'+94', flag:'🇱🇰' },
    { code:'MM', name:'Myanmar', dial:'+95', flag:'🇲🇲' },
    { code:'KH', name:'Cambodia', dial:'+855', flag:'🇰🇭' },
    { code:'LA', name:'Laos', dial:'+856', flag:'🇱🇦' },
    { code:'BN', name:'Brunei', dial:'+673', flag:'🇧🇳' },
  ];

  const businessTypes = [
    'Marketing Agency','Doctor','Medical Clinic','Dental Clinic','Physical Therapy Clinic',
    'Pharmacy','Hospital','Gym & Fitness Center','Personal Trainer','Nutrition Coach',
    'Restaurant','Cafe','Coffee Shop','Hotel','Real Estate Company','Real Estate Developer',
    'Car Showroom','Car Rental','Car Service Center','E-commerce Store','Fashion Brand',
    'Clothing Brand','Jewelry Brand','Beauty Salon','Barber Shop','Spa & Wellness',
    'Cosmetics Brand','Furniture Store','Interior Design','Architecture Office',
    'Construction Company','Engineering Company','Law Firm','Accounting Office',
    'Financial Services','Insurance Company','Educational Center','School','University',
    'Online Course Creator','Teacher','Photographer','Videographer','Event Planner',
    'Travel Agency','Tourism Company','Mobile Store','Electronics Store','Software Company',
    'SaaS Startup','Technology Company','NGO','Government Organization',
    'Manufacturing Company','Logistics Company','Import & Export','Other'
  ];

  // ── Elements ──
  const phoneTrigger = $('#pm-phone-trigger');
  const phoneFlag = $('#pm-phone-flag');
  const phoneDial = $('#pm-phone-dial');
  const phoneInput = $('#pm-phone');
  const countryDropdown = $('#pm-country-dropdown');
  const countrySearch = $('#pm-country-search');
  const countryList = $('#pm-country-list');
  const businessSearch = $('#pm-business-search');
  const businessHidden = $('#pm-business');
  const businessDropdown = $('#pm-business-dropdown');
  const businessList = $('#pm-business-list');
  const submitBtn = $('#pm-submit');

  let selectedCountry = countries[0]; // Egypt default

  // ── Build country list ──
  countries.forEach((c, i) => {
    const item = document.createElement('div');
    item.className = 'pm-country-item' + (i === 0 ? ' selected' : '');
    item.dataset.index = i;
    item.innerHTML = `<span class="pm-country-flag">${c.flag}</span><span class="pm-country-name">${c.name}</span><span class="pm-country-dial">${c.dial}</span>`;
    countryList.appendChild(item);
  });

  // ── Build business list ──
  businessTypes.forEach(type => {
    const val = type.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    const item = document.createElement('div');
    item.className = 'pm-searchable-item';
    item.textContent = type;
    item.dataset.value = val;
    businessList.appendChild(item);

    const opt = document.createElement('option');
    opt.value = val;
    opt.textContent = type;
    businessHidden.appendChild(opt);
  });

  // ── Open / Close modal ──
  function openModal() {
    backdrop.classList.add('active');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { $('#pm-name')?.focus(); }, 300);
  }

  function closeModal() {
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    resetForm();
  }

  function resetForm() {
    if (!form) return;
    form.reset();
    form.style.display = '';
    successEl.style.display = 'none';
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
    selectedCountry = countries[0];
    phoneFlag.textContent = countries[0].flag;
    phoneDial.textContent = countries[0].dial;
    $$('.pm-field', form).forEach(f => f.classList.remove('error'));
    $$('.pm-err', form).forEach(e => { e.textContent = ''; });
    businessSearch.value = '';
    businessHidden.value = '';
    businessList.querySelectorAll('.pm-searchable-item').forEach(i => i.classList.remove('selected'));
  }

  // ── Wire open buttons ──
  $$('.open-project-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  closeBtn.addEventListener('click', closeModal);
  successClose?.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closeModal();
    }
  });

  // ── Country selector ──
  phoneTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = countryDropdown.classList.contains('active');
    countryDropdown.classList.toggle('active');
    phoneTrigger.classList.toggle('open');
    if (!isOpen) {
      countrySearch.value = '';
      filterCountries('');
      countrySearch.focus();
    }
  });

  phoneTrigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      phoneTrigger.click();
    }
  });

  countryList.addEventListener('click', (e) => {
    const item = e.target.closest('.pm-country-item');
    if (!item) return;
    const idx = parseInt(item.dataset.index);
    selectedCountry = countries[idx];
    phoneFlag.textContent = selectedCountry.flag;
    phoneDial.textContent = selectedCountry.dial;
    countryList.querySelectorAll('.pm-country-item').forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');
    countryDropdown.classList.remove('active');
    phoneTrigger.classList.remove('open');
    phoneInput.focus();
  });

  countrySearch.addEventListener('input', () => {
    filterCountries(countrySearch.value.toLowerCase());
  });

  countrySearch.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      countryDropdown.classList.remove('active');
      phoneTrigger.classList.remove('open');
    }
  });

  function filterCountries(q) {
    countryList.querySelectorAll('.pm-country-item').forEach(item => {
      const name = item.querySelector('.pm-country-name').textContent.toLowerCase();
      const dial = item.querySelector('.pm-country-dial').textContent;
      item.classList.toggle('hidden', !name.includes(q) && !dial.includes(q));
    });
  }

  // Auto-detect country from phone input
  phoneInput.addEventListener('input', () => {
    let val = phoneInput.value.replace(/[\s\-()]/g, '');
    if (val.startsWith('+')) {
      for (let len = 4; len >= 1; len--) {
        const prefix = val.substring(0, len + 1);
        const match = countries.find(c => c.dial === prefix);
        if (match) {
          selectedCountry = match;
          phoneFlag.textContent = match.flag;
          phoneDial.textContent = match.dial;
          countryList.querySelectorAll('.pm-country-item').forEach(i => i.classList.remove('selected'));
          const items = countryList.querySelectorAll('.pm-country-item');
          items.forEach(i => {
            if (parseInt(i.dataset.index) === countries.indexOf(match)) {
              i.classList.add('selected');
            }
          });
          break;
        }
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!phoneTrigger.contains(e.target) && !countryDropdown.contains(e.target)) {
      countryDropdown.classList.remove('active');
      phoneTrigger.classList.remove('open');
    }
  });

  // ── Business searchable dropdown ──
  businessSearch.addEventListener('focus', () => {
    businessDropdown.classList.add('active');
  });

  businessSearch.addEventListener('input', () => {
    const q = businessSearch.value.toLowerCase();
    businessList.querySelectorAll('.pm-searchable-item').forEach(item => {
      item.classList.toggle('hidden', !item.textContent.toLowerCase().includes(q));
    });
  });

  businessList.addEventListener('click', (e) => {
    const item = e.target.closest('.pm-searchable-item');
    if (!item) return;
    businessList.querySelectorAll('.pm-searchable-item').forEach(i => i.classList.remove('selected'));
    item.classList.add('selected');
    businessSearch.value = item.textContent;
    businessHidden.value = item.dataset.value;
    businessDropdown.classList.remove('active');
    const field = businessSearch.closest('.pm-field');
    if (field) field.classList.remove('error');
    const errEl = field?.querySelector('.pm-err');
    if (errEl) errEl.textContent = '';
  });

  document.addEventListener('click', (e) => {
    if (!businessSearch.contains(e.target) && !businessDropdown.contains(e.target)) {
      businessDropdown.classList.remove('active');
    }
  });

  // ── Enter to next field ──
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      const fields = Array.from(form.querySelectorAll('.pm-input:not([type="hidden"]), .pm-select, .pm-phone-input, .pm-phone-trigger'));
      const idx = fields.indexOf(e.target);
      if (idx > -1 && idx < fields.length - 1) {
        fields[idx + 1].focus();
      }
    }
  });

  // ── Validation ──
  function showFieldError(field, msg) {
    field.classList.add('error');
    const errEl = field.querySelector('.pm-err');
    if (errEl) errEl.textContent = msg;
  }

  function clearFieldError(field) {
    field.classList.remove('error');
    const errEl = field.querySelector('.pm-err');
    if (errEl) errEl.textContent = '';
  }

  function validateForm() {
    let valid = true;

    const nameField = $('#pm-name')?.closest('.pm-field');
    const emailField = $('#pm-email')?.closest('.pm-field');
    const phoneField = $('#pm-phone')?.closest('.pm-field');
    const businessField = businessSearch?.closest('.pm-field');
    const serviceField = $('#pm-service')?.closest('.pm-field');
    const messageField = $('#pm-message')?.closest('.pm-field');

    // Clear all
    $$('.pm-field', form).forEach(clearFieldError);

    // Name
    if (!$('#pm-name')?.value.trim()) {
      showFieldError(nameField, 'Please enter your name');
      valid = false;
    }

    // Email
    const email = $('#pm-email')?.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError(emailField, 'Please enter a valid email address');
      valid = false;
    }

    // Phone
    const phone = phoneInput.value.trim();
    if (!phone) {
      showFieldError(phoneField, 'Please enter your phone number');
      valid = false;
    } else if (phone.replace(/\D/g, '').length < 6) {
      showFieldError(phoneField, 'Please enter a valid phone number');
      valid = false;
    }

    // Business
    if (!businessHidden.value) {
      showFieldError(businessField, 'Please select your business type');
      valid = false;
    }

    // Service
    if (!$('#pm-service')?.value) {
      showFieldError(serviceField, 'Please select a service');
      valid = false;
    }

    // Message
    if (!$('#pm-message')?.value.trim()) {
      showFieldError(messageField, 'Please describe your project');
      valid = false;
    }

    return valid;
  }

  // Clear error on focus
  $$('.pm-input, .pm-select, .pm-phone-trigger', form).forEach(input => {
    input.addEventListener('focus', () => {
      const field = input.closest('.pm-field');
      if (field) clearFieldError(field);
    });
  });

  // ── Submit ──
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    submitBtn.disabled = true;
    submitBtn.classList.add('loading');

    setTimeout(() => {
      form.style.display = 'none';
      successEl.style.display = 'flex';
    }, 1200);
  });
})();

/* ============================================================
   10. SMOOTH SCROLL â€” Anchor links
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
   11. FLOATING BADGES â€” Subtle float on scroll
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
   13. PORTFOLIO ITEM â€” Fade-in keyframe injection
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
   15. ACTIVE NAV LINK â€” Highlight on scroll
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
