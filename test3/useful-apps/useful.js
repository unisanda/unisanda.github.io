(function () {
  'use strict';

  var data = window.USEFUL_APPS || { sections: [] };
  var host = document.getElementById('sections');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var I = window.UniI18n || {
    t: function (k) { return k; }, isAr: function () { return false; },
    pick: function (o, f) { return o[f]; }, onChange: function () {},
    count: function (n, w) { return n + ' ' + w + 's'; }
  };
  var refreshers = [];
  var VISIBLE = 3;   // apps shown per group before the "+" tile

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

  // two-letter badge: "7-Zip" -> 7Z, "Process Lasso" -> PL, "Everything" -> Ev
  function initials(name) {
    var words = name.replace(/\(.*?\)/g, '').split(/[\s\-]+/).filter(function (w) { return /[a-z0-9]/i.test(w); });
    if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
    var w = words[0] || name;
    return w[0].toUpperCase() + (w[1] || '').toLowerCase();
  }

  function domain(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url; }
  }

  // stable "hand-drawn" lean for each card
  function rand(seed) {
    var x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  var allApps = [];

  data.sections.forEach(function (section) {
    var total = section.groups.reduce(function (n, g) { return n + g.apps.length; }, 0);

    var sec = el('section', 'apps-section');
    sec.setAttribute('aria-labelledby', 'sec-' + section.id);

    var head = el('div', 'sec-head');
    head.innerHTML =
      '<span class="sec-badge" aria-hidden="true"><svg><use href="#' + section.icon + '"/></svg></span>' +
      '<div><h2 class="sec-title" id="sec-' + section.id + '"></h2>' +
      '<p class="sec-sub"></p></div>';
    sec.appendChild(head);

    // search + category chips
    var bar = el('div', 'toolbar');
    var search = el('label', 'search');
    search.innerHTML = '<svg aria-hidden="true"><use href="#i-search"/></svg>' +
      '<input type="search" autocomplete="off" spellcheck="false">';
    var chips = el('div', 'chips');
    chips.setAttribute('role', 'group');
    var chipAll = el('button', 'chip is-active');
    chipAll.type = 'button';
    chipAll.dataset.group = '';
    chipAll.setAttribute('aria-pressed', 'true');
    chips.appendChild(chipAll);
    section.groups.forEach(function (g) {
      var c = el('button', 'chip', '<span class="chip-dot" aria-hidden="true"></span><span class="chip-text"></span>');
      c.type = 'button';
      c.dataset.group = g.id;
      c.style.setProperty('--c', g.color);
      c.setAttribute('aria-pressed', 'false');
      chips.appendChild(c);
    });
    bar.appendChild(search);
    bar.appendChild(chips);
    sec.appendChild(bar);

    var groupsWrap = el('div', 'groups');
    var groupEls = [];
    var seed = 1;

    section.groups.forEach(function (g) {
      var gs = el('section', 'group');
      gs.dataset.group = g.id;
      gs.style.setProperty('--c', g.color);
      gs.setAttribute('aria-labelledby', 'grp-' + g.id);
      gs.innerHTML = '<h3 class="group-title" id="grp-' + g.id + '"><span class="group-dot" aria-hidden="true"></span>' +
        '<span class="group-name"></span> <span class="group-count">' + g.apps.length + '</span></h3>';
      var grid = el('div', 'app-grid');

      g.apps.forEach(function (a, k) {
        var item = el('a', 'app');
        item.href = a.url;
        item.target = '_blank';
        item.rel = 'noopener';
        var s = seed++;
        item.style.setProperty('--lean', ((rand(s) - 0.5) * 4.4).toFixed(2) + 'deg');
        item.style.setProperty('--skew', ((rand(s + 50) - 0.5) * 4).toFixed(2) + 'deg');
        item.style.setProperty('--turn', ((rand(s + 99) - 0.5) * 14).toFixed(2) + 'deg');
        item.style.setProperty('--sway', (5 + rand(s + 7) * 4).toFixed(2) + 's');
        item.style.setProperty('--sway-delay', (-rand(s + 3) * 6).toFixed(2) + 's');
        item.style.setProperty('--in-delay', (Math.min(k, 8) * 45) + 'ms');
        item.innerHTML =
          '<span class="app-card">' +
            '<span class="app-light" aria-hidden="true"></span>' +
            '<span class="app-top">' +
              '<span class="app-mono" aria-hidden="true">' + esc(initials(a.name)) + '</span>' +
              '<svg class="app-ext" aria-hidden="true"><use href="#i-ext"/></svg>' +
            '</span>' +
            '<span class="app-name">' + esc(a.name) + '</span>' +
            '<span class="app-domain">' + esc(domain(a.url)) + '</span>' +
          '</span>' +
          '<span class="app-desc"></span>';
        grid.appendChild(item);
        allApps.push({ el: item, app: a, group: g.id, text: (a.name + ' ' + a.desc + ' ' + (a.desc_ar || '')).toLowerCase() });
      });

      // "+" tile: the first VISIBLE apps show, the rest open from here
      var more = el('button', 'app-more',
        '<span class="more-card"><span class="more-plus" aria-hidden="true"></span><span class="more-text"></span></span>');
      more.type = 'button';
      more.setAttribute('aria-controls', 'grp-' + g.id + '-grid');
      grid.id = 'grp-' + g.id + '-grid';
      more.addEventListener('click', function () {
        gs._open = !gs._open;
        apply();
        if (!gs._open && gs.getBoundingClientRect().top < 0) {
          gs.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
        }
      });
      grid.appendChild(more);
      gs._more = more;
      gs._open = false;

      gs.appendChild(grid);
      groupsWrap.appendChild(gs);
      groupEls.push(gs);
    });

    var empty = el('p', 'empty');
    empty.hidden = true;
    groupsWrap.appendChild(empty);
    sec.appendChild(groupsWrap);
    host.appendChild(sec);

    /* ---------- filtering ---------- */

    var input = search.querySelector('input');
    var activeGroup = '';

    function apply() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      groupEls.forEach(function (gs) {
        var gid = gs.dataset.group;
        var inGroup = 0;
        // while searching every match shows; otherwise only the first few
        var fold = !q && !gs._open;
        gs.querySelectorAll('.app').forEach(function (item) {
          var rec = allApps.find(function (r) { return r.el === item; });
          var ok = (!activeGroup || activeGroup === gid) && (!q || rec.text.indexOf(q) !== -1);
          if (ok) inGroup++;
          item.hidden = !ok || (fold && inGroup > VISIBLE);
        });
        var extra = inGroup - VISIBLE;
        gs._more.hidden = !!q || extra <= 0;
        gs._more.classList.toggle('is-open', !!gs._open);
        gs._more.setAttribute('aria-expanded', gs._open ? 'true' : 'false');
        gs._extra = extra;
        moreText(gs);
        gs.hidden = inGroup === 0;
        shown += inGroup;
      });
      lastShown = shown;
      subText();
      empty.hidden = shown !== 0;
    }

    function moreText(gs) {
      var t = gs._more.querySelector('.more-text');
      // \u2066…\u2069 keeps "+7" reading left to right inside Arabic text
      t.textContent = gs._open ? I.t('apps.less') : '\u2066+' + gs._extra + '\u2069 ' + I.t('apps.more');
      gs._more.setAttribute('aria-label', gs._open ? I.t('apps.less') : I.t('apps.more') + ' (' + gs._extra + ')');
    }

    var lastShown = total;
    var subEl = head.querySelector('.sec-sub');
    function subText() {
      subEl.textContent = I.count(lastShown, 'app') + (I.isAr() ? ' في ' : ' in ') + I.count(section.groups.length, 'group');
    }

    // everything in this section that changes with the language
    function texts() {
      head.querySelector('.sec-title').textContent = I.pick(section, 'title');
      subText();
      input.placeholder = I.t('apps.search');
      input.setAttribute('aria-label', I.t('apps.search'));
      chips.setAttribute('aria-label', I.t('apps.filter'));
      chipAll.textContent = I.t('apps.all');
      section.groups.forEach(function (g, k) {
        chips.querySelector('.chip[data-group="' + g.id + '"] .chip-text').textContent = I.pick(g, 'title');
        groupEls[k].querySelector('.group-name').textContent = I.pick(g, 'title');
      });
      allApps.forEach(function (rec) {
        rec.el.querySelector('.app-desc').textContent = I.pick(rec.app, 'desc');
      });
      empty.textContent = I.t('apps.empty');
      groupEls.forEach(function (gs) { if (gs._extra != null) moreText(gs); });
    }
    texts();
    apply();          // fold each group to its first few apps
    refreshers.push(texts);

    input.addEventListener('input', apply);
    chips.addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (!c) return;
      activeGroup = c.dataset.group;
      chips.querySelectorAll('.chip').forEach(function (b) {
        var on = b === c;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      apply();
    });
  });

  I.onChange(function () { refreshers.forEach(function (fn) { fn(); }); });

  /* ---------- cards follow the mouse ---------- */

  var MAX_TILT = 10;
  allApps.forEach(function (rec) {
    var item = rec.el;
    var card = item.firstChild;
    item.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
      var r = card.getBoundingClientRect();
      var x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
      var y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1);
      card.style.setProperty('--ty', ((x - 0.5) * 2 * MAX_TILT).toFixed(2) + 'deg');
      card.style.setProperty('--tx', ((0.5 - y) * 2 * MAX_TILT).toFixed(2) + 'deg');
      card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      item.classList.add('is-hover');
    });
    item.addEventListener('pointerleave', function () {
      card.style.setProperty('--tx', '0deg');
      card.style.setProperty('--ty', '0deg');
      item.classList.remove('is-hover');
    });
  });

  /* ---------- cards settle in as they scroll into view ---------- */

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    allApps.forEach(function (rec) { io.observe(rec.el); });
  } else {
    allApps.forEach(function (rec) { rec.el.classList.add('is-in'); });
  }
})();
