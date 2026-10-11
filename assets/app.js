'use strict';

const DATA_URL = './data/exhibits.json';
const ALL_CATEGORY = 'ALL DEPARTMENTS';
const state = { exhibits: [], category: ALL_CATEGORY, query: '', sort: 'accession' };
const els = {
  grid: document.getElementById('exhibit-grid'),
  filters: document.getElementById('filters'),
  search: document.getElementById('search-input'),
  sort: document.getElementById('sort-order'),
  count: document.getElementById('total-count'),
  summary: document.getElementById('result-summary'),
  empty: document.getElementById('empty-state'),
};

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
}

function safeGithubUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'github.com' ? url.href : '#';
  } catch {
    return '#';
  }
}

function readableNumber(n) { return new Intl.NumberFormat('en').format(n); }

function makeFilterButtons() {
  const counts = new Map();
  for (const exhibit of state.exhibits) counts.set(exhibit.category, (counts.get(exhibit.category) || 0) + 1);
  const categories = [ALL_CATEGORY, ...counts.keys()];
  els.filters.replaceChildren();
  categories.forEach(category => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-pill' + (category === state.category ? ' is-active' : '');
    button.setAttribute('aria-pressed', String(category === state.category));
    button.textContent = `${category}  ${category === ALL_CATEGORY ? state.exhibits.length : counts.get(category)}`;
    button.addEventListener('click', () => {
      state.category = category;
      makeFilterButtons();
      render();
    });
    els.filters.appendChild(button);
  });
}

function filteredExhibits() {
  const q = state.query.trim().toLowerCase();
  const filtered = state.exhibits.filter(e => {
    if (state.category !== ALL_CATEGORY && e.category !== state.category) return false;
    if (!q) return true;
    const haystack = [e.id, e.repo, e.name, e.category, e.language, e.tagline, e.field_note, ...(e.tags || [])].join(' ').toLowerCase();
    return haystack.includes(q);
  });
  if (state.sort === 'oldest') filtered.sort((a, b) => a.created_on.localeCompare(b.created_on));
  if (state.sort === 'newest') filtered.sort((a, b) => b.created_on.localeCompare(a.created_on));
  if (state.sort === 'forked') filtered.sort((a, b) => b.forks_at_discovery - a.forks_at_discovery || a.id.localeCompare(b.id));
  if (state.sort === 'accession') filtered.sort((a, b) => a.id.localeCompare(b.id));
  return filtered;
}

function createCard(e) {
  const card = document.createElement('article');
  card.className = 'exhibit-card';
  card.id = e.id.toLowerCase();
  card.tabIndex = -1;
  card.dataset.category = e.category;
  const tags = e.tags.map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('');
  const code = escapeHTML(e.evidence.excerpt);
  const repoURL = safeGithubUrl(e.url);
  const sourceURL = safeGithubUrl(e.evidence.url);
  const year = escapeHTML(e.created_on.slice(0,4));
  card.innerHTML = `
    <div class="card-top"><span class="card-number">SPECIMEN ${escapeHTML(e.id)}</span><span class="card-year">EST. ${year}</span></div>
    <div class="card-icon" aria-hidden="true">${escapeHTML(e.icon)}</div>
    <div class="card-category">${escapeHTML(e.category)}</div>
    <h3>${escapeHTML(e.name)}</h3>
    <p class="card-tagline">${escapeHTML(e.tagline)}</p>
    <p class="card-note">${escapeHTML(e.field_note)}</p>
    <div class="card-tags">${tags}</div>
    <details class="source-exhibit">
      <summary>OPEN THE EVIDENCE DRAWER <span aria-hidden="true">+</span></summary>
      <div class="source-inner"><div class="source-file"><span>INSPECTED FILE</span> <a href="${sourceURL}" target="_blank" rel="noopener noreferrer">${escapeHTML(e.evidence.path)} ↗</a></div><pre><code>${code}</code></pre></div>
    </details>
    <div class="card-footer"><div class="card-stat"><span class="star-count">★ ${e.stars_at_discovery}</span><span>${readableNumber(e.forks_at_discovery)} FORKS AT INTAKE</span></div><a href="${repoURL}" class="visit-link" target="_blank" rel="noopener noreferrer" aria-label="Visit ${escapeHTML(e.repo)} on GitHub">VISIT REPO <span aria-hidden="true">↗</span></a></div>`;
  return card;
}

function render() {
  const exhibits = filteredExhibits();
  const cards = exhibits.map(createCard);
  els.grid.replaceChildren(...cards);
  els.empty.hidden = exhibits.length !== 0;
  els.summary.textContent = `${String(exhibits.length).padStart(2, '0')} OF ${String(state.exhibits.length).padStart(2, '0')} SPECIMENS ON DISPLAY`;
}

function resetFilters() {
  state.category = ALL_CATEGORY;
  state.query = '';
  els.search.value = '';
  makeFilterButtons();
  render();
}

function surprise() {
  if (!state.exhibits.length) return;
  // Reset filters so every specimen has a chance of being chosen.
  resetFilters();
  const chosen = state.exhibits[Math.floor(Math.random() * state.exhibits.length)];
  const card = document.getElementById(chosen.id.toLowerCase());
  if (!card) return;
  card.classList.add('spotlit');
  card.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' });
  card.focus({ preventScroll: true });
  setTimeout(() => card.classList.remove('spotlit'), 2500);
}

els.search.addEventListener('input', event => { state.query = event.target.value; render(); });
els.sort.addEventListener('change', event => { state.sort = event.target.value; render(); });
document.getElementById('hero-random').addEventListener('click', surprise);
document.getElementById('clear-filters').addEventListener('click', resetFilters);
document.addEventListener('keydown', event => {
  const editable = event.target.matches('input, textarea, select, [contenteditable]');
  if (event.key === '/' && !editable && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault(); els.search.focus();
  }
});

fetch(DATA_URL)
  .then(response => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
  .then(exhibits => {
    if (!Array.isArray(exhibits)) throw new Error('Invalid exhibit catalog');
    state.exhibits = exhibits;
    els.count.textContent = exhibits.length;
    makeFilterButtons();
    render();
    // Allow direct links to a specimen, including freshly loaded data.
    if (/^#um-\d{3}$/.test(window.location.hash)) {
      const target = document.querySelector(window.location.hash);
      if (target) target.scrollIntoView({ block: 'center' });
    }
  })
  .catch(error => {
    console.error('Could not load museum catalog:', error);
    els.summary.textContent = 'THE CATALOG COULD NOT BE OPENED';
    els.grid.innerHTML = '<div class="load-error"><h3>The cabinets are temporarily closed.</h3><p>Open this site through a local web server, or publish it with GitHub Pages. See the README for instructions.</p></div>';
  });
