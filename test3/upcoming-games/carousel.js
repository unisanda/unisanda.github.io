(function () {
  'use strict';

  var data = window.UPCOMING || { month: '', games: [] };
  var games = data.games.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
  var N = games.length;
  if (!N) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var ring = document.getElementById('ring');
  var stage = document.getElementById('stage');
  var elDate = document.getElementById('nowDate');
  var elTitle = document.getElementById('nowTitle');
  var elPlatforms = document.getElementById('platforms');
  var elStatus = document.getElementById('status');
  var elDots = document.getElementById('dots');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');

  var I = window.UniI18n || {
    t: function (k) { return k; }, isAr: function () { return false; },
    pick: function (o, f) { return o[f]; }, onChange: function () {},
    count: function (n, w) { return n + ' ' + w + 's'; },
    fmtDate: function (d, o) { return d.toLocaleDateString('en-GB', o); }
  };
  var monthLabel = document.getElementById('monthLabel');
  monthLabel.textContent = I.pick(data, 'month');

  var PLATFORM = {
    ps5:     { label: 'PS5',      icon: 'p-ps5' },
    xbox:    { label: 'Xbox',     icon: 'p-xbox' },
    switch2: { label: 'Switch 2', icon: 'p-switch' },
    switch:  { label: 'Switch',   icon: 'p-switch' },
    pc:      { label: 'PC',       icon: 'p-pc' }
  };

  /* ---------- dates ---------- */

  function parseDate(s) {
    var p = s.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  var today = new Date();
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var DAY = 86400000;

  function daysUntil(g) { return Math.round((parseDate(g.date) - today) / DAY); }

  function statusText(days) {
    if (days > 1) return I.isAr() ? 'بعد ' + I.count(days, 'day') : 'In ' + I.count(days, 'day');
    if (days === 1) return I.t('st.tomorrow');
    if (days === 0) return I.t('st.today');
    return I.t('st.out');
  }

  function longDate(g) {
    return I.fmtDate(parseDate(g.date), { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function dayBadge(g) {
    var d = parseDate(g.date);
    return '<b>' + d.getDate() + '</b>' + I.fmtDate(d, { month: 'short' });
  }

  /* ---------- build cards ---------- */

  var cards = games.map(function (g, i) {
    var card = document.createElement('div');
    card.className = 'card';
    card.style.setProperty('--accent', g.accent || '#ffffff');
    card.dataset.index = i;
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', g.title);

    var inner = document.createElement('div');
    inner.className = 'card-inner';

    var img = document.createElement('img');
    img.src = g.poster;
    img.alt = I.isAr() ? I.t('up.poster') + ' ' + g.title : g.title + ' ' + I.t('up.poster');
    img.width = 600;
    img.height = 900;
    img.decoding = 'async';
    img.draggable = false;

    var shine = document.createElement('span');
    shine.className = 'card-shine';
    var shade = document.createElement('span');
    shade.className = 'card-shade';

    var day = document.createElement('span');
    day.className = 'card-day';
    day.innerHTML = dayBadge(g);

    inner.appendChild(img);
    inner.appendChild(shine);
    inner.appendChild(day);
    inner.appendChild(shade);
    card.appendChild(inner);
    stage.appendChild(card);
    return card;
  });

  var dots = games.map(function (g, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'dot';
    b.setAttribute('aria-label', g.title);
    b.addEventListener('click', function () { goTo(i); });
    elDots.appendChild(b);
    return b;
  });

  /* ---------- layout ---------- */

  var L = {};
  function measure() {
    var w = window.innerWidth;
    var cw = cards[0].offsetWidth || 220;
    var phone = w < 640;
    L.cardW = cw;
    L.step = phone ? 0.52 : (w < 1024 ? 0.44 : 0.39);      // radians between cards
    L.spacing = cw * (phone ? 0.96 : 1.1);                    // centre-to-centre at d = 1
    L.radius = L.spacing / Math.sin(L.step);
    L.depth = phone ? 0.75 : 1;                               // how far side cards come forward
    L.visible = phone ? 2.4 : 3.4;
    L.dragPx = L.spacing;                                     // pixels of drag per card
  }

  /* ---------- motion state ---------- */

  var pos = 0;        // current (float) index
  var target = 0;     // where we are heading
  var active = -1;
  var raf = 0;

  function wrap(d) {
    d = ((d % N) + N) % N;
    return d > N / 2 ? d - N : d;
  }

  function render() {
    for (var i = 0; i < N; i++) {
      var d = wrap(i - pos);
      var ad = Math.abs(d);
      var card = cards[i];
      if (ad > L.visible + 0.6) {
        card.style.visibility = 'hidden';
        continue;
      }
      card.style.visibility = '';
      var a = d * L.step;
      var x = L.radius * Math.sin(a);
      var z = L.radius * (1 - Math.cos(a)) * L.depth;
      var near = Math.max(0, 1 - ad);                    // 1 at centre, 0 from one step out
      var lift = near * 26;                               // centre card stands a bit forward
      var s = 1 + near * 0.04;
      card.style.transform =
        'translate3d(' + x.toFixed(1) + 'px,0,' + (z + lift).toFixed(1) + 'px) rotateY(' + (-a).toFixed(4) + 'rad) scale(' + s.toFixed(3) + ')';
      card.style.setProperty('--shade', Math.min(0.62, ad * 0.3).toFixed(3));
      card.style.setProperty('--near', near.toFixed(3));
      card.style.opacity = ad > L.visible ? Math.max(0, 1 - (ad - L.visible) / 0.6).toFixed(3) : '';
      card.style.zIndex = String(100 - Math.round(ad * 10));
    }
  }

  function setActive(i) {
    if (i === active) return;
    var prev = active;
    active = i;
    var g = games[i];
    var days = daysUntil(g);

    cards.forEach(function (c, k) {
      c.classList.toggle('is-center', k === i);
      c.setAttribute('aria-hidden', k === i ? 'false' : 'true');
    });
    dots.forEach(function (b, k) {
      b.classList.toggle('is-active', k === i);
      if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
    document.documentElement.style.setProperty('--now-accent', g.accent || '#ffffff');

    // swap the text with a small slide
    var dir = prev === -1 ? 0 : (wrap(i - prev) > 0 ? 1 : -1);
    swapText(elDate, longDate(g), dir);
    swapText(elTitle, g.title, dir);

    elStatus.textContent = statusText(days);
    elStatus.className = 'status ' + (days > 0 ? 'is-soon' : days === 0 ? 'is-today' : 'is-out');

    elPlatforms.innerHTML = '';
    g.platforms.forEach(function (p, k) {
      var info = PLATFORM[p];
      if (!info) return;
      var li = document.createElement('li');
      li.className = 'platform platform--' + p;
      li.style.animationDelay = (k * 60) + 'ms';
      li.innerHTML = '<svg aria-hidden="true"><use href="#' + info.icon + '"/></svg><span>' + info.label + '</span>';
      elPlatforms.appendChild(li);
    });
  }

  function swapText(el, text, dir) {
    if (el.textContent === text) return;
    el.textContent = text;
    el.style.setProperty('--from', (dir * 18) + 'px');
    el.classList.remove('swap');
    void el.offsetWidth; // restart the animation
    el.classList.add('swap');
  }

  function tick() {
    var k = reduceMotion.matches || dragging ? 1 : 0.14;
    var diff = target - pos;
    pos += diff * k;
    if (Math.abs(diff) < 0.0008) pos = target;
    render();
    setActive(((Math.round(pos) % N) + N) % N);
    if (pos !== target || dragging) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = 0;
    }
  }

  function kick() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function goTo(i) {
    // take the short way round
    var current = ((Math.round(target) % N) + N) % N;
    target = Math.round(target) + wrap(i - current);
    kick();
  }

  function step(n) {
    target = Math.round(target) + n;
    kick();
  }

  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });

  /* ---------- keyboard ---------- */

  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
    else if (e.key === 'Enter' && e.target === ring) { openActive(); }
  });

  function openActive() {
    var g = games[active];
    if (g && g.url) window.open(g.url, '_blank', 'noopener');
  }

  /* ---------- drag / swipe ---------- */

  var dragging = false;
  var startX = 0, startY = 0, startPos = 0, moved = 0;
  var lastX = 0, lastT = 0, vel = 0;
  var pointerId = null;
  var axis = '';

  ring.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    pointerId = e.pointerId;
    startX = lastX = e.clientX;
    startY = e.clientY;
    startPos = pos;
    lastT = performance.now();
    vel = 0;
    moved = 0;
    axis = '';
  });

  ring.addEventListener('pointermove', function (e) {
    if (pointerId === e.pointerId) {
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!axis && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'x') {
          dragging = true;
          ring.classList.add('is-dragging');
          try { ring.setPointerCapture(e.pointerId); } catch (err) {}
          resetTilt();
          kick();
        }
      }
      if (dragging) {
        moved = Math.max(moved, Math.abs(dx));
        var now = performance.now();
        var dt = Math.max(1, now - lastT);
        vel = vel * 0.6 + ((e.clientX - lastX) / dt) * 0.4;   // px per ms
        lastX = e.clientX;
        lastT = now;
        target = pos = startPos - dx / L.dragPx;
        return;
      }
    }
    tilt(e);
  });

  function endDrag(e) {
    if (pointerId !== e.pointerId) return;
    pointerId = null;
    if (dragging) {
      dragging = false;
      ring.classList.remove('is-dragging');
      // flick: carry on a little in the direction of travel
      var throwCards = -vel * 260 / L.dragPx;
      throwCards = Math.max(-3, Math.min(3, throwCards));
      target = Math.round(pos + throwCards);
      kick();
    }
  }
  ring.addEventListener('pointerup', endDrag);
  ring.addEventListener('pointercancel', endDrag);

  // a click without a drag: side card -> bring to centre, centre card -> open its page
  ring.addEventListener('click', function (e) {
    if (moved > 6) { moved = 0; return; }
    var card = e.target.closest('.card');
    if (!card) return;
    var i = +card.dataset.index;
    if (i === active) openActive();
    else goTo(i);
  });

  // horizontal trackpad swipes
  var wheelAcc = 0, wheelTimer = 0;
  ring.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    wheelAcc += e.deltaX;
    if (Math.abs(wheelAcc) > 70) {
      step(wheelAcc > 0 ? 1 : -1);
      wheelAcc = 0;
    }
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () { wheelAcc = 0; }, 160);
  }, { passive: false });

  /* ---------- centre card follows the mouse ---------- */

  var MAX_TILT = 9;
  var tilted = null;

  function tilt(e) {
    if (e.pointerType === 'touch' || reduceMotion.matches || dragging) return;
    var card = e.target.closest && e.target.closest('.card.is-center');
    if (!card) { resetTilt(); return; }
    var inner = card.firstChild;
    var r = inner.getBoundingClientRect();
    var x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
    var y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
    inner.style.setProperty('--ry', ((x - 0.5) * 2 * MAX_TILT).toFixed(2) + 'deg');
    inner.style.setProperty('--rx', ((0.5 - y) * 2 * MAX_TILT).toFixed(2) + 'deg');
    inner.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    inner.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    inner.classList.add('is-tilting');
    tilted = inner;
  }

  function resetTilt() {
    if (!tilted) return;
    tilted.style.setProperty('--rx', '0deg');
    tilted.style.setProperty('--ry', '0deg');
    tilted.classList.remove('is-tilting');
    tilted = null;
  }
  ring.addEventListener('pointerleave', resetTilt);

  /* ---------- start on the next game to come out ---------- */

  var start = 0;
  for (var i = 0; i < N; i++) {
    start = i;
    if (daysUntil(games[i]) >= 0) break;
  }

  measure();
  pos = target = start;
  render();
  setActive(start);

  // language switch: redraw the text this script builds
  I.onChange(function () {
    monthLabel.textContent = I.pick(data, 'month');
    cards.forEach(function (card, k) {
      var g = games[k];
      card.querySelector('.card-day').innerHTML = dayBadge(g);
      card.querySelector('img').alt = I.isAr() ? I.t('up.poster') + ' ' + g.title : g.title + ' ' + I.t('up.poster');
    });
    var keep = active;
    active = -1;
    setActive(keep);
  });

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { measure(); render(); }, 60);
  });

  requestAnimationFrame(function () { document.body.classList.add('is-ready'); });
})();
