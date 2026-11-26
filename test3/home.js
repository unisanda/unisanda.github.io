/*
  Links page extras:
  1. Section rail: one icon per section on the side of the screen. Tap to
     jump there; the icon of the section on screen lights up while scrolling.
  2. Search: a glass search bar. A code from shortcuts.json (e.g. "1")
     opens its link on Enter; any other text lists matching links and pages.
*/
(function () {
  'use strict';

  var I = window.UniI18n || { t: function (k) { return k; }, onChange: function () {} };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- 1. section rail ---------- */

  var rail = document.getElementById('sectionRail');
  var btns = Array.prototype.slice.call(rail.querySelectorAll('.rail-btn'));
  var sections = btns.map(function (b) { return document.getElementById(b.dataset.target); });

  function setActive(id) {
    btns.forEach(function (b) {
      var on = b.dataset.target === id;
      b.classList.toggle('is-active', on);
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }

  btns.forEach(function (b, k) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      var top = sections[k].getBoundingClientRect().top + window.scrollY - 16;
      window.scrollTo({ top: k === 0 ? 0 : top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      setActive(b.dataset.target);
    });
  });

  // the section whose top half is in view is the active one
  function onScroll() {
    var mid = window.innerHeight * 0.45;
    var current = sections[0].id;
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= mid) current = s.id; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      current = sections[sections.length - 1].id;   // reached the bottom
    }
    setActive(current);
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- 2. search ---------- */

  var toggle = document.getElementById('searchToggle');
  var panel = document.getElementById('searchPanel');
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var hint = document.getElementById('searchHint');
  var closeBtn = document.getElementById('searchClose');
  var codes = {};
  var picked = -1;

  fetch('shortcuts.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      var c = (d && d.codes) || {};
      Object.keys(c).forEach(function (k) {
        var v = typeof c[k] === 'string' ? { url: c[k] } : c[k];
        if (v && v.url) codes[k.trim().toLowerCase()] = v;
      });
    })
    .catch(function () {});

  // everything on the page a visitor might look for: link tiles and pages
  function items() {
    var list = [];
    document.querySelectorAll('.tile').forEach(function (t) {
      list.push({
        name: t.querySelector('.tile-label').textContent.trim(),
        sub: (t.querySelector('.tile-sub') || {}).textContent || '',
        url: t.getAttribute('href'),
        external: t.target === '_blank'
      });
    });
    document.querySelectorAll('a.soon-card').forEach(function (a) {
      list.push({ name: a.querySelector('.soon-label').textContent.trim(), sub: '', url: a.getAttribute('href'), external: false });
    });
    return list;
  }

  function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ' ').trim(); }

  function go(url, external) {
    hint.textContent = I.t('search.opening');
    if (external) window.open(url, '_blank', 'noopener');
    else window.location.href = url;
  }

  var matches = [];
  function update() {
    var q = norm(input.value);
    results.innerHTML = '';
    matches = [];
    picked = -1;
    if (!q) { hint.textContent = ''; return; }
    var code = codes[q];
    if (code) {
      matches.push({ name: code.label || code.url, sub: I.t('search.code') + ' ' + input.value.trim(), url: code.url, external: true, code: true });
    }
    items().forEach(function (it) {
      if (norm(it.name + ' ' + it.sub).indexOf(q) !== -1) matches.push(it);
    });
    matches.slice(0, 6).forEach(function (m, k) {
      var li = document.createElement('li');
      li.className = 'search-item' + (m.code ? ' is-code' : '');
      li.setAttribute('role', 'option');
      li.id = 'sr-' + k;
      var a = document.createElement('a');
      a.href = m.url;
      if (m.external) { a.target = '_blank'; a.rel = 'noopener'; }
      a.innerHTML = '<span class="sr-name"></span><span class="sr-sub" dir="auto"></span>';
      a.querySelector('.sr-name').textContent = m.name;
      a.querySelector('.sr-sub').textContent = m.sub;
      li.appendChild(a);
      results.appendChild(li);
    });
    hint.textContent = matches.length ? I.t('search.go') : I.t('search.none');
    if (matches.length) highlight(0);
  }

  function highlight(k) {
    picked = k;
    results.querySelectorAll('.search-item').forEach(function (li, j) {
      li.classList.toggle('is-picked', j === k);
      li.setAttribute('aria-selected', j === k ? 'true' : 'false');
    });
    input.setAttribute('aria-activedescendant', k >= 0 ? 'sr-' + k : '');
  }

  var lastFocus = null;
  function open() {
    lastFocus = document.activeElement;
    panel.hidden = false;
    requestAnimationFrame(function () { panel.classList.add('is-open'); });
    toggle.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('search-on');
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() {
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('search-on');
    setTimeout(function () { panel.hidden = true; }, reduceMotion.matches ? 0 : 250);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  toggle.addEventListener('click', function () { if (panel.hidden) open(); else close(); });
  closeBtn.addEventListener('click', function (e) { e.preventDefault(); close(); });
  panel.addEventListener('click', function (e) { if (e.target === panel) close(); });
  input.addEventListener('input', update);
  input.addEventListener('keydown', function (e) {
    var n = Math.min(matches.length, 6);
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowDown' && n) { e.preventDefault(); highlight((picked + 1) % n); }
    else if (e.key === 'ArrowUp' && n) { e.preventDefault(); highlight((picked - 1 + n) % n); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      var m = matches[picked >= 0 ? picked : 0];
      if (m) go(m.url, m.external);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && panel.hidden && !/input|textarea/i.test((e.target.tagName || ''))) { e.preventDefault(); open(); }
  });

  I.onChange(function () { if (!panel.hidden) update(); });
})();
