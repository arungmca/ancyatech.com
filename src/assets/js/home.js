/* ==========================================================================
   ANCYA — home page behaviours
   Extracted from the inline <script> block in index.html so the page stays
   readable and the code can be linted and cached like every other module.
   Loaded after GSAP; expects the markup above <script> to already exist.
   ========================================================================== */
(function() {
  'use strict';

  // ---- Mobile nav toggle ----
  var header = document.getElementById('site-header');
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle) {
    toggle.addEventListener('click', function() {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close on nav link click
    nav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        document.body.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Header shadow on scroll ----
  window.addEventListener('scroll', function() {
    header.classList.toggle('is-scrolled', window.scrollY > 4);
  }, { passive: true });

  // ---- Back to top ----
  var toTop = document.getElementById('to-top');
  if (toTop) {
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function syncToTop() {
      toTop.classList.toggle('is-visible', window.scrollY > 480);
    }
    window.addEventListener('scroll', syncToTop, { passive: true });
    syncToTop();
    toTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var mainEl = document.getElementById('main');
      if (mainEl) mainEl.focus({ preventScroll: true });
    });
  }

  // ---- Smooth scroll for in-page links ----
  document.querySelectorAll('a[href^="#"][data-scroll], a[href^="#"]:not([href="#"])').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var id = this.getAttribute('href');
      if (id && id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // ---- Reveal on scroll ----
  var reveals = document.querySelectorAll('.reveal, .reveal-scale');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function(el) { io.observe(el); });
  } else {
    reveals.forEach(function(el) { el.classList.add('is-visible'); });
  }

  // ---- Active nav link on scroll ----
  var navLinks = document.querySelectorAll('.nav-list a[data-nav]');
  var navTargets = [];
  navLinks.forEach(function(link) {
    var target = document.getElementById(link.getAttribute('data-nav'));
    if (target) navTargets.push({ link: link, section: target });
  });
  function updateActiveNav() {
    var probe = window.scrollY + 120;
    var current = null;
    var best = -1;
    for (var i = 0; i < navTargets.length; i++) {
      var top = navTargets[i].section.getBoundingClientRect().top + window.scrollY;
      if (top <= probe && top > best) { best = top; current = navTargets[i].link; }
    }
    navLinks.forEach(function(link) { link.removeAttribute('aria-current'); });
    if (current) current.setAttribute('aria-current', 'page');
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // ---- Contact form ----
  var form = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var submitButton = document.getElementById('contact-submit');
  var formError = document.getElementById('form-error');
  var turnstileWidget = document.getElementById('cf-turnstile');
  var turnstileError = document.getElementById('turnstile-error');

  function resetTurnstile() {
    if (window.turnstile && turnstileWidget) {
      try { window.turnstile.reset(turnstileWidget); } catch (err) { /* noop */ }
    }
  }

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var honeypot = document.getElementById('cf-website');
      if (honeypot && honeypot.value) return; // bot

      // Basic validation
      var name = document.getElementById('cf-name');
      var email = document.getElementById('cf-email');
      var message = document.getElementById('cf-message');
      var company = document.getElementById('cf-company');
      var budget = document.getElementById('cf-budget');
      var valid = true;
      [name, email, message].forEach(function(field) {
        if (!field.value.trim()) {
          field.style.borderColor = '#ef4444';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.style.borderColor = '#ef4444';
        valid = false;
      }
      if (!valid) return;

      // Require a Turnstile token when the widget is configured. Tokens are
      // single-use and expire, so check the live value at submit time.
      var turnstileInput = form.querySelector('input[name="cf-turnstile-response"]');
      if (turnstileWidget && (!turnstileInput || !turnstileInput.value)) {
        if (turnstileError) turnstileError.hidden = false;
        return;
      }
      if (turnstileError) turnstileError.hidden = true;

      if (formError) formError.hidden = true;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.setAttribute('aria-busy', 'true');
        submitButton.textContent = 'Sending...';
      }

      var payload = {
        name: name.value.trim(),
        email: email.value.trim(),
        company: company ? company.value.trim() : '',
        budget: budget ? budget.value.trim() : '',
        message: message.value.trim()
      };
      if (turnstileInput && turnstileInput.value) {
        payload['cf-turnstile-response'] = turnstileInput.value;
      }

      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(response) {
        return response.json().then(function(result) {
          return { response: response, result: result };
        });
      })
      .then(function(item) {
        if (item.response.ok && item.result && item.result.ok) {
          form.hidden = true;
          success.hidden = false;
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        throw new Error((item.result && item.result.error) || 'Delivery failed');
      })
      .catch(function(error) {
        resetTurnstile();
        if (formError) formError.hidden = false;
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.removeAttribute('aria-busy');
          submitButton.textContent = 'Send message';
        }
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (window.console && console.warn) console.warn('Contact delivery failed:', error && error.message);
      });
    });
  }

  /* ---------- Motion preferences ---------- */
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Rotating hero hook ----------
     Entrance and glow-drift animations are CSS; this only swaps the phrase. */
  var heroHook = document.getElementById('hero-hook');
  var heroHooks = ['work while you sleep.', 'get cited by AI.', 'launch in 5–14 days.', 'run on autopilot.'];
  var heroHookIdx = 0;
  if (heroHook && !reduced) {
    setInterval(function () {
      heroHook.classList.add('is-swapping');
      window.setTimeout(function () {
        heroHookIdx = (heroHookIdx + 1) % heroHooks.length;
        heroHook.textContent = heroHooks[heroHookIdx];
        heroHook.classList.remove('is-swapping');
      }, 380);
    }, 4600);
  }

  /* ---------- Soft galaxy dot field ---------- */
  (function () {
    var canvas = document.getElementById('hero-galaxy');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var host = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, stars = [], sprite = null, raf = null, running = false, t0 = 0;
    var shot = null, nextShot = 1.5 + Math.random() * 4;

    function makeSprite() {
      var size = 32, s = document.createElement('canvas');
      s.width = s.height = size;
      var g = s.getContext('2d');
      var grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,.95)');
      grad.addColorStop(.22, 'rgba(214,228,255,.55)');
      grad.addColorStop(.55, 'rgba(160,190,255,.16)');
      grad.addColorStop(1, 'rgba(120,160,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      return s;
    }

    function build() {
      var count = Math.round(W * H / 7200);
      count = Math.max(34, Math.min(170, count));
      stars = [];
      for (var i = 0; i < count; i++) {
        var x = Math.random() * W, y = Math.random() * H;
        stars.push({
          x: x, y: y,
          r: .55 + Math.random() * 1.7,
          phase: x * .006 + y * .004 + Math.random() * 1.1,
          wave: 5 + Math.random() * 11,
          speed: .16 + Math.random() * .26,
          driftX: (Math.random() - .5) * .07,
          driftY: (Math.random() - .5) * .05,
          alpha: .16 + Math.random() * .5,
          twinkle: .4 + Math.random() * 1.4,
          spark: Math.random() < .16,
          sparkSize: 3 + Math.random() * 5
        });
      }
    }

    function spawnShot(t) {
      var dir = Math.random() < .5 ? 1 : -1;
      var dur = .6 + Math.random() * 1.9;
      var speed = 380 + Math.random() * 340;
      var x = W * (dir > 0 ? .08 + Math.random() * .5 : .42 + Math.random() * .5);
      var y = H * (.05 + Math.random() * .26);
      var ang = (18 + Math.random() * 28) * Math.PI / 180;
      shot = {
        x0: x, y0: y,
        vx: Math.cos(ang) * speed * dir,
        vy: Math.sin(ang) * speed,
        start: t, dur: dur,
        len: 70 + Math.random() * 150
      };
      nextShot = t + dur + 2 + Math.random() * 5.5;
    }

    function drawShot(t) {
      if (!shot) return;
      var p = (t - shot.start) / shot.dur;
      if (p >= 1) { shot = null; return; }
      var fade = p < .18 ? p / .18 : (p > .68 ? (1 - p) / .32 : 1);
      var alpha = Math.max(0, Math.min(1, fade));
      var x = shot.x0 + shot.vx * p * shot.dur;
      var y = shot.y0 + shot.vy * p * shot.dur;
      var mag = Math.sqrt(shot.vx * shot.vx + shot.vy * shot.vy) || 1;
      var tx = x - shot.vx / mag * (shot.len * (.7 + p * .5));
      var ty = y - shot.vy / mag * (shot.len * (.7 + p * .5));
      var grad = ctx.createLinearGradient(x, y, tx, ty);
      grad.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');
      grad.addColorStop(.3, 'rgba(214,228,255,' + (alpha * .55) + ')');
      grad.addColorStop(1, 'rgba(160,190,255,0)');
      ctx.globalAlpha = 1;
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - 11, y - 11, 22, 22);
      ctx.globalAlpha = 1;
    }

    function draw(now) {
      if (!t0) t0 = now;
      var t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.x += s.driftX;
        s.y += s.driftY;
        if (s.x < -24) s.x = W + 24; else if (s.x > W + 24) s.x = -24;
        if (s.y < -24) s.y = H + 24; else if (s.y > H + 24) s.y = -24;
        var wx = Math.sin(t * s.speed + s.phase) * s.wave;
        var wy = Math.cos(t * s.speed * .82 + s.phase * 1.1) * s.wave * .62;
        var a = s.alpha * (.55 + .45 * Math.sin(t * s.twinkle + s.phase));
        var d = s.r * (s.spark ? 15 : 8);
        ctx.globalAlpha = a;
        ctx.drawImage(sprite, s.x + wx - d / 2, s.y + wy - d / 2, d, d);
        if (s.spark) {
          var pulse = .5 + .5 * Math.sin(t * (.7 + s.twinkle * .5) + s.phase * 1.3);
          var cx = s.x + wx, cy = s.y + wy;
          var L = s.sparkSize * (.45 + pulse);
          ctx.strokeStyle = 'rgba(255,255,255,.9)';
          ctx.lineWidth = .9;
          ctx.globalAlpha = Math.min(1, .2 + a * 1.5);
          ctx.beginPath();
          ctx.moveTo(cx - L, cy); ctx.lineTo(cx + L, cy);
          ctx.moveTo(cx, cy - L); ctx.lineTo(cx, cy + L);
          ctx.stroke();
          var L2 = L * .5;
          ctx.globalAlpha = Math.min(1, .12 + a);
          ctx.beginPath();
          ctx.moveTo(cx - L2, cy - L2); ctx.lineTo(cx + L2, cy + L2);
          ctx.moveTo(cx + L2, cy - L2); ctx.lineTo(cx - L2, cy + L2);
          ctx.stroke();
        }
      }
      if (!reduced) {
        if (t > nextShot) spawnShot(t);
        drawShot(t);
      }
      ctx.globalAlpha = 1;
      if (running && !reduced) raf = requestAnimationFrame(draw);
    }

    function start() {
      if (running) return;
      running = true;
      t0 = 0;
      shot = null;
      nextShot = 1.5 + Math.random() * 4;
      raf = requestAnimationFrame(draw);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    function resize() {
      var rect = host.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      if (reduced) draw(performance.now());
    }

    sprite = makeSprite();
    resize();
    window.addEventListener('resize', function () {
      stop();
      resize();
      if (!reduced) start();
    }, { passive: true });

    if (!reduced && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) start(); else stop();
        });
      }, { threshold: 0 }).observe(host);
    } else if (!reduced) {
      start();
    }
  })();

  /* ---------- Service selector + detail panel ---------- */
  var serviceGrid = document.querySelector('.services');
  var serviceCards = document.querySelectorAll('[data-service]');
  var stage = document.getElementById('service-stage');
  var slides = stage ? stage.querySelectorAll('.stage-slide') : [];
  var activeService = null;

  function selectService(card) {
    if (!card || !stage || card === activeService) return;
    var slide = stage.querySelector('[data-panel="' + card.getAttribute('data-service') + '"]');
    if (!slide) return;
    activeService = card;
    serviceCards.forEach(function (c) {
      c.classList.toggle('is-active', c === card);
      var b = c.querySelector('.service-head');
      if (b) b.setAttribute('aria-pressed', c === card ? 'true' : 'false');
    });
    slides.forEach(function (s) { s.classList.toggle('is-active', s === slide); });
  }

  serviceCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var wasActive = card.classList.contains('is-active');
      selectService(card);
      if (wasActive && stage) {
        stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.querySelectorAll('.service-open').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.stopPropagation();
    });
  });

  // Deep links (`?service=dev` or `#svc-dev`) can open a specific service.
  if (serviceGrid && serviceCards.length) {
    var requested = null;
    try { requested = new URLSearchParams(window.location.search).get('service'); } catch (e) { /* ignore malformed query */ }
    if (window.location.hash && window.location.hash.indexOf('#svc-') === 0) {
      requested = window.location.hash.slice(5);
    }

    var initialCard = serviceCards[0];
    if (requested) {
      serviceCards.forEach(function (card) {
        if (card.getAttribute('data-service') === requested) initialCard = card;
      });
    }
    selectService(initialCard);

    if (requested) {
      var serviceSection = document.getElementById('services');
      if (serviceSection) serviceSection.scrollIntoView({ block: 'start' });
    }
  }
})();

