/*
  English / Arabic switch shared by every page under test3/.

  - Text in the page is marked with data-i18n="key" (text) or
    data-i18n-attr="aria-label:key;title:key;placeholder:key" (attributes).
  - The choice is saved in localStorage ("uni-lang") and applied before
    first paint by the small script in each page's <head>.
  - Page scripts call UniI18n.onChange(fn) to redraw text they build
    themselves (dates, counts, posters, app descriptions).
*/
(function () {
  'use strict';

  var KEY = 'uni-lang';
  var root = document.documentElement;

  // key: [English, Arabic]
  var S = {
    'lang.label': ['Language', 'اللغة'],
    'lang.en': ['English', 'English'],
    'lang.ar': ['العربية', 'العربية'],
    'theme': ['Switch background colour', 'تبديل لون الخلفية'],
    'back': ['Links', 'الروابط'],
    'back.aria': ['Back to links', 'رجوع إلى الروابط'],

    /* links page */
    'home.doc': ['Unisanda — Links', 'Unisanda — الروابط'],
    'home.h1': ['Unisanda links', 'روابط Unisanda'],
    'tile.twitch.sub': ['Live streams · /unimohd', 'بث مباشر · \u2068/unimohd\u2069'],
    'tile.discord.sub': ['Join the server', 'انضم إلى السيرفر'],
    'tile.email': ['Email', 'البريد'],
    'tile.donate': ['Donate here', 'ادعمني'],
    'tile.donate.sub': ['Support the stream', 'ادعم البث'],
    'explore': ['Explore', 'استكشف'],
    'nav.upcoming': ['Upcoming games of this month', 'الألعاب القادمة هذا الشهر'],
    'nav.free': ['Free games', 'ألعاب مجانية'],
    'nav.apps': ['Useful apps', 'برامج مفيدة'],
    'nav.accounts': ['Accounts worth following', 'حسابات تستحق المتابعة'],
    'pill.new': ['New', 'جديد'],
    'pill.locked': ['Locked', 'مقفل'],
    'soon': ['Coming soon', 'قريبًا'],
    'footer': ['Made with love by Unisanda', 'صُنع بحب من Unisanda'],

    /* upcoming games */
    'up.doc': ['Upcoming Games — Unisanda', 'الألعاب القادمة — Unisanda'],
    'up.h1': ['Upcoming games', 'الألعاب القادمة'],
    'up.ring': ['Games releasing this month', 'ألعاب تصدر هذا الشهر'],
    'up.prev': ['Previous game', 'اللعبة السابقة'],
    'up.next': ['Next game', 'اللعبة التالية'],
    'up.platforms': ['Platforms', 'المنصات'],
    'up.note': ['Dates can shift by region. Posters belong to their publishers.', 'قد تختلف المواعيد حسب المنطقة. البوسترات ملك لناشريها.'],
    'up.poster': ['poster', 'بوستر'],
    'st.out': ['Out now', 'متوفرة الآن'],
    'st.today': ['Out today', 'تصدر اليوم'],
    'st.tomorrow': ['Tomorrow', 'غدًا'],

    /* upcoming games, layout test 2 */
    'up2.doc': ['Upcoming Games — Unisanda', 'الألعاب القادمة — Unisanda'],
    'up2.title': ['Games of', 'ألعاب شهر'],
    'up2.note': ['Dates can shift by region. Posters belong to their publishers.', 'قد تختلف المواعيد حسب المنطقة. البوسترات ملك لناشريها.'],
    'up2.arabic.yes': ['Arabic supported', 'تدعم العربية'],
    'up2.arabic.no': ['No Arabic', 'لا تدعم العربية'],
    'up2.single': ['Single player', 'لاعب واحد'],
    'up2.multi': ['Multiplayer', 'لعب جماعي'],
    'up2.coop': ['Co-op', 'تعاوني'],
    'up2.hot': ['Most anticipated', 'الأكثر ترقبًا'],
    'up2.gamepass': ['On Game Pass', 'متوفرة في Game Pass'],

    /* free games */
    'free.doc': ['Free Games — Unisanda', 'ألعاب مجانية — Unisanda'],
    'free.h1': ['Free games', 'ألعاب مجانية'],
    'free.note': ['Offers change often. Check the store before you download. Posters belong to their publishers.', 'العروض تتغير باستمرار، تأكد من المتجر قبل التحميل. البوسترات ملك لناشريها.'],
    'free.left': ['Scroll left', 'تمرير لليسار'],
    'live.title': ['Free for a limited time', 'مجانية لفترة محدودة'],
    'live.sub': ['Claim them before the timer runs out', 'احصل عليها قبل انتهاء الوقت'],
    'live.updated': ['Updated', 'آخر تحديث'],
    'live.keep': ['Free to keep', 'مجانية للأبد'],
    'live.timed': ['Free to play', 'مجانية للتجربة'],
    'live.free': ['Free', 'مجانًا'],
    'live.ends': ['Ends in', 'تنتهي بعد'],
    'live.until': ['Until', 'حتى'],
    'live.noend': ['No end date', 'بدون تاريخ انتهاء'],
    'live.soon': ['Ending soon', 'تنتهي قريبًا'],
    'live.empty': ['No limited-time free games right now. Check back soon.', 'لا توجد ألعاب مجانية مؤقتة حاليًا. ارجع لاحقًا.'],
    'live.waiting': ['Live deals will show up here once the feed is connected.', 'ستظهر العروض المباشرة هنا بعد ربط مصدر البيانات.'],
    'live.claim': ['Claim', 'احصل عليها'],
    'live.data': ['Data:', 'البيانات من'],
    'live.more': ['Show more', 'عرض المزيد'],
    'live.less': ['Show less', 'عرض أقل'],
    'free.right': ['Scroll right', 'تمرير لليمين'],

    /* accounts */
    'acc.doc': ['Accounts Worth Following — Unisanda', 'حسابات تستحق المتابعة — Unisanda'],
    'acc.kicker': ['Creators I recommend', 'حسابات أنصح بها'],
    'acc.h1': ['Accounts worth following', 'حسابات تستحق المتابعة'],
    'acc.follow': ['Follow on X', 'تابع على X'],
    'acc.followers': ['followers', 'متابع'],
    'acc.verified': ['Verified account', 'حساب موثّق'],
    'acc.avatar': ['Profile picture of', 'صورة حساب'],
    'acc.note': ['Profiles update automatically from X.', 'تتحدّث الحسابات تلقائيًا من X.'],
    'acc.empty': ['Accounts will show up here soon.', 'ستظهر الحسابات هنا قريبًا.'],
    'acc.tabs': ['Platform', 'المنصة'],
    'acc.note.tt': ['Profiles update automatically from TikTok.', 'تتحدّث الحسابات تلقائيًا من TikTok.'],
    'acc.posts': ['posts', 'منشور'],
    'acc.following': ['following', 'يتابع'],
    'acc.likes': ['likes', 'إعجاب'],
    'acc.ig.follow': ['Follow on Instagram', 'تابع على Instagram'],
    'acc.tt.follow': ['Follow on TikTok', 'تابع على TikTok'],
    'acc.ig.view': ['View profile', 'عرض الحساب'],

    /* useful apps */
    'apps.doc': ['Useful Apps — Unisanda', 'برامج مفيدة — Unisanda'],
    'apps.kicker': ['Hand-picked tools', 'أدوات مختارة'],
    'apps.h1': ['Useful apps', 'برامج مفيدة'],
    'apps.search': ['Search apps', 'ابحث عن برنامج'],
    'apps.all': ['All', 'الكل'],
    'apps.filter': ['Filter by category', 'تصفية حسب القسم'],
    'apps.empty': ['No apps match that search.', 'لا توجد برامج تطابق بحثك.'],
    'apps.more': ['more', 'المزيد'],
    'apps.less': ['Show less', 'عرض أقل'],
    'apps.note': ["Every link goes to the app's official site or project page. Always download from there.", 'كل رابط يأخذك إلى الموقع الرسمي للبرنامج أو صفحة مشروعه، فحمّل منه دائمًا.']
  };

  // Arabic noun forms for counts: [1, 2, 3–10, 11+]
  var NOUNS = {
    game: { en: ['game', 'games'], ar: ['لعبة واحدة', 'لعبتان', 'ألعاب', 'لعبة'] },
    app: { en: ['app', 'apps'], ar: ['برنامج واحد', 'برنامجان', 'برامج', 'برنامجًا'] },
    group: { en: ['group', 'groups'], ar: ['قسم واحد', 'قسمان', 'أقسام', 'قسمًا'] },
    day: { en: ['day', 'days'], ar: ['يوم واحد', 'يومين', 'أيام', 'يومًا'] },
    hour: { en: ['hour', 'hours'], ar: ['ساعة واحدة', 'ساعتين', 'ساعات', 'ساعة'] },
    minute: { en: ['minute', 'minutes'], ar: ['دقيقة واحدة', 'دقيقتين', 'دقائق', 'دقيقة'] }
  };

  var listeners = [];

  function lang() { return root.lang === 'ar' ? 'ar' : 'en'; }
  function isAr() { return lang() === 'ar'; }

  function t(key) {
    var e = S[key];
    if (!e) return key;
    return isAr() ? e[1] : e[0];
  }

  // "5 games" / "5 ألعاب", "2 days" / "يومين"
  function count(n, noun) {
    var f = NOUNS[noun];
    if (!f) return String(n);
    if (!isAr()) return n + ' ' + (n === 1 ? f.en[0] : f.en[1]);
    var m = n % 100;
    if (n === 1) return f.ar[0];
    if (n === 2) return f.ar[1];
    if (m >= 3 && m <= 10) return n + ' ' + f.ar[2];
    return n + ' ' + f.ar[3];
  }

  // pick obj.field or obj.field_ar
  function pick(obj, field) {
    if (isAr() && obj[field + '_ar'] != null) return obj[field + '_ar'];
    return obj[field];
  }

  var fmtCache = {};
  function fmtDate(date, opts) {
    var loc = isAr() ? 'ar-u-ca-gregory-nu-latn' : 'en-GB';
    var k = loc + JSON.stringify(opts);
    if (!fmtCache[k]) fmtCache[k] = new Intl.DateTimeFormat(loc, opts);
    return fmtCache[k].format(date);
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':');
        if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
  }

  /* ---------- the switch ---------- */

  var sw = document.createElement('div');
  sw.className = 'lang-switch';
  sw.setAttribute('role', 'group');
  sw.setAttribute('data-i18n-attr', 'aria-label:lang.label');
  sw.innerHTML =
    '<span class="lang-thumb" aria-hidden="true"></span>' +
    '<button type="button" data-lang="en" lang="en" aria-label="English">EN</button>' +
    '<button type="button" data-lang="ar" lang="ar" aria-label="العربية">ع</button>';

  function syncSwitch() {
    var l = lang();
    sw.dataset.active = l;
    sw.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.lang === l ? 'true' : 'false');
    });
  }

  sw.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) setLang(b.dataset.lang);
  });

  function setLang(l) {
    l = l === 'ar' ? 'ar' : 'en';
    if (l === lang() && sw.dataset.active === l) return;
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem(KEY, l); } catch (e) {}
    root.classList.add('lang-swap');
    apply();
    syncSwitch();
    listeners.forEach(function (fn) { fn(l); });
    setTimeout(function () { root.classList.remove('lang-swap'); }, 500);
  }

  function onChange(fn) { listeners.push(fn); }

  var theme = document.getElementById('themeToggle');
  if (theme && theme.parentNode) theme.parentNode.insertBefore(sw, theme);
  else document.body.appendChild(sw);

  apply();
  syncSwitch();

  window.UniI18n = { lang: lang, isAr: isAr, t: t, count: count, pick: pick, fmtDate: fmtDate, setLang: setLang, onChange: onChange, apply: apply };
})();
