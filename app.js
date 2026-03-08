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

// ── Stadium sub-tabs ──
const stadiumTabBtns = document.querySelectorAll('.stadium-tab-btn');
const stadiumTabContents = document.querySelectorAll('.stadium-tab-content');

stadiumTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.stab;

    stadiumTabBtns.forEach(b => b.classList.remove('active'));
    stadiumTabContents.forEach(c => c.classList.add('hidden'));

    btn.classList.add('active');
    document.getElementById('stab-' + target).classList.remove('hidden');
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

// ── Stadium stat number counters ──
const stNums = document.querySelectorAll('.st-num[data-count]');
const stObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const end = parseInt(el.dataset.count);
      if (!isNaN(end)) animateCount(el, end, 1200);
      stObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
stNums.forEach(el => stObserver.observe(el));

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

/* ════════════════════════════════════════
   LIVE SCORES — CricketData.org API
════════════════════════════════════════ */
const CRICAPI_BASE = 'https://api.cricapi.com/v1';
const LS_KEY = 'cricapi_key';
const REFRESH_INTERVAL = 30; // seconds

let liveApiKey = '';
let refreshTimer = null;
let countdownTimer = null;
let countdownVal = REFRESH_INTERVAL;
let currentFilter = 'all';
let allMatches = [];

const apiSetupCard   = document.getElementById('apiSetupCard');
const apiKeyInput    = document.getElementById('apiKeyInput');
const apiKeyBtn      = document.getElementById('apiKeyBtn');
const apiKeyError    = document.getElementById('apiKeyError');
const liveControls   = document.getElementById('liveControls');
const liveContainer  = document.getElementById('liveMatchesContainer');
const livePlaceholder= document.getElementById('livePlaceholder');
const liveLoading    = document.getElementById('liveLoading');
const refreshCountEl = document.getElementById('refreshCountdown');
const refreshNowBtn  = document.getElementById('refreshNowBtn');
const disconnectBtn  = document.getElementById('disconnectBtn');
const apiGuideCard   = document.getElementById('apiGuideCard');

// ── Filter buttons ──
document.querySelectorAll('.live-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.live-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderMatches(allMatches);
  });
});

// ── Connect button ──
apiKeyBtn.addEventListener('click', async () => {
  const key = apiKeyInput.value.trim();
  if (!key) { showKeyError('Please enter your API key.'); return; }
  apiKeyBtn.disabled = true;
  apiKeyBtn.textContent = 'Connecting…';
  apiKeyError.classList.add('hidden');
  const ok = await testAndConnect(key);
  apiKeyBtn.disabled = false;
  apiKeyBtn.textContent = 'Connect';
  if (!ok) showKeyError('Could not verify key. Check it is correct and try again.');
});

apiKeyInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') apiKeyBtn.click();
});

// ── Disconnect ──
disconnectBtn.addEventListener('click', () => {
  localStorage.removeItem(LS_KEY);
  liveApiKey = '';
  clearTimers();
  liveControls.classList.add('hidden');
  apiSetupCard.classList.remove('hidden');
  apiGuideCard.classList.remove('hidden');
  liveContainer.innerHTML = '';
  livePlaceholder.classList.remove('hidden');
  liveContainer.appendChild(livePlaceholder);
  allMatches = [];
});

// ── Refresh now ──
refreshNowBtn.addEventListener('click', () => {
  clearTimers();
  fetchLiveScores();
});

async function testAndConnect(key) {
  try {
    const url = `${CRICAPI_BASE}/currentMatches?apikey=${encodeURIComponent(key)}&offset=0`;
    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    if (data.status !== 'success' && !Array.isArray(data.data)) return false;
    // Key valid — save and start
    liveApiKey = key;
    localStorage.setItem(LS_KEY, key);
    onConnected(data);
    return true;
  } catch {
    return false;
  }
}

function onConnected(initialData) {
  apiSetupCard.classList.add('hidden');
  apiGuideCard.classList.add('hidden');
  liveControls.classList.remove('hidden');
  allMatches = initialData.data || [];
  renderMatches(allMatches);
  startRefreshCycle();
}

async function fetchLiveScores() {
  if (!liveApiKey) return;
  showLoading(true);
  clearErrorBanner();
  try {
    const url = `${CRICAPI_BASE}/currentMatches?apikey=${encodeURIComponent(liveApiKey)}&offset=0`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'success') throw new Error(data.status || 'API error');
    allMatches = data.data || [];
    renderMatches(allMatches);
  } catch (err) {
    showErrorBanner(`Failed to fetch scores: ${err.message}. Retrying in ${REFRESH_INTERVAL}s.`);
    renderMatches(allMatches); // show last known data
  } finally {
    showLoading(false);
    startRefreshCycle();
  }
}

function startRefreshCycle() {
  clearTimers();
  countdownVal = REFRESH_INTERVAL;
  if (refreshCountEl) refreshCountEl.textContent = countdownVal;
  countdownTimer = setInterval(() => {
    countdownVal--;
    if (refreshCountEl) refreshCountEl.textContent = Math.max(countdownVal, 0);
    if (countdownVal <= 0) {
      clearInterval(countdownTimer);
      fetchLiveScores();
    }
  }, 1000);
}

