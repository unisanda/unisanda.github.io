/*
  Platform tabs (X / Instagram / TikTok) and the Instagram and TikTok cards.

  - X is the default tab every time the page opens (#instagram or #tiktok in
    the address opens those tabs instead).
  - Instagram cards come from accounts.json (written by hand: Instagram does
    not show profiles without logging in).
  - TikTok cards come from tiktok.json, refreshed hourly by the feed workflow.
*/
(function () {
  'use strict';

  var I = window.UniI18n || {
    t: function (k) { return k; }, isAr: function () { return false; }, onChange: function () {}
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function compact(n) {
    try {
      return new Intl.NumberFormat(I.isAr() ? 'ar-u-nu-latn' : 'en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
    } catch (e) { return String(n); }
  }
  // bio text: line breaks kept, links, e-mails and @mentions clickable
  function bioHtml(text, mention) {
    var html = esc(text || '');
    html = html.replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.-]+)/g, '$1<a href="mailto:$2">$2</a>');
    html = html.replace(/(^|[\s(])@([\w.]{1,30})/g, function (m, a, h) {
      return a + '<a href="' + mention + encodeURIComponent(h) + '" target="_blank" rel="noopener">@' + h + '</a>';
    });
    return html.replace(/\n/g, '<br>');
  }
  function linkHref(t) { return /^https?:\/\//i.test(t) ? t : 'https://' + t; }

  /* ---------- tabs ---------- */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.acc-tab'));
  var tabBar = document.querySelector('.acc-tabs');
  var NAMES = { x: '', ig: 'instagram', tt: 'tiktok' };

  function select(name, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.tab === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById('panel-' + t.dataset.tab).hidden = !on;
      if (on && focus) t.focus();
    });
    tabBar.dataset.active = name;
    var hash = NAMES[name] ? '#' + NAMES[name] : ' ';
    try { history.replaceState(null, '', hash === ' ' ? location.pathname + location.search : hash); } catch (e) {}
  }
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { select(t.dataset.tab); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      if (I.isAr()) d = -d;
      e.preventDefault();
      select(tabs[(k + d + tabs.length) % tabs.length].dataset.tab, true);
    });
  });
  var start = { '#instagram': 'ig', '#tiktok': 'tt' }[location.hash] || 'x';
  select(start);

  /* ---------- shared tilt ---------- */

  function bindTilt(card) {
    card.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - y) * 8).toFixed(2) + 'deg');
      card.classList.add('is-hover');
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.classList.remove('is-hover');
    });
  }

  /* ---------- Instagram ---------- */

  var igCards = [];

  function igCard(p, i) {
    var url = 'https://www.instagram.com/' + encodeURIComponent(p.handle) + '/';
    var card = document.createElement('article');
    card.className = 'ig';
    card.setAttribute('role', 'listitem');
    card.style.setProperty('--i', i);
    var hasStats = p.posts != null || p.followers != null || p.following != null;
    card.innerHTML =
      '<div class="ig-top">' +
        '<a class="ig-avatar" href="' + url + '" target="_blank" rel="noopener">' +
          (p.avatar ? '<img src="' + esc(p.avatar) + '" alt="" decoding="async">'
                    : '<span class="ig-initial" aria-hidden="true">' + esc((p.name || p.handle).charAt(0).toUpperCase()) + '</span>') +
        '</a>' +
        '<div class="ig-id">' +
          '<h2 class="ig-name"><a href="' + url + '" target="_blank" rel="noopener">' + esc(p.name || p.handle) + '</a>' +
            (p.verified ? '<svg class="ig-verified" aria-hidden="true"><use href="#i-verified"/></svg>' : '') + '</h2>' +
          '<p class="ig-handle" dir="ltr">@' + esc(p.handle) + '</p>' +
          (hasStats ? '<ul class="ig-stats">' +
            (p.posts != null ? '<li><b>' + p.posts + '</b><span data-k="acc.posts"></span></li>' : '') +
            (p.followers != null ? '<li><b class="ig-n" data-n="' + p.followers + '"></b><span data-k="acc.followers"></span></li>' : '') +
            (p.following != null ? '<li><b>' + p.following + '</b><span data-k="acc.following"></span></li>' : '') +
          '</ul>' : '') +
        '</div>' +
      '</div>' +
      '<div class="ig-body">' +
        (p.category ? '<p class="ig-category" dir="auto">' + esc(p.category) + '</p>' : '') +
        (p.bio ? '<p class="ig-bio" dir="auto">' + bioHtml(p.bio, 'https://www.instagram.com/') + '</p>' : '') +
        (p.website ? '<a class="ig-link" href="' + esc(linkHref(p.website)) + '" target="_blank" rel="noopener" dir="ltr">' +
          '<svg aria-hidden="true"><use href="#i-link"/></svg>' + esc(p.website) + '</a>' : '') +
        '<a class="ig-follow" href="' + url + '" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-ig"/></svg><span data-k="acc.ig.follow"></span></a>' +
      '</div>';
    bindTilt(card);
    return card;
  }

  /* ---------- TikTok ---------- */

  var ttCards = [];

  function ttCard(p, i) {
    var card = document.createElement('article');
    card.className = 'tt';
    card.setAttribute('role', 'listitem');
    card.style.setProperty('--i', i);
    card.innerHTML =
      (p.avatar ? '<span class="tt-glow" style="background-image:url(\'' + esc(p.avatar) + '\')" aria-hidden="true"></span>' : '') +
      '<div class="tt-head">' +
        '<div class="tt-id">' +
          '<h2 class="tt-name"><a href="' + esc(p.url) + '" target="_blank" rel="noopener" dir="auto">' + esc(p.name) + '</a></h2>' +
          '<p class="tt-handle" dir="ltr">@' + esc(p.uniqueId || p.handle) + '</p>' +
          '<ul class="tt-stats">' +
            '<li><b class="tt-n" data-n="' + p.following + '"></b><span data-k="acc.following"></span></li>' +
            '<li><b class="tt-n" data-n="' + p.followers + '"></b><span data-k="acc.followers"></span></li>' +
            '<li><b class="tt-n" data-n="' + p.likes + '"></b><span data-k="acc.likes"></span></li>' +
          '</ul>' +
        '</div>' +
        '<a class="tt-avatar" href="' + esc(p.url) + '" target="_blank" rel="noopener">' +
          (p.avatar ? '<img src="' + esc(p.avatar) + '" alt="" decoding="async">' : '') +
        '</a>' +
      '</div>' +
      '<div class="tt-body">' +
        (p.bio ? '<p class="tt-bio" dir="auto">' + bioHtml(p.bio, 'https://www.tiktok.com/@') + '</p>' : '') +
        (p.link ? '<a class="tt-link" href="' + esc(linkHref(p.link)) + '" target="_blank" rel="noopener" dir="ltr">' + esc(p.link) + '</a>' : '') +
        '<a class="tt-follow" href="' + esc(p.url) + '" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-tt"/></svg><span data-k="acc.tt.follow"></span></a>' +
      '</div>';
    bindTilt(card);
    return card;
  }

  /* ---------- text that follows the language ---------- */

  function texts(card) {
    card.querySelectorAll('[data-k]').forEach(function (el) { el.textContent = I.t(el.getAttribute('data-k')); });
    card.querySelectorAll('[data-n]').forEach(function (el) { el.textContent = compact(+el.getAttribute('data-n')); });
    var img = card.querySelector('.ig-avatar img, .tt-avatar img');
    var name = card.querySelector('.ig-name a, .tt-name a');
    if (img && name) img.alt = I.t('acc.avatar') + ' ' + name.textContent;
  }

  function fill(host, list, make) {
    host.innerHTML = '';
    var cards = list.map(make);
    cards.forEach(function (c) { texts(c); host.appendChild(c); });
    if (!cards.length) {
      var p = document.createElement('p');
      p.className = 'acc-empty';
      p.textContent = I.t('acc.empty');
      host.appendChild(p);
    }
    return cards;
  }

  fetch('accounts.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { igCards = fill(document.getElementById('accounts-ig'), (d && d.instagram) || [], igCard); })
    .catch(function () { igCards = fill(document.getElementById('accounts-ig'), [], igCard); });

  fetch('tiktok.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { ttCards = fill(document.getElementById('accounts-tt'), (d && d.profiles) || [], ttCard); })
    .catch(function () { ttCards = fill(document.getElementById('accounts-tt'), [], ttCard); });

  I.onChange(function () { igCards.concat(ttCards).forEach(texts); });
})();
