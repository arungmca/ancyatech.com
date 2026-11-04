/* ==========================================================================
   ANCYA — shared page behaviours
   Used by portfolio, journal, service and profile templates.
   The home page keeps its own hero-specific scripts inline.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Header state ---------- */
  var header = document.getElementById('site-header');
  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 4);
    };
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation menu');
      });
    });
  }

  /* ---------- Smooth scrolling for same-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal, .reveal-scale');
  if (reveals.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById('to-top');
  if (toTop) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var syncToTop = function () {
      toTop.classList.toggle('is-visible', window.scrollY > 480);
    };
    window.addEventListener('scroll', syncToTop, { passive: true });
    syncToTop();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var main = document.getElementById('main');
      if (main) main.focus({ preventScroll: true });
    });
  }

  /* ---------- Rotating shape ribbons ---------- */
  var colors = ['#FC5332', '#FFA537', '#60A5FA', '#0B519C'];
  var shapes = {
    triangle: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 94 86H6Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    hex: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4l40 23v46L50 96 10 73V27Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    circle: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>'
  };

  var shapeObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.target.classList.toggle('is-paused', !e.isIntersecting); });
      }, { rootMargin: '200px' })
    : null;

  document.querySelectorAll('.has-ribbon').forEach(function (sec) {
    var kind = sec.classList.contains('ribbon--mixed') ? 'mixed'
             : sec.classList.contains('ribbon--triangle') ? 'triangle'
             : sec.classList.contains('ribbon--circle') ? 'circle'
             : sec.classList.contains('ribbon--hex') ? 'hex' : null;
    if (!kind) return;

    var field = document.createElement('div');
    field.className = 'ribbon-field';
    field.setAttribute('aria-hidden', 'true');

    for (var i = 0; i < 9; i++) {
      var shapeKind = kind === 'mixed'
        ? ['triangle', 'hex', 'circle'][Math.floor(Math.random() * 3)]
        : kind;
      var el = document.createElement('span');
      el.className = 'ribbon-shape ribbon-shape--' + shapeKind;

      var size = Math.round(54 + Math.random() * 136);
      var xPct = kind === 'mixed'
        ? 4 + Math.random() * 92
        : (Math.random() < .5 ? Math.random() * 18 : 82 + Math.random() * 18);
      var yPct = 4 + Math.random() * 90;

      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.left = 'calc(' + xPct.toFixed(2) + '% - ' + (size / 2).toFixed(0) + 'px)';
      el.style.top = 'calc(' + yPct.toFixed(2) + '% - ' + (size / 2).toFixed(0) + 'px)';
      el.style.color = colors[i % colors.length];
      el.style.opacity = '.9';

      if (shapeKind === 'circle') {
        el.style.setProperty('--dur', (6 + Math.random() * 9).toFixed(1) + 's');
        el.style.setProperty('--delay', (-Math.random() * 10).toFixed(1) + 's');
      } else {
        el.style.setProperty('--dur', (50 + Math.random() * 70).toFixed(1) + 's');
        el.style.setProperty('--dir', Math.random() < .5 ? 'normal' : 'reverse');
        el.style.animationDelay = (-Math.random() * 40).toFixed(1) + 's';
      }

      el.innerHTML = shapes[shapeKind];
      field.appendChild(el);
    }

    sec.appendChild(field);
    if (shapeObserver) shapeObserver.observe(field);
  });
})();
