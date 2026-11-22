/*
  Accounts worth following.

  Reads profiles.json (name, bio, picture, banner, followers), which the
  hourly "Update game feeds" GitHub Action refreshes from X through
  FxTwitter. Which accounts appear, and in what order, is set in
  accounts.json.
*/
(function () {
  'use strict';

  var host = document.getElementById('accounts');
  var I = window.UniI18n || {
    t: function (k) { return k; }, isAr: function () { return false; }, onChange: function () {}
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var profiles = [];
  var cards = [];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // bio text with its links, e-mail addresses and @mentions made clickable
  function bioHtml(p) {
    var html = esc(p.bio || '');
    (p.bioLinks || []).forEach(function (l) {
      html = html.split(esc(l.text)).join(
        '<a href="' + esc(l.url) + '" target="_blank" rel="noopener nofollow">' + esc(l.display) + '</a>');
    });
    html = html.replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.-]+)/g, '$1<a href="mailto:$2">$2</a>');
    html = html.replace(/(^|[\s(])@(\w{1,15})/g, '$1<a href="https://x.com/$2" target="_blank" rel="noopener">@$2</a>');
    return html;
  }

  function compact(n) {
    try {
      return new Intl.NumberFormat(I.isAr() ? 'ar-u-nu-latn' : 'en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
    } catch (e) {
      return String(n);
    }
  }

  function makeCard(p, i) {
    var card = document.createElement('article');
    card.className = 'acct';
    card.setAttribute('role', 'listitem');
    card.style.setProperty('--i', i);
    card.innerHTML =
      '<a class="acct-banner" href="' + esc(p.url) + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' +
        (p.banner ? '<img src="' + esc(p.banner) + '" alt="" loading="lazy" decoding="async">' : '') +
        '<span class="acct-x"><svg><use href="#i-x"/></svg></span>' +
      '</a>' +
      '<a class="acct-avatar" href="' + esc(p.url) + '" target="_blank" rel="noopener">' +
        (p.avatar ? '<img src="' + esc(p.avatar) + '" alt="" width="400" height="400" decoding="async">' : '') +
      '</a>' +
      '<div class="acct-body">' +
        '<h2 class="acct-name"><a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.name || p.screenName) + '</a>' +
          (p.verified ? '<svg class="acct-verified" role="img"><title></title><use href="#i-verified"/></svg>' : '') +
        '</h2>' +
        '<p class="acct-handle" dir="ltr">@' + esc(p.screenName || p.handle) + '</p>' +
        (p.bio ? '<p class="acct-bio" dir="auto">' + bioHtml(p) + '</p>' : '') +
        '<ul class="acct-meta">' +
          (p.followers != null ? '<li><svg aria-hidden="true"><use href="#i-users"/></svg><span class="acct-followers"></span></li>' : '') +
          (p.location ? '<li><svg aria-hidden="true"><use href="#i-pin"/></svg><span dir="auto">' + esc(p.location) + '</span></li>' : '') +
          (p.website ? '<li><svg aria-hidden="true"><use href="#i-link"/></svg><a href="' + esc(p.website.url) + '" target="_blank" rel="noopener" dir="ltr">' + esc(p.website.display) + '</a></li>' : '') +
        '</ul>' +
        '<a class="acct-follow" href="' + esc(p.url) + '" target="_blank" rel="noopener">' +
          '<svg aria-hidden="true"><use href="#i-x"/></svg><span class="acct-follow-text"></span>' +
        '</a>' +
      '</div>';
    card._p = p;
    texts(card);
    bindTilt(card);
    return card;
  }

  function texts(card) {
    var p = card._p;
    var f = card.querySelector('.acct-followers');
    if (f) f.textContent = compact(p.followers) + ' ' + I.t('acc.followers');
    card.querySelector('.acct-follow-text').textContent = I.t('acc.follow');
    var v = card.querySelector('.acct-verified title');
    if (v) v.textContent = I.t('acc.verified');
    var av = card.querySelector('.acct-avatar img');
    if (av) av.alt = I.t('acc.avatar') + ' ' + (p.name || p.screenName);
    card.querySelector('.acct-avatar').setAttribute('aria-label', (p.name || p.screenName) + ' — X');
  }

  /* ---------- hover tilt (same feel as the other pages) ---------- */

  function bindTilt(card) {
    card.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - y) * 8).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      card.classList.add('is-hover');
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.classList.remove('is-hover');
    });
  }

  /* ---------- load ---------- */

  function render() {
    host.innerHTML = '';
    cards = profiles.map(makeCard);
    cards.forEach(function (c) { host.appendChild(c); });
    if (!cards.length) {
      var p = document.createElement('p');
      p.className = 'acc-empty';
      p.setAttribute('data-i18n', 'acc.empty');
      p.textContent = I.t('acc.empty');
      host.appendChild(p);
    }
  }

  fetch('profiles.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { profiles = (d && d.profiles) || []; render(); })
    .catch(function () { render(); });

  I.onChange(function () { cards.forEach(texts); });
})();
