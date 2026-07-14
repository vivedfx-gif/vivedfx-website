/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   vivedfx â€” LANGUAGE ENGINE v3
   Auto-translate by text matching + data-i18n
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */
(function () {
  'use strict';
  const STORAGE_KEY = 'vivedfx_lang';
  const DEFAULT = 'en';

  function getLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved === 'ar') ? 'ar' : 'en';
  }

  function applyLang(lang) {
    const dict = lang === 'ar' ? (window.AR || {}) : (window.EN || {});

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-ar', lang === 'ar');
    document.body.classList.toggle('lang-en', lang !== 'ar');

    // 1. Translate elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    });

    // 2. Auto-translate elements by matching English text content
    if (lang === 'ar' && window.TEXT_MAP_AR) {
      const map = window.TEXT_MAP_AR;
      document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, li, td, th, label, div').forEach(el => {
        // Skip elements that already have data-i18n
        if (el.hasAttribute('data-i18n')) return;
        // Skip elements with children that are block elements
        if (el.querySelector('h1, h2, h3, h4, h5, h6, p, div, section')) return;
        // Skip empty elements
        const text = el.textContent.trim();
        if (!text || text.length < 2) return;
        // Skip if element has complex HTML children
        if (el.children.length > 0 && el.querySelector('img, svg, input')) return;
        // Try exact match first
        if (map[text]) {
          el.textContent = map[text];
          return;
        }
        // Try matching trimmed text that ends with special chars
        const clean = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // No fuzzy match for performance
      });
    }

    // 3. Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] !== undefined) el.placeholder = dict[key];
    });

    // 4. Translate select options
    document.querySelectorAll('option[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.textContent = dict[key];
    });

    // 5. Update switcher labels
    document.querySelectorAll('.lang-switcher-label').forEach(el => {
      el.textContent = lang === 'ar' ? 'EN' : 'AR';
    });

    // 6. Update active state
    document.querySelectorAll('.lang-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  function init() {
    applyLang(getLang());

    document.addEventListener('click', e => {
      const toggle = e.target.closest('.lang-toggle');
      if (toggle) {
        const dropdown = toggle.nextElementSibling;
        document.querySelectorAll('.lang-dropdown').forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });
        dropdown.classList.toggle('open');
        return;
      }
      if (!e.target.closest('.lang-switcher')) {
        document.querySelectorAll('.lang-dropdown').forEach(d => d.classList.remove('open'));
      }
    });

    document.addEventListener('click', e => {
      const option = e.target.closest('.lang-option');
      if (!option) return;
      applyLang(option.dataset.lang);
      document.querySelectorAll('.lang-dropdown').forEach(d => d.classList.remove('open'));
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
