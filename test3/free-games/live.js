/*
  "Free for a limited time" section.

  Reads live.json, which a GitHub Action refreshes every hour from
  GamerPower (and FreeStuff when a key is set; see scripts/update-feeds.mjs). Offers are shown in a fixed
  order — the one ending soonest first — with a live countdown and the exact
  end time in the visitor's own time zone. Offers that end while the page is
  open disappear on their own.
*/
(function () {
  'use strict';

  var host = document.getElementById('live');
  if (!host) return;

  var I = window.UniI18n || {
    t: function (k) { return k; }, isAr: function () { return false; },
    onChange: function () {}, count: function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); },
    fmtDate: function (d, o) { return d.toLocaleString('en-GB', o); }
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var STORES = {
    steam: 'Steam', epic: 'Epic Games', gog: 'GOG', humble: 'Humble', itch: 'itch.io',
    ubi: 'Ubisoft', origin: 'EA app', prime: 'Prime Gaming', gamepass: 'Game Pass',
    playstation: 'PlayStation', gplay: 'Google Play', indiegala: 'IndieGala',
    stove: 'STOVE', drmfree: 'DRM-free', other: ''
  };

  var feed = null;
  var cards = [];
  var VISIBLE = 3;       // cards shown before "Show more"
  var expanded = false;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- text helpers ---------- */

  function timeLeft(until) {
    var ms = until - Date.now();
    var mins = Math.max(1, Math.floor(ms / 60000));
    var d = Math.floor(mins / 1440), h = Math.floor((mins % 1440) / 60), m = mins % 60;
    var parts = [];
    if (d) parts.push(I.count(d, 'day'));
    if (h && parts.length < 2) parts.push(I.count(h, 'hour'));
    if (!d && m && parts.length < 2) parts.push(I.count(m, 'minute'));
    return I.t('live.ends') + ' ' + parts.join(I.isAr() ? ' و' : ', ');
  }

  // GamerPower only gives a reliable end day, so those show the date alone
  function endText(it) {
    var opts = it.untilPrecision === 'day'
      ? { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }
      : { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };
    return I.t('live.until') + ' ' + I.fmtDate(new Date(it.until), opts);
  }

  function money(price) {
    if (!price || !price.old) return '';
    try {
      // prices read the same in both languages, e.g. $14.99
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(price.old / 100);
    } catch (e) {
      return (price.old / 100).toFixed(2) + ' ' + price.currency;
    }
  }

  /* ---------- build ---------- */

  var head = el('div', 'live-head');
  head.innerHTML =
    '<span class="live-badge" aria-hidden="true"><span class="live-dot"></span></span>' +
    '<div class="live-text"><h2 class="live-title" id="live-title"></h2><p class="live-sub"></p></div>';
  host.setAttribute('aria-labelledby', 'live-title');
  var grid = el('div', 'live-grid');
  grid.setAttribute('role', 'list');
  var empty = el('p', 'live-empty');
  grid.id = 'live-grid';
  var more = el('button', 'live-more',
    '<span class="live-more-text"></span>' +
    '<svg class="live-more-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"/></svg>');
  more.type = 'button';
  more.setAttribute('aria-controls', 'live-grid');
  more.hidden = true;
  host.appendChild(head);
  host.appendChild(grid);
  host.appendChild(more);
  host.appendChild(empty);

  /* ---------- show the first few, the rest behind "Show more" ---------- */

  function moreText() {
    var extra = cards.length - VISIBLE;
    more.querySelector('.live-more-text').textContent =
      expanded ? I.t('live.less') : I.t('live.more') + ' (' + extra + ')';
    more.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    more.classList.toggle('is-open', expanded);
  }

  function applyMore() {
    more.hidden = cards.length <= VISIBLE;
    cards.forEach(function (c, k) {
      c.hidden = !expanded && k >= VISIBLE;
      // newly shown cards come in one after another, starting right away
      c.style.setProperty('--i', k >= VISIBLE ? k - VISIBLE : k);
    });
    moreText();
  }

  more.addEventListener('click', function () {
    expanded = !expanded;
    applyMore();
    // when folding back up, bring the section top back into view if needed
    if (!expanded && host.getBoundingClientRect().top < 0) {
      host.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
    }
  });

  function makeCard(item, index) {
    var a = el('a', 'deal deal--' + (item.type === 'timed' ? 'timed' : 'keep'));
    a.href = item.url || '#';
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('role', 'listitem');
    a.style.setProperty('--i', index);
    a._item = item;
    var store = STORES[item.store] || item.storeLabel || '';
    a.innerHTML =
      '<span class="deal-media">' +
        (item.image ? '<img src="' + esc(item.image) + '" alt="" loading="lazy" decoding="async">' : '') +
        '<span class="deal-type"></span>' +
        (store ? '<span class="deal-store">' + esc(store) + '</span>' : '') +
      '</span>' +
      '<span class="deal-body">' +
        '<span class="deal-title">' + esc(item.title) + '</span>' +
        '<span class="deal-price"><s class="deal-old"></s><b class="deal-free"></b></span>' +
        '<span class="deal-timer"><span class="deal-left"></span><span class="deal-end"></span></span>' +
      '</span>';
    return a;
  }

  function cardText(a) {
    var it = a._item;
    a.querySelector('.deal-type').textContent = I.t(it.type === 'timed' ? 'live.timed' : 'live.keep');
    var old = money(it.price);
    var s = a.querySelector('.deal-old');
    s.textContent = old;
    s.hidden = !old;
    a.querySelector('.deal-free').textContent = I.t('live.free');
    var left = a.querySelector('.deal-left');
    var end = a.querySelector('.deal-end');
    if (it.until) {
      var hours = (it.until - Date.now()) / 3600000;
      left.textContent = timeLeft(it.until);
      end.textContent = endText(it);
      a.classList.toggle('is-ending', hours < 24);
    } else {
      left.textContent = I.t('live.noend');
      end.textContent = '';
    }
    a.setAttribute('aria-label', it.title + ', ' + I.t(it.type === 'timed' ? 'live.timed' : 'live.keep') + (it.until ? ', ' + timeLeft(it.until) : ''));
  }

  function headText() {
    head.querySelector('.live-title').textContent = I.t('live.title');
    var sub = I.t('live.sub');
    if (feed && feed.updated) {
      sub += ' · ' + I.t('live.updated') + ' ' + I.fmtDate(new Date(feed.updated), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    }
    var subEl = head.querySelector('.live-sub');
    subEl.textContent = sub;
    // credit the data source
    if (feed && feed.sources && feed.sources.indexOf('GamerPower') !== -1) {
      subEl.appendChild(document.createTextNode(' · '));
      var a = document.createElement('a');
      a.href = 'https://www.gamerpower.com/';
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = I.t('live.data') + ' GamerPower';
      subEl.appendChild(a);
    }
  }

  function current(items) {
    var now = Date.now();
    return items.filter(function (it) { return !it.until || it.until > now; })
      .sort(function (a, b) {
        // stable sort: offers without an end date keep the feed's order (newest first)
        var ua = a.until || Infinity, ub = b.until || Infinity;
        return ua === ub ? 0 : ua - ub;
      });
  }

  function render() {
    var items = current((feed && feed.items) || []);
    grid.innerHTML = '';
    cards = items.map(makeCard);
    cards.forEach(function (c) { cardText(c); grid.appendChild(c); bindTilt(c); });
    applyMore();
    empty.hidden = items.length > 0;
    empty.textContent = I.t(feed && feed.updated ? 'live.empty' : 'live.waiting');
    host.classList.toggle('is-empty', !items.length);
    headText();
  }

  // once a minute: refresh timers and drop offers that have ended
  setInterval(function () {
    if (!feed) return;
    var still = current(feed.items || []);
    if (still.length !== cards.length) { render(); return; }
    cards.forEach(cardText);
  }, 60000);

  /* ---------- hover tilt (same feel as the other pages) ---------- */

  function bindTilt(card) {
    card.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', ((x - 0.5) * 10).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
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

  render();
  fetch('live.json', { cache: 'no-cache' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) { feed = data || { items: [] }; render(); })
    .catch(function () { feed = null; render(); });

  I.onChange(function () { headText(); cards.forEach(cardText); moreText(); empty.textContent = I.t(feed && feed.updated ? 'live.empty' : 'live.waiting'); });
})();