/* ---------- Rotating shape ribbons ---------- */
(function () {
  var colors = ['#FC5332', '#FFA537', '#60A5FA', '#0B519C'];
  var shapes = {
    triangle: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 6 94 86H6Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    hex: '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4l40 23v46L50 96 10 73V27Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
    circle: '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>'
  };
  var observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.target.classList.toggle('is-paused', !e.isIntersecting); });
      }, { rootMargin: '200px' })
    : null;

  var sections = document.querySelectorAll('.has-ribbon');
  for (var s = 0; s < sections.length; s++) {
    var sec = sections[s];
    var kind = sec.classList.contains('ribbon--mixed') ? 'mixed'
             : sec.classList.contains('ribbon--triangle') ? 'triangle'
             : sec.classList.contains('ribbon--circle') ? 'circle'
             : sec.classList.contains('ribbon--hex') ? 'hex' : null;
    if (!kind) continue;

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
      var edge = kind === 'mixed' ? true : (i % 4 !== 3);
      var xPct = kind === 'mixed'
        ? 4 + Math.random() * 92
        : (edge ? (Math.random() < .5 ? Math.random() * 18 : 82 + Math.random() * 18) : 32 + Math.random() * 36);
      var yPct = 4 + Math.random() * 90;

      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.left = 'calc(' + xPct.toFixed(2) + '% - ' + (size / 2).toFixed(0) + 'px)';
      el.style.top = 'calc(' + yPct.toFixed(2) + '% - ' + (size / 2).toFixed(0) + 'px)';
      el.style.color = colors[i % colors.length];
      el.style.opacity = edge ? '.92' : '.45';

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
    if ('IntersectionObserver' in window) {
      observer.observe(field);
    }
  }
})();

