(function () {
  'use strict';

  var data = window.FREE_GAMES || { month: '', rows: [] };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var host = document.getElementById('shelves');
  var I = window.UniI18n || {
    t: function (k) { return k; }, isAr: function () { return false; },
    pick: function (o, f) { return o[f]; }, onChange: function () {},
    count: function (n, w) { return n + ' ' + w + 's'; }
  };
  var monthLabel = document.getElementById('monthLabel');
  monthLabel.textContent = I.pick(data, 'month');

  var GAP = 18;
  var FRICTION = 0.92;           // per 16 ms frame
  var AUTO_SPEED = 0.42;         // px per 16 ms frame when idle
  var WARP_TURN = 20;            // degrees at the edge of the row
  var WARP_DEPTH = 56;           // px the edge cards come forward
  var MAX_SKEW = 9;              // degrees of lean while moving fast

  var rows = data.rows.map(buildRow);

  /* ---------- build ---------- */

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function buildRow(r, rowIndex) {
    var section = el('section', 'shelf shelf--' + r.id);
    section.setAttribute('aria-labelledby', 'shelf-' + r.id);
    section.style.setProperty('--delay', (rowIndex * 120) + 'ms');

    var head = el('div', 'shelf-head');
    head.innerHTML =
      '<span class="shelf-badge" aria-hidden="true"><svg><use href="#' + r.icon + '"/></svg></span>' +
      '<div class="shelf-text">' +
        '<h2 class="shelf-title" id="shelf-' + r.id + '"></h2>' +
        '<p class="shelf-sub"></p>' +
      '</div>';
    var nav = el('div', 'shelf-nav');
    var prev = el('button', 'shelf-btn', '<svg aria-hidden="true"><use href="#i-chev"/></svg>');
    var next = el('button', 'shelf-btn shelf-btn--next', '<svg aria-hidden="true"><use href="#i-chev"/></svg>');
    prev.type = next.type = 'button';
    prev.dataset.i18nAttr = 'aria-label:free.left';
    next.dataset.i18nAttr = 'aria-label:free.right';
    prev.setAttribute('aria-label', I.t('free.left'));
    next.setAttribute('aria-label', I.t('free.right'));
    nav.appendChild(prev);
    nav.appendChild(next);
    head.appendChild(nav);

    var view = el('div', 'shelf-view');
    var track = el('div', 'shelf-track');
    track.setAttribute('role', 'list');
    view.appendChild(track);

    section.appendChild(head);
    section.appendChild(view);
    host.appendChild(section);

    var row = {
      data: r,
      head: head,
      section: section,
      view: view,
      track: track,
      cards: [],
      offset: 0,
      vel: 0,
      dir: r.direction || -1,
      paused: false,
      resumeAt: 0,
      visible: true,
      dragging: false,
      moved: 0,
      cardW: 0,
      pitch: 0,
      total: 0,
      viewW: 0
    };

    prev.addEventListener('click', function () { nudge(row, 1); });
    next.addEventListener('click', function () { nudge(row, -1); });

    bindPointer(row);
    return row;
  }

  function makeCard(g, isCopy) {
    var a = el('a', 'fcard fcard--' + g.tag);
    a.href = g.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.draggable = false;
    a.setAttribute('role', 'listitem');
    if (isCopy) {
      a.setAttribute('aria-hidden', 'true');
      a.tabIndex = -1;
    }
    a.innerHTML =
      '<span class="fcard-inner">' +
        '<img src="' + esc(g.poster) + '" alt="" width="600" height="900" decoding="async" draggable="false">' +
        '<span class="fcard-shine"></span>' +
        '<span class="fcard-tag"></span>' +
        '<span class="fcard-info">' +
          '<span class="fcard-title">' + esc(g.title) + '</span>' +
          (g.note ? '<span class="fcard-note"></span>' : '') +
        '</span>' +
      '</span>';
    a._game = g;
    cardText(a);
    return a;
  }

  // text that changes with the language
  function cardText(a) {
    var g = a._game;
    var label = I.pick(g, 'label');
    var note = g.note ? I.pick(g, 'note') : '';
    a.querySelector('.fcard-tag').textContent = label;
    if (note) a.querySelector('.fcard-note').textContent = note;
    a.setAttribute('aria-label', g.title + ', ' + label + (note ? ', ' + note : ''));
  }

  function headText(row) {
    var r = row.data;
    row.head.querySelector('.shelf-title').textContent = I.pick(r, 'title');
    // \u2068…\u2069 keep each part's own direction when Arabic and English mix
    row.head.querySelector('.shelf-sub').textContent =
      '\u2068' + I.pick(r, 'sub') + '\u2069 · \u2068' + I.count(r.games.length, 'game') + '\u2069';
  }

  /* ---------- layout ---------- */

  function layout(row) {
    var games = row.data.games;
    // measure one card
    if (!row.cards.length) {
      var probe = makeCard(games[0], true);
      row.track.appendChild(probe);
      row.cards.push(probe);
    }
    row.cardW = row.cards[0].offsetWidth || 200;
    row.pitch = row.cardW + GAP;
    row.viewW = row.view.clientWidth || window.innerWidth;

    // repeat the list until it is wider than the screen, so it can loop
    var copies = Math.max(2, Math.ceil((row.viewW + row.pitch * 2) / (games.length * row.pitch)));
    var needed = copies * games.length;
    if (row.cards.length !== needed) {
      row.track.innerHTML = '';
      row.cards = [];
      for (var c = 0; c < copies; c++) {
        games.forEach(function (g) {
          var card = makeCard(g, c > 0);
          row.track.appendChild(card);
          row.cards.push(card);
        });
      }
      bindCards(row);
    }
    row.total = row.cards.length * row.pitch;
  }

  function mod(a, n) { return ((a % n) + n) % n; }

  function render(row) {
    var half = row.viewW / 2;
    var lean = reduceMotion.matches ? 0 : Math.max(-MAX_SKEW, Math.min(MAX_SKEW, (row.vel - autoVel(row)) * 0.55));
    for (var i = 0; i < row.cards.length; i++) {
      var x = mod(i * row.pitch + row.offset, row.total) - row.pitch;
      var card = row.cards[i];
      if (x < -row.pitch * 1.2 || x > row.viewW + row.pitch * 0.2) {
        card.style.visibility = 'hidden';
        card.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
        continue;
      }
      card.style.visibility = '';
      var n = (x + row.cardW / 2 - half) / half;           // -1 left edge … 1 right edge
      n = Math.max(-1.35, Math.min(1.35, n));
      var turn = -n * WARP_TURN;
      var z = n * n * WARP_DEPTH;
      card.style.transform =
        'translate3d(' + x.toFixed(1) + 'px,0,' + z.toFixed(1) + 'px) rotateY(' + turn.toFixed(2) + 'deg) skewX(' + lean.toFixed(2) + 'deg)';
    }
  }

  function autoVel(row) {
    if (reduceMotion.matches || row.paused || performance.now() < row.resumeAt) return 0;
    return row.dir * AUTO_SPEED;
  }

  /* ---------- motion ---------- */

  var last = performance.now();
  var raf = 0;

  function frame(now) {
    var dt = Math.min(64, now - last) / 16.667;
    last = now;
    rows.forEach(function (row) {
      if (!row.dragging) {
        var base = autoVel(row);
        var f = Math.pow(FRICTION, dt);
        row.vel = base + (row.vel - base) * f;
        row.offset += row.vel * dt;
      }
      if (row.visible) render(row);
    });
    raf = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(raf);
    if (document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function nudge(row, cards) {
    // a push that coasts about `cards` posters before settling
    row.vel += cards * row.pitch * (1 - FRICTION) / FRICTION;
    row.resumeAt = performance.now() + 2500;
  }

  /* ---------- drag, swipe, wheel ---------- */

  function bindPointer(row) {
    var view = row.view;
    var startX = 0, startY = 0, startOffset = 0, lastX = 0, lastT = 0, id = null, axis = '';

    view.addEventListener('pointerenter', function (e) {
      if (e.pointerType === 'mouse') row.paused = true;
    });
    view.addEventListener('pointerleave', function (e) {
      if (e.pointerType === 'mouse') row.paused = false;
    });

    view.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      id = e.pointerId;
      startX = lastX = e.clientX;
      startY = e.clientY;
      startOffset = row.offset;
      lastT = performance.now();
      row.moved = 0;
      axis = '';
    });

    view.addEventListener('pointermove', function (e) {
      if (id !== e.pointerId) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'x') {
          row.dragging = true;
          row.section.classList.add('is-dragging');
          try { view.setPointerCapture(e.pointerId); } catch (err) {}
          clearHover(row);
        }
      }
      if (!row.dragging) return;
      row.moved = Math.max(row.moved, Math.abs(dx));
      var now = performance.now();
      var dt = Math.max(1, now - lastT) / 16.667;
      row.vel = row.vel * 0.5 + ((e.clientX - lastX) / dt) * 0.5;
      lastX = e.clientX;
      lastT = now;
      row.offset = startOffset + dx;
    });

    function end(e) {
      if (id !== e.pointerId) return;
      id = null;
      if (row.dragging) {
        row.dragging = false;
        row.section.classList.remove('is-dragging');
        row.vel = Math.max(-60, Math.min(60, row.vel));
        row.resumeAt = performance.now() + 2500;
      }
    }
    view.addEventListener('pointerup', end);
    view.addEventListener('pointercancel', end);

    // a drag should not count as a click on the poster
    view.addEventListener('click', function (e) {
      if (row.moved > 6) {
        e.preventDefault();
        row.moved = 0;
      }
    }, true);
    view.addEventListener('dragstart', function (e) { e.preventDefault(); });

    view.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      row.offset -= e.deltaX;
      row.vel = -e.deltaX * 0.25;
      row.resumeAt = performance.now() + 2500;
    }, { passive: false });

    // arrow keys while a poster in this row has focus
    row.section.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { nudge(row, -1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { nudge(row, 1); e.preventDefault(); }
    });
  }

  /* ---------- poster hover: tilt + light ---------- */

  var MAX_TILT = 10;

  function bindCards(row) {
    row.cards.forEach(function (card) {
      var inner = card.firstChild;
      card.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse' || row.dragging || reduceMotion.matches) return;
        var r = inner.getBoundingClientRect();
        var x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
        var y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
        inner.style.setProperty('--ry', ((x - 0.5) * 2 * MAX_TILT).toFixed(2) + 'deg');
        inner.style.setProperty('--rx', ((0.5 - y) * 2 * MAX_TILT).toFixed(2) + 'deg');
        inner.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        inner.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        card.classList.add('is-hover');
      });
      card.addEventListener('pointerleave', function () { resetCard(card); });

      // keep a focused poster on screen
      card.addEventListener('focus', function () {
        var x = card.getBoundingClientRect().left - row.view.getBoundingClientRect().left;
        if (x < 0 || x + row.cardW > row.viewW) {
          row.offset += row.viewW / 2 - (x + row.cardW / 2);
          row.vel = 0;
          row.resumeAt = performance.now() + 4000;
        }
        row.paused = true;
      });
      card.addEventListener('blur', function () { row.paused = false; });
    });
  }

  function resetCard(card) {
    var inner = card.firstChild;
    inner.style.setProperty('--rx', '0deg');
    inner.style.setProperty('--ry', '0deg');
    card.classList.remove('is-hover');
  }

  function clearHover(row) {
    row.cards.forEach(function (c) { if (c.classList.contains('is-hover')) resetCard(c); });
  }

  /* ---------- start ---------- */

  rows.forEach(function (row) {
    layout(row);
    // start each row a little shifted so they don't line up
    row.offset = -row.pitch * 0.35 * (rows.indexOf(row) + 1);
    render(row);
  });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        rows.forEach(function (row) { if (row.view === en.target) row.visible = en.isIntersecting; });
      });
    }, { rootMargin: '120px 0px' });
    rows.forEach(function (row) { io.observe(row.view); });
  }

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { rows.forEach(function (row) { layout(row); render(row); }); }, 80);
  });
  document.addEventListener('visibilitychange', start);

  rows.forEach(headText);
  I.onChange(function () {
    monthLabel.textContent = I.pick(data, 'month');
    rows.forEach(function (row) {
      headText(row);
      row.cards.forEach(cardText);
    });
  });

  start();
  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });
})();
