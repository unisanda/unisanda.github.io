/*
  "About me" panel, opened from the i button next to the logo (or #about in
  the address). Text comes from about.json; X and TikTok follower counts
  are read live from the accounts page data.
*/
(function () {
  'use strict';

  var I = window.UniI18n || { t: function (k) { return k; }, isAr: function () { return false; }, onChange: function () {} };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var panel = document.getElementById('aboutPanel');
  var btn = document.getElementById('infoBtn');
  var closeBtn = document.getElementById('aboutClose');
  var $ = function (id) { return document.getElementById(id); };

  var data = null;
  var counts = {};     // platform id -> followers

  function txt(v) { return v && typeof v === 'object' ? (I.isAr() ? v.ar : v.en) || v.en || '' : v || ''; }
  function compact(n) {
    try { return new Intl.NumberFormat(I.isAr() ? 'ar-u-nu-latn' : 'en', { notation: 'compact', maximumFractionDigits: 1 }).format(n); }
    catch (e) { return String(n); }
  }
  function getJson(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  /* ---------- fill ---------- */

  function render() {
    if (!data) return;
    $('aboutName').textContent = data.name;
    $('aboutBrand').textContent = data.brand;
    $('aboutRole').textContent = txt(data.role);
    $('aboutIntro').textContent = txt(data.intro);
    $('aboutGoal').textContent = txt(data.goal);
    $('aboutFlags').textContent = data.flags || '';

    var langs = $('aboutLangs');
    langs.innerHTML = '';
    (data.languages || []).forEach(function (l, k) {
      if (k) langs.appendChild(document.createTextNode(' · '));
      var b = document.createElement('b');
      b.textContent = l;
      langs.appendChild(b);
    });

    var loves = $('aboutLoves');
    loves.innerHTML = '';
    (data.loves || []).forEach(function (l, k) {
      var li = document.createElement('li');
      li.style.setProperty('--k', k);
      li.innerHTML = '<span aria-hidden="true"></span><b></b>';
      li.firstChild.textContent = l.icon || '';
      li.lastChild.textContent = txt(l);
      loves.appendChild(li);
    });

    var list = $('aboutPlatforms');
    list.innerHTML = '';
    var total = 0;
    (data.platforms || []).forEach(function (p, k) {
      var n = counts[p.id] != null ? counts[p.id] : p.followers;
      if (typeof n === 'number') total += n;
      var li = document.createElement('li');
      li.style.setProperty('--k', k);
      li.className = 'ab-pf ab-pf--' + p.id;
      li.innerHTML = '<a target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#' + p.icon + '"/></svg>' +
        '<b></b><span></span></a>';
      var a = li.firstChild;
      a.href = p.url;
      a.querySelector('b').textContent = typeof n === 'number' ? compact(n) : '—';
      a.querySelector('span').textContent = p.label;
      a.setAttribute('aria-label', p.label + ': ' + (typeof n === 'number' ? compact(n) + ' ' + I.t('about.follow') : ''));
      list.appendChild(li);
    });
    $('aboutTotal').textContent = total ? compact(total) + '+' : '—';

    var mail = $('aboutMail');
    if (data.email) {
      mail.hidden = false;
      mail.href = 'mailto:' + data.email;
      mail.querySelector('span').textContent = data.email;
    } else {
      mail.hidden = true;
    }
  }

  Promise.all([
    getJson('about.json'),
    getJson('accounts/profiles.json'),
    getJson('accounts/tiktok.json')
  ]).then(function (r) {
    data = r[0];
    if (!data) return;
    // live counts for platforms marked "from": "x:Handle" / "tiktok:handle"
    (data.platforms || []).forEach(function (p) {
      if (!p.from) return;
      var parts = p.from.split(':');
      var src = parts[0] === 'x' ? r[1] : parts[0] === 'tiktok' ? r[2] : null;
      var prof = src && (src.profiles || []).find(function (q) {
        return String(q.handle).toLowerCase() === parts[1].toLowerCase();
      });
      if (prof && typeof prof.followers === 'number') counts[p.id] = prof.followers;
    });
    render();
    if (location.hash === '#about') open();
  });

  /* ---------- open / close ---------- */

  var lastFocus = null;
  function open() {
    if (!panel.hidden) return;
    lastFocus = document.activeElement;
    panel.hidden = false;
    document.documentElement.classList.add('about-on');
    requestAnimationFrame(function () { panel.classList.add('is-open'); });
    setTimeout(function () { closeBtn.focus(); }, 60);
    try { history.replaceState(null, '', '#about'); } catch (e) {}
  }
  function close() {
    panel.classList.remove('is-open');
    document.documentElement.classList.remove('about-on');
    setTimeout(function () { panel.hidden = true; }, reduceMotion.matches ? 0 : 380);
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  btn.addEventListener('click', open);

  /* ---------- the Bitmoji sits on the first tile's top edge ---------- */

  var section = btn.parentNode;
  var tile = section.querySelector('.tile');
  function place() {
    if (!tile) return;
    var sr = section.getBoundingClientRect();
    var tr = tile.getBoundingClientRect();
    var w = btn.offsetWidth, h = btn.offsetHeight;
    var inset = Math.min(40, tr.width * 0.08);
    // at the tile's end corner: left side in Arabic, right side in English
    var x = I.isAr() ? tr.left - sr.left + inset : tr.right - sr.left - inset - w;
    btn.style.left = Math.round(x) + 'px';
    btn.style.top = Math.round(tr.top - sr.top - h) + 'px';
    btn.classList.add('is-placed');
  }
  // wait for the tiles' entrance animation before measuring
  setTimeout(place, 900);
  window.addEventListener('resize', function () { clearTimeout(place._t); place._t = setTimeout(place, 80); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);

  // now and then it pops up by itself, so phone visitors notice it too
  function tease() {
    if (!panel.hidden || window.scrollY > 300 || reduceMotion.matches) return;
    btn.classList.add('is-up');
    setTimeout(function () { btn.classList.remove('is-up'); }, 2400);
  }
  setTimeout(tease, 1800);
  setInterval(tease, 14000);
  closeBtn.addEventListener('click', close);
  panel.addEventListener('click', function (e) { if (e.target === panel) close(); });
  document.addEventListener('keydown', function (e) {
    if (panel.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') {
      // keep keyboard focus inside the panel
      var f = panel.querySelectorAll('button, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  I.onChange(function () { render(); place(); });
})();