/* ---------- Client story sky ---------- */
(function () {
  var canvas = document.getElementById('quote-sky');
  if (!canvas || !canvas.getContext) return;
  var host = canvas.parentElement;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W = 0, H = 0, stars = [], sprite = null, raf = null, running = false, t0 = 0;
  var shot = null, nextShot = 1.5 + Math.random() * 3;

  function makeSprite() {
    var size = 32, s = document.createElement('canvas');
    s.width = s.height = size;
    var g = s.getContext('2d');
    var grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,.95)');
    grad.addColorStop(.24, 'rgba(214,228,255,.5)');
    grad.addColorStop(.6, 'rgba(160,190,255,.12)');
    grad.addColorStop(1, 'rgba(120,160,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return s;
  }

  function build() {
    var count = Math.max(16, Math.min(60, Math.round(W * H / 9500)));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: .4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        driftX: (Math.random() - .5) * .035,
        driftY: (Math.random() - .5) * .03,
        alpha: .12 + Math.random() * .42,
        twinkle: .4 + Math.random() * 1.3,
        spark: Math.random() < .12,
        sparkSize: 2 + Math.random() * 3.4
      });
    }
  }

  function spawnShot(t) {
    var dir = Math.random() < .5 ? 1 : -1;
    var dur = .6 + Math.random() * 1.7;
    var speed = 260 + Math.random() * 240;
    var x = W * (dir > 0 ? .05 + Math.random() * .5 : .45 + Math.random() * .5);
    var y = H * (.05 + Math.random() * .3);
    var ang = (16 + Math.random() * 24) * Math.PI / 180;
    shot = {
      x0: x, y0: y,
      vx: Math.cos(ang) * speed * dir,
      vy: Math.sin(ang) * speed,
      start: t, dur: dur,
      len: 60 + Math.random() * 90
    };
    nextShot = t + dur + 2.5 + Math.random() * 5;
  }

  function drawShot(t) {
    if (!shot) return;
    var p = (t - shot.start) / shot.dur;
    if (p >= 1) { shot = null; return; }
    var fade = p < .18 ? p / .18 : (p > .68 ? (1 - p) / .32 : 1);
    var alpha = Math.max(0, Math.min(1, fade));
    var x = shot.x0 + shot.vx * p * shot.dur;
    var y = shot.y0 + shot.vy * p * shot.dur;
    var mag = Math.sqrt(shot.vx * shot.vx + shot.vy * shot.vy) || 1;
    var tx = x - shot.vx / mag * shot.len;
    var ty = y - shot.vy / mag * shot.len;
    var grad = ctx.createLinearGradient(x, y, tx, ty);
    grad.addColorStop(0, 'rgba(255,255,255,' + alpha + ')');
    grad.addColorStop(.35, 'rgba(214,228,255,' + (alpha * .5) + ')');
    grad.addColorStop(1, 'rgba(160,190,255,0)');
    ctx.globalAlpha = 1;
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.globalAlpha = alpha;
    ctx.drawImage(sprite, x - 9, y - 9, 18, 18);
    ctx.globalAlpha = 1;
  }

  function draw(now) {
    if (!t0) t0 = now;
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      st.x += st.driftX;
      st.y += st.driftY;
      if (st.x < -12) st.x = W + 12; else if (st.x > W + 12) st.x = -12;
      if (st.y < -12) st.y = H + 12; else if (st.y > H + 12) st.y = -12;
      var a = st.alpha * (.55 + .45 * Math.sin(t * st.twinkle + st.phase));
      var d = st.r * (st.spark ? 12 : 7);
      ctx.globalAlpha = a;
      ctx.drawImage(sprite, st.x - d / 2, st.y - d / 2, d, d);
      if (st.spark) {
        var pulse = .5 + .5 * Math.sin(t * (.8 + st.twinkle * .4) + st.phase * 1.2);
        var L = st.sparkSize * (.45 + pulse);
        ctx.strokeStyle = 'rgba(255,255,255,.9)';
        ctx.lineWidth = .8;
        ctx.globalAlpha = Math.min(1, .18 + a * 1.5);
        ctx.beginPath();
        ctx.moveTo(st.x - L, st.y); ctx.lineTo(st.x + L, st.y);
        ctx.moveTo(st.x, st.y - L); ctx.lineTo(st.x, st.y + L);
        ctx.stroke();
      }
    }
    if (!reduce) {
      if (t > nextShot) spawnShot(t);
      drawShot(t);
    }
    ctx.globalAlpha = 1;
    if (running && !reduce) raf = requestAnimationFrame(draw);
  }

  function start() {
    if (running) return;
    running = true;
    t0 = 0;
    shot = null;
    nextShot = 1.5 + Math.random() * 3;
    raf = requestAnimationFrame(draw);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function resize() {
    var rect = host.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (reduce) draw(performance.now());
  }

  sprite = makeSprite();
  resize();
  window.addEventListener('resize', function () {
    stop();
    resize();
    if (!reduce) start();
  }, { passive: true });

  if (!reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) start(); else stop();
      });
    }, { threshold: 0 }).observe(host);
  } else if (!reduce) {
    start();
  }
})();

// Cookie banner + Google Consent Mode v2 is handled by assets/js/consent.js (shared with legal pages)

