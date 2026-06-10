/* ═══════════════════════════════════════════════════════════
   GRADUATION INVITATION  ·  script.js
   Modules: Particles · Film Strip · Countdown · Scroll Reveal
═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── 1. PARTICLE SYSTEM (Sakura + Hearts) ─────────────── */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [];

  /* ── Draw a sakura petal (two crossed ellipses) ── */
  function drawPetal(ctx, x, y, size, rotation, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    // Outer petal colour
    ctx.fillStyle = '#F9B8D4';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.5, size * 0.28, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cross petal, slightly lighter
    ctx.fillStyle = '#FCCEE2';
    ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.5, size * 0.28, size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Centre dot
    ctx.fillStyle = '#F48EB4';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.12, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /* ── Draw a heart using bezier curves ── */
  function drawHeart(ctx, x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;

    // Pick a random-ish pink/red from a soft palette
    const colours = ['#E8789A', '#F4A0BC', '#F06090', '#D45880', '#FFAAC8'];
    ctx.fillStyle = colours[Math.floor(x * 7 + y * 3) % colours.length];

    const r = size * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.4);
    // Left bump
    ctx.bezierCurveTo(-r * 0.1, -r * 0.1, -r * 1.0, -r * 0.1, -r * 1.0, r * 0.4);
    ctx.bezierCurveTo(-r * 1.0,  r * 1.0,  0,         r * 1.6,  0,        r * 2.2);
    // Right bump (mirror)
    ctx.bezierCurveTo( 0,         r * 1.6,  r * 1.0,   r * 1.0,  r * 1.0, r * 0.4);
    ctx.bezierCurveTo( r * 1.0,  -r * 0.1,  r * 0.1,  -r * 0.1,  0,       r * 0.4);
    ctx.fill();

    ctx.restore();
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle(type) {
    const isPetal = type === 'petal';
    return {
      type:      isPetal ? 'petal' : 'heart',
      x:         randomBetween(0, W),
      /* petals start above viewport; hearts start near bottom */
      y:         isPetal ? randomBetween(-100, -10) : randomBetween(H + 10, H + 60),
      size:      isPetal ? randomBetween(10, 22) : randomBetween(12, 24),
      rotation:  randomBetween(0, Math.PI * 2),
      rotSpeed:  randomBetween(-0.02, 0.02),
      vx:        isPetal ? randomBetween(-0.9, 0.9)  : randomBetween(-0.5, 0.5),
      /* petals fall down; hearts float up */
      vy:        isPetal ? randomBetween(0.7, 2.0)   : randomBetween(-1.5, -0.5),
      alpha:     isPetal ? randomBetween(0.6, 0.95)  : randomBetween(0.7, 0.95),
      /* hearts fade out as they rise; petals stay opaque */
      alphaDir:  isPetal ? 0 : -randomBetween(0.004, 0.009),
      wobble:    randomBetween(0, Math.PI * 2),
      wobbleSpd: randomBetween(0.015, 0.04),
    };
  }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function init() {
    resize();
    particles = [];

    /* Scatter petals across the full viewport height on first load */
    for (let i = 0; i < 40; i++) {
      const p = createParticle('petal');
      p.y = randomBetween(-50, H + 50);
      particles.push(p);
    }

    /* Hearts distributed across bottom half */
    for (let i = 0; i < 18; i++) {
      const h = createParticle('heart');
      h.y     = randomBetween(H * 0.3, H + 40);
      h.alpha = randomBetween(0.1, 0.8);
      particles.push(h);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      /* Move */
      p.wobble   += p.wobbleSpd;
      p.rotation += p.rotSpeed;
      p.x        += p.vx + Math.sin(p.wobble) * 0.5;
      p.y        += p.vy;
      p.alpha    += p.alphaDir;

      /* Respawn logic — use assignment, NEVER return here */
      if (p.type === 'petal') {
        if (p.y > H + 30 || p.x < -40 || p.x > W + 40) {
          particles[i] = createParticle('petal');
          continue;
        }
        drawPetal(ctx, p.x, p.y, p.size, p.rotation, Math.max(0, p.alpha));
      } else {
        if (p.alpha <= 0 || p.y < -60) {
          particles[i] = createParticle('heart');
          continue;
        }
        drawHeart(ctx, p.x, p.y, p.size, Math.max(0, p.alpha));
      }
    }

    /* Schedule next frame ALWAYS outside the loop */
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); });
  init();
  requestAnimationFrame(tick);
})();


/* ─── 2. FILM STRIP SETUP ──────────────────────────────── */
(function initFilmStrip() {
  /* Build film holes dynamically */
  function buildHoles(container) {
    container.innerHTML = '';
    const count = Math.ceil(window.innerWidth / 28) * 3; // plenty of holes
    for (let i = 0; i < count; i++) {
      const hole = document.createElement('div');
      hole.className = 'film-hole';
      container.appendChild(hole);
    }
  }

  const topHoles = document.getElementById('holes-top');
  const botHoles = document.getElementById('holes-bottom');
  if (topHoles) buildHoles(topHoles);
  if (botHoles) buildHoles(botHoles);

  /* Duplicate frames for seamless infinite scroll */
  const filmImages = document.getElementById('film-images');
  if (filmImages) {
    const original = filmImages.innerHTML;
    filmImages.innerHTML = original + original; // double up
  }
})();


/* ─── 3. COUNTDOWN TIMER ───────────────────────────────── */
(function initCountdown() {
  const TARGET = new Date('2026-06-20T09:30:00').getTime();

  const els = {
    days:    document.getElementById('cd-days'),
    hours:   document.getElementById('cd-hours'),
    minutes: document.getElementById('cd-minutes'),
    seconds: document.getElementById('cd-seconds'),
  };

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = Date.now();
    const diff = TARGET - now;

    if (diff <= 0) {
      Object.values(els).forEach(el => { if (el) el.textContent = '00'; });
      clearInterval(timer);
      return;
    }

    const d =  Math.floor(diff / 86400000);
    const h =  Math.floor((diff % 86400000) / 3600000);
    const m =  Math.floor((diff % 3600000)  / 60000);
    const s =  Math.floor((diff % 60000)    / 1000);

    if (els.days)    els.days.textContent    = pad(d);
    if (els.hours)   els.hours.textContent   = pad(h);
    if (els.minutes) els.minutes.textContent = pad(m);
    if (els.seconds) els.seconds.textContent = pad(s);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();


/* ─── 4. SCROLL REVEAL  ────────────────────────────────── */
(function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-fade, .reveal-up');

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
})();
// ── Background Music ──
const music = document.getElementById('bg-music');

function startMusic() {
  music.volume = 0.4;
  music.play().catch(() => {});
  document.removeEventListener('click', startMusic);
  document.removeEventListener('touchstart', startMusic);
}
document.addEventListener('click', startMusic);
document.addEventListener('touchstart', startMusic);