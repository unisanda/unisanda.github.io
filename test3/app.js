(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ----------------------------------------------------------
     Flowing wave lines (endless loop)
     ---------------------------------------------------------- */
  var canvas = document.getElementById('waves');
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1;
  var lineColor = '', lineHiColor = '';
  var rafId = 0;

  // Every term completes a whole number of cycles in LOOP seconds,
  // so the motion repeats seamlessly forever.
  var LOOP = 60;
  var TAU = Math.PI * 2;
  function speed(cycles) { return (TAU * cycles) / LOOP; }

  // Each line is a flat row pushed up/down by a smooth field. Because the
  // field also changes with the row position, neighbouring lines squeeze
  // together and spread apart like contour lines.
  var TERMS = [
    { amp: 58, kx: 0.0019, ky: 0.0058, w: speed(1),  ph: 0.0 },
    { amp: 30, kx: 0.0041, ky: -0.0086, w: -speed(2), ph: 1.7 },
    { amp: 15, kx: 0.0083, ky: 0.0040, w: speed(3),  ph: 4.1 },
    { amp: 22, kx: -0.0011, ky: 0.0031, w: speed(1), ph: 2.6 }
  ];

  function readColors() {
    var cs = getComputedStyle(root);
    lineColor = cs.getPropertyValue('--wave').trim() || 'rgba(0,0,0,.25)';
    lineHiColor = cs.getPropertyValue('--wave-hi').trim() || 'rgba(255,255,255,.06)';
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }

  function draw(now) {
    var t = now / 1000;
    var spacing = W < 700 ? 15 : 17;
    var step = W < 700 ? 14 : 18;
    var pad = 130;
    var scale = W < 700 ? 0.7 : 1; // gentler waves on small screens
    var n = TERMS.length;

    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.15;
    ctx.lineJoin = 'round';

    var row = 0;
    for (var y0 = -pad; y0 <= H + pad; y0 += spacing, row++) {
      ctx.beginPath();
      for (var x = -step; x <= W + step; x += step) {
        var y = y0;
        for (var i = 0; i < n; i++) {
          var k = TERMS[i];
          y += k.amp * scale * Math.sin(x * k.kx / scale + y0 * k.ky + k.w * t + k.ph);
        }
        if (x === -step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = row % 6 === 0 ? lineHiColor : lineColor;
      ctx.stroke();
    }
  }

  function frame(now) {
    draw(now);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(rafId);
    if (reduceMotion.matches || document.hidden) {
      draw(0);
    } else {
      rafId = requestAnimationFrame(frame);
    }
  }

  readColors();
  resize();
  start();

  var resizeTimer = 0;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 80);
  });
  document.addEventListener('visibilitychange', start);
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', start);

  /* ----------------------------------------------------------
     Background colour switch (maroon / paper)
     ---------------------------------------------------------- */
  var toggle = document.getElementById('themeToggle');
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(name) {
    root.dataset.theme = name;
    if (themeMeta) themeMeta.content = name === 'paper' ? '#f6efed' : '#5a2530';
    readColors();
    draw(performance.now());
  }

  toggle.addEventListener('click', function () {
    var next = root.dataset.theme === 'paper' ? 'maroon' : 'paper';
    applyTheme(next);
    try { localStorage.setItem('uni-theme', next); } catch (e) {}
  });
  applyTheme(root.dataset.theme === 'paper' ? 'paper' : 'maroon');

  /* ----------------------------------------------------------
     Tiles react to the mouse: tilt, light and icon parallax
     ---------------------------------------------------------- */
  var MAX_TILT = 7; // degrees

  Array.prototype.forEach.call(document.querySelectorAll('.tile'), function (tile) {
    var pending = null;
    var ticking = false;

    function update() {
      ticking = false;
      if (!pending) return;
      var r = tile.getBoundingClientRect();
      var x = Math.min(Math.max((pending.x - r.left) / r.width, 0), 1);
      var y = Math.min(Math.max((pending.y - r.top) / r.height, 0), 1);
      // wide tiles tilt less so the edge travel feels the same
      var widthFactor = Math.min(1, 260 / r.width);
      tile.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      tile.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      tile.style.setProperty('--px', (x * 2 - 1).toFixed(3));
      tile.style.setProperty('--py', (y * 2 - 1).toFixed(3));
      tile.style.setProperty('--ry', ((x - 0.5) * 2 * MAX_TILT * widthFactor).toFixed(2) + 'deg');
      tile.style.setProperty('--rx', ((0.5 - y) * 2 * MAX_TILT).toFixed(2) + 'deg');
    }

    tile.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' || reduceMotion.matches) return;
      pending = { x: e.clientX, y: e.clientY };
      tile.classList.add('is-tilting');
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    });

    function reset() {
      pending = null;
      tile.classList.remove('is-tilting');
      tile.style.setProperty('--px', '0');
      tile.style.setProperty('--py', '0');
      tile.style.setProperty('--rx', '0deg');
      tile.style.setProperty('--ry', '0deg');
    }
    tile.addEventListener('pointerleave', reset);
    tile.addEventListener('pointercancel', reset);
  });
})();
