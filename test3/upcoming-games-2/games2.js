(function () {
  'use strict';

  var data = window.UPCOMING2 || { games: [] };
  var I = window.UniI18n || {
    t: function (k) { return k; }, isAr: function () { return false; }, onChange: function () {},
    fmtDate: function (d, o) { return d.toLocaleDateString('en-GB', o); }
  };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var grid = document.getElementById('grid');
  var title = document.getElementById('up2-title');
  var hero = document.getElementById('heroArt');

  var PLATFORM = {
    switch: ['p-switch', 'Nintendo Switch'],
    xbox: ['p-xbox', 'Xbox'],
    pc: ['p-pc', 'PC'],
    ps: ['p-ps', 'PlayStation'],
    mac: ['p-mac', 'Mac'],
    android: ['p-android', 'Android']
  };
  var PLAYERS = { single: 'pl-single', multi: 'pl-multi', coop: 'pl-multi' };

  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // day 1 → 30, then name for games on the same day
  var games = data.games.slice().sort(function (a, b) {
    return a.date < b.date ? -1 : a.date > b.date ? 1 : a.title.localeCompare(b.title);
  });

  var cards = games.map(function (g, i) {
    var li = document.createElement('li');
    li.className = 'g2';
    li.style.setProperty('--i', i);
    var tag = g.url ? 'a' : 'div';
    var link = g.url ? ' href="' + esc(g.url) + '" target="_blank" rel="noopener"' : '';
    li.innerHTML =
      '<p class="g2-date"><span class="g2-day"></span><span class="g2-bar" aria-hidden="true"></span><span class="g2-month"></span></p>' +
      '<' + tag + ' class="g2-card"' + link + '>' +
        '<span class="g2-poster">' +
          '<img src="' + esc(g.poster) + '" alt="" loading="lazy" decoding="async">' +
          '<span class="g2-badges">' +
            '<span class="g2-ar ' + (g.arabic ? 'is-yes' : 'is-no') + '" aria-hidden="true">ع</span>' +
            '<span class="g2-players">' + (g.players || []).map(function (p) {
              return '<svg class="g2-pl" data-pl="' + p + '" aria-hidden="true"><use href="#' + (PLAYERS[p] || 'pl-single') + '"/></svg>';
            }).join('') + '</span>' +
          '</span>' +
          (g.dlc ? '<span class="g2-dlc">DLC</span>' : '') +
        '</span>' +
        '<span class="g2-platforms">' + (g.platforms || []).map(function (p) {
          var info = PLATFORM[p];
          return info ? '<svg class="g2-plat" role="img" aria-label="' + info[1] + '"><use href="#' + info[0] + '"/></svg>' : '';
        }).join('') + '</span>' +
      '</' + tag + '>' +
      (g.hot ? '<span class="g2-hot" aria-hidden="true">🔥</span>' : '');
    li._g = g;
    bindTilt(li.querySelector('.g2-card'));
    grid.appendChild(li);
    return li;
  });

  function texts() {
    var p = data.month.split('-');
    var first = new Date(+p[0], +p[1] - 1, 1);
    title.textContent = I.t('up2.title') + ' ' + I.fmtDate(first, { month: 'long', year: 'numeric' });
    hero.src = data.hero;
    hero.alt = title.textContent;
    cards.forEach(function (li) {
      var g = li._g;
      var d = parse(g.date);
      li.querySelector('.g2-day').textContent = String(d.getDate()).padStart(2, '0');
      li.querySelector('.g2-month').textContent = I.isAr()
        ? I.fmtDate(d, { month: 'long' })
        : I.fmtDate(d, { month: 'short' }).replace('.', '').toUpperCase();
      var ar = li.querySelector('.g2-ar');
      ar.title = I.t(g.arabic ? 'up2.arabic.yes' : 'up2.arabic.no');
      li.querySelectorAll('.g2-pl').forEach(function (s) { s.setAttribute('aria-label', I.t('up2.' + s.dataset.pl)); });
      var hot = li.querySelector('.g2-hot');
      if (hot) hot.title = I.t('up2.hot');
      var card = li.querySelector('.g2-card');
      card.setAttribute('aria-label', g.title + ', ' + I.fmtDate(d, { day: 'numeric', month: 'long' }) + ', ' +
        (g.platforms || []).map(function (p) { return (PLATFORM[p] || [0, p])[1]; }).join(', ') + ', ' +
        I.t(g.arabic ? 'up2.arabic.yes' : 'up2.arabic.no'));
    });
  }

  /* ---------- gentle tilt under the mouse, like the other pages ---------- */

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

  texts();
  I.onChange(texts);
})();
