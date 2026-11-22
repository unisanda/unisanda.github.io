/*
  Flowing wave lines inside each link tile.

  The lines drift slowly on their own. When the mouse moves over a tile,
  or a finger touches it, the lines near the pointer bulge and ripple
  out from it, then settle back once the pointer leaves.
  Colours come from --tile-line / --tile-line-hi in styles.css, so they
  follow the background switch.
*/
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var root = document.documentElement;
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  if (!tiles.length) return;

  var lineColor = '', hiColor = '';
  function readColors() {
    var cs = getComputedStyle(root);
    lineColor = cs.getPropertyValue('--tile-line').trim() || 'rgba(255,255,255,.15)';
    hiColor = cs.getPropertyValue('--tile-line-hi').trim() || 'rgba(255,255,255,.3)';
  }
  readColors();
  new MutationObserver(function () { readColors(); kick(); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var states = tiles.map(function (tile, k) {
    var c = document.createElement('canvas');
    c.className = 'tile-waves';
    c.setAttribute('aria-hidden', 'true');
    tile.insertBefore(c, tile.firstChild);
    var st = {
      tile: tile, canvas: c, ctx: c.getContext('2d'),
      w: 0, h: 0,
      seed: k * 1.7,
      px: 0.5, py: 0.5,      // pointer, 0..1 inside the tile
      energy: 0,             // 0 at rest, 1 while the pointer is on the tile
      target: 0,
      visible: true,
      dirty: true
    };
    tile._w = st;

    function point(e) {
      var r = tile.getBoundingClientRect();
      st.px = (e.clientX - r.left) / r.width;
      st.py = (e.clientY - r.top) / r.height;
    }
    tile.addEventListener('pointermove', function (e) { point(e); st.target = 1; kick(); });
    tile.addEventListener('pointerdown', function (e) { point(e); st.target = 1; kick(); });
    tile.addEventListener('pointerleave', function () { st.target = 0; kick(); });
    tile.addEventListener('pointerup', function (e) { if (e.pointerType !== 'mouse') { st.target = 0; kick(); } });
    tile.addEventListener('pointercancel', function () { st.target = 0; kick(); });
    return st;
  });

  function size(st) {
    var r = st.tile.getBoundingClientRect();
    st.w = r.width; st.h = r.height;
    st.canvas.width = Math.round(st.w * dpr);
    st.canvas.height = Math.round(st.h * dpr);
    st.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    st.dirty = true;
  }
  states.forEach(size);

  function draw(st, t) {
    var ctx = st.ctx, w = st.w, h = st.h;
    if (!w || !h) return;
    ctx.clearRect(0, 0, w, h);
    var gap = 14;
    var step = 8;
    var e = st.energy;
    var mx = st.px * w, my = st.py * h;
    var reach = Math.max(70, Math.min(w, h) * 0.6);
    ctx.lineWidth = 1.2;
    var row = 0;
    for (var y0 = -gap; y0 <= h + gap; y0 += gap, row++) {
      ctx.beginPath();
      for (var x = -step; x <= w + step; x += step) {
        // slow drift
        var y = y0
          + 4 * Math.sin(x * 0.018 + y0 * 0.05 + t * 0.55 + st.seed)
          + 2.5 * Math.sin(x * 0.041 - y0 * 0.03 - t * 0.8 + st.seed * 2);
        if (e > 0.001) {
          var dx = x - mx, dy = y0 - my;
          var d = Math.sqrt(dx * dx + dy * dy);
          var fall = Math.exp(-(d * d) / (reach * reach));
          // lines are pushed away from the pointer and ripple outwards
          var push = (dy >= 0 ? 1 : -1) * 16 * fall;
          var ripple = 7 * fall * Math.sin(d * 0.09 - t * 6);
          y += e * (push + ripple);
        }
        if (x === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = row % 4 === 0 ? hiColor : lineColor;
      ctx.stroke();
    }
  }

  var raf = 0;
  var last = performance.now();
  function frame(now) {
    raf = 0;
    var dt = Math.min(64, now - last) / 1000;
    last = now;
    var t = now / 1000;
    var busy = false;
    states.forEach(function (st) {
      if (!st.visible) return;
      var k = 1 - Math.pow(0.002, dt);         // smooth ease towards target
      st.energy += (st.target - st.energy) * k;
      if (Math.abs(st.target - st.energy) < 0.002) st.energy = st.target;
      draw(st, t);
      st.dirty = false;
      busy = true;
    });
    if (busy && !reduceMotion.matches && !document.hidden) raf = requestAnimationFrame(frame);
  }
  function kick() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target._w.visible = en.isIntersecting; });
      kick();
    });
    tiles.forEach(function (t) { io.observe(t); });
  }

  var timer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { states.forEach(size); kick(); }, 80);
  });
  document.addEventListener('visibilitychange', kick);

  kick();
})();
