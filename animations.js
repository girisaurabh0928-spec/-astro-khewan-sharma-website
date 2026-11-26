/* =========================================================
   ASTRO KHEWAN SHARMA JYOTISH KENDRA — js/animations.js
   Header, mobile menu, scroll-spy, GSAP reveal animations.
   Falls back to IntersectionObserver if GSAP is unavailable.
   ========================================================= */
(function () {
  'use strict';

  const $ = function (s, c) { return (c || document).querySelector(s); };
  const $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header + mobile menu ---------- */
  function initHeader() {
    const header = $('#site-header');
    const nav = $('#main-nav');
    const toggle = $('#menu-toggle');

    function onScroll() {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    function setMenu(open) {
      if (!nav || !toggle) return;
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        setMenu(!nav.classList.contains('is-open'));
      });
    }
    $$('#main-nav a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) setMenu(false);
    });
  }

  /* ---------- scroll-spy ---------- */
  function initScrollSpy() {
    if (!('IntersectionObserver' in window)) return;
    const links = {};
    $$('#main-nav a').forEach(function (a) {
      links[a.getAttribute('href').replace('#', '')] = a;
    });
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].classList.remove('is-active'); });
        const a = links[en.target.id];
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    Object.keys(links).forEach(function (id) {
      const sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  /* ---------- hero intro ---------- */
  function heroIntro(gsap) {
    const sel = '.hero .eyebrow, .hero__title span, .hero__subtitle, .hero__cta, .hero__hint';
    const items = $$(sel);
    const portrait = $('.hero__portrait');
    gsap.set(items, { opacity: 0, y: 34 });
    if (portrait) gsap.set(portrait, { opacity: 0, scale: 0.94, y: 20 });

    let played = false;
    function play() {
      if (played) return;
      played = true;
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(items, { opacity: 1, y: 0, duration: 1.1, stagger: 0.14, clearProps: 'opacity,transform' }, 0.15);
      if (portrait) tl.to(portrait, { opacity: 1, scale: 1, y: 0, duration: 1.4, clearProps: 'opacity,transform' }, 0.4);
    }

    if (document.body.classList.contains('is-ready')) { play(); return; }
    const mo = new MutationObserver(function () {
      if (document.body.classList.contains('is-ready')) { mo.disconnect(); play(); }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    setTimeout(function () { mo.disconnect(); play(); }, 22000); // safety
  }

  /* ---------- reveal on scroll ---------- */
  function revealWithGSAP(gsap) {
    const ST = window.ScrollTrigger;
    if (!ST) return false;
    gsap.registerPlugin(ST);

    const els = $$('.reveal').filter(function (el) { return !el.classList.contains('hero__portrait'); });
    gsap.set(els, { opacity: 0, y: 38 });
    ST.batch(els, {
      start: 'top 90%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.95, ease: 'power3.out',
          stagger: 0.1, overwrite: true, clearProps: 'opacity,transform'
        });
      }
    });

    const refresh = function () { ST.refresh(); };
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    if (window.I18N && typeof window.I18N.onChange === 'function') {
      window.I18N.onChange(function () { requestAnimationFrame(refresh); });
    }
    return true;
  }

  function revealFallback() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) return;
    els.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(38px)';
      el.style.transition = 'opacity .9s cubic-bezier(.22,.61,.36,1), transform .9s cubic-bezier(.22,.61,.36,1)';
    });
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.style.opacity = '1';
        el.style.transform = 'none';
        io.unobserve(el);
        setTimeout(function () { el.style.transition = ''; }, 1000);
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  function init() {
    initHeader();
    initScrollSpy();

    if (reduced) return; // everything stays visible, no motion

    try {
      if (window.gsap) {
        heroIntro(window.gsap);
        if (!revealWithGSAP(window.gsap)) revealFallback();
      } else {
        revealFallback();
      }
    } catch (err) {
      console.error('[Animations]', err);
      // never leave content hidden
      $$('.reveal, .hero .eyebrow, .hero__title span, .hero__subtitle, .hero__cta, .hero__hint, .hero__portrait').forEach(function (el) {
        el.style.opacity = '';
        el.style.transform = '';
      });
    }
  }

  window.Animations = { init: init };
})();