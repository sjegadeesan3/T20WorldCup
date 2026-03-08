/* ════════════════════════════════════════
   T20 WORLD CUP 2026 — Grand Final JS
════════════════════════════════════════ */

// ── Nav mobile toggle ──
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');
navToggle.addEventListener('click', () => {
  navMobile.classList.toggle('open');
  navToggle.textContent = navMobile.classList.contains('open') ? '✕' : '☰';
});

// Close mobile nav on link click
navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navMobile.classList.remove('open');
    navToggle.textContent = '☰';
  });
});

// ── Stats tabs ──
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.add('hidden'));

    btn.classList.add('active');
    document.getElementById('tab-' + target).classList.remove('hidden');
  });
});

// ── Scroll fade-in ──
const fadeEls = document.querySelectorAll(
  '.score-card, .record-card, .fact-card, .squad-card, .journey-step, .venue-card, .lb-row:not(.lb-header)'
);
fadeEls.forEach(el => el.classList.add('fade-in'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

fadeEls.forEach(el => observer.observe(el));

// ── Animated stat counters ──
function animateCount(el, end, duration = 1500) {
  const start = 0;
  const startTime = performance.now();
  const update = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    el.textContent = Math.round(start + (end - start) * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// Venue stat numbers
const venueStatNums = document.querySelectorAll('.venue-stat-num');
const venueObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const text = el.textContent;
      const num = parseInt(text.replace(/[^0-9]/g, ''));
      if (!isNaN(num) && num > 0) {
        const prefix = text.match(/^[^0-9]*/)?.[0] || '';
        const suffix = text.match(/[^0-9]*$/)?.[0] || '';
        animateCount(el, num);
      }
      venueObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
venueStatNums.forEach(el => venueObserver.observe(el));

// H2H numbers
const h2hNums = document.querySelectorAll('.h2h-num');
const h2hObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const num = parseInt(el.textContent);
      if (!isNaN(num)) animateCount(el, num, 1000);
      h2hObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
h2hNums.forEach(el => h2hObserver.observe(el));

// ── Active nav link on scroll ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.id;
  });
  navLinks.forEach(link => {
    link.style.color = link.getAttribute('href') === '#' + current
      ? 'var(--gold)' : '';
  });
}, { passive: true });

// ── Live pulse badge every 5s subtle blink ──
// (handled purely by CSS animation)

console.log('🏏 T20 World Cup 2026 — India vs New Zealand — Let the best team win!');