function clearTimers() {
  clearInterval(refreshTimer);
  clearInterval(countdownTimer);
}

function renderMatches(matches) {
  // Filter
  let filtered = matches;
  if (currentFilter === 'live') {
    filtered = matches.filter(m => m.matchStarted && !m.matchEnded);
  } else if (currentFilter === 't20') {
    filtered = matches.filter(m => (m.matchType || '').toLowerCase().includes('t20'));
  } else if (currentFilter === 'odi') {
    filtered = matches.filter(m => (m.matchType || '').toLowerCase() === 'odi');
  } else if (currentFilter === 'test') {
    filtered = matches.filter(m => (m.matchType || '').toLowerCase() === 'test');
  }

  // Clear container
  liveContainer.innerHTML = '';
  clearErrorBanner();

  if (!filtered.length) {
    const msg = document.createElement('div');
    msg.className = 'no-matches-msg';
    msg.textContent = currentFilter === 'live'
      ? 'No matches currently in progress. Check back soon!'
      : `No ${currentFilter === 'all' ? '' : currentFilter.toUpperCase() + ' '}matches found right now.`;
    liveContainer.appendChild(msg);
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'live-matches-grid';

  filtered.forEach(match => {
    grid.appendChild(buildMatchCard(match));
  });

  liveContainer.appendChild(grid);
}

function buildMatchCard(match) {
  const isLive = match.matchStarted && !match.matchEnded;
  const isUpcoming = !match.matchStarted;

  const card = document.createElement('div');
  card.className = `live-match-card${isLive ? ' is-live' : ''}`;

  // Status badge
  let badgeClass = 'badge-result';
  let badgeText = 'Completed';
  if (isUpcoming) { badgeClass = 'badge-upcoming'; badgeText = 'Upcoming'; }
  else if (isLive && match.status && match.status.toLowerCase().includes('toss')) { badgeClass = 'badge-toss'; badgeText = 'Toss'; }
  else if (isLive) { badgeClass = 'badge-live'; badgeText = '● LIVE'; }

  // Match type label
  const matchType = match.matchType ? match.matchType.toUpperCase() : 'CRICKET';
  const seriesName = match.series_id ? '' : '';

  // Scores: match.score is an array [{r, w, o, inning}, …]
  const scores = match.score || [];
  const teams = match.teams || [];

  // Build team rows
  let teamsHTML = '';
  teams.forEach((team, i) => {
    const scoreObj = scores.find(s => s.inning && s.inning.startsWith(team));
    const scoreText = scoreObj
      ? `${scoreObj.r ?? '—'}/${scoreObj.w ?? '—'}`
      : (match.matchStarted ? '—' : 'TBD');
    const overs = scoreObj && scoreObj.o ? `(${scoreObj.o} ov)` : '';
    // Detect current batting side from status
    const isBatting = isLive && match.status && match.status.toLowerCase().includes(team.toLowerCase().split(' ')[0]);
    teamsHTML += `
      <div class="lmc-team-row">
        <span class="lmc-team-name${isBatting ? ' batting' : ''}">${escapeHtml(team)}</span>
        <span>
          <span class="lmc-score${isBatting ? ' batting' : ''}">${scoreText}</span>
          <span class="lmc-overs">${overs}</span>
        </span>
      </div>`;
  });

  const statusText = match.status || (isUpcoming ? `Starts ${match.date || 'soon'}` : 'Result pending');
  const venue = match.venue ? `📍 ${match.venue}` : '';

  card.innerHTML = `
    <div class="lmc-header">
      <span class="lmc-match-type">${matchType}${match.name ? ' · ' + escapeHtml(match.name.split(',')[0]) : ''}</span>
      <span class="lmc-status-badge ${badgeClass}">${badgeText}</span>
    </div>
    <div class="lmc-body">
      <div class="lmc-teams">${teamsHTML}</div>
      <div class="lmc-divider"></div>
      <div class="lmc-status-text${isLive ? ' live-text' : ''}">${escapeHtml(statusText)}</div>
      ${venue ? `<div class="lmc-venue">${escapeHtml(venue)}</div>` : ''}
    </div>`;

  return card;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function showLoading(show) {
  liveLoading.classList.toggle('hidden', !show);
  if (show) liveContainer.innerHTML = '';
}

function showKeyError(msg) {
  apiKeyError.textContent = msg;
  apiKeyError.classList.remove('hidden');
}

function showErrorBanner(msg) {
  clearErrorBanner();
  const banner = document.createElement('div');
  banner.className = 'live-error-banner';
  banner.id = 'liveErrorBanner';
  banner.innerHTML = `⚠️ ${escapeHtml(msg)}`;
  liveControls.after(banner);
}

function clearErrorBanner() {
  const b = document.getElementById('liveErrorBanner');
  if (b) b.remove();
}

// ── Auto-load if key saved in localStorage ──
const savedKey = localStorage.getItem(LS_KEY);
if (savedKey) {
  liveApiKey = savedKey;
  apiKeyInput.value = savedKey;
  apiSetupCard.classList.add('hidden');
  apiGuideCard.classList.add('hidden');
  liveControls.classList.remove('hidden');
  showLoading(true);
  fetchLiveScores();
}

console.log('🏏 T20 World Cup 2026 — India vs New Zealand — Let the best team win!');
