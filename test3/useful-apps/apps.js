/*
  Useful apps — edit this list to add or remove apps.

  section  a platform block (only PC for now)
  groups   categories inside the section; `color` tints its cards
  apps     name, one short line, and the official link

  Links point at each project's own site, GitHub page or store listing
  (checked 21 Nov 2026). Left out for now: WinGrep (only an old,
  unmaintained site), Your Uninstaller (no official site found),
  Rift Launcher (several products share the name) and "Popup"
  (not enough to identify it).
*/
window.USEFUL_APPS = {
  sections: [
    {
      id: 'pc',
      title: 'PC Apps',
      title_ar: 'برامج الكمبيوتر',
      icon: 'p-pc',
      groups: [
        {
          id: 'files',
          title: 'Search & files',
          title_ar: 'البحث والملفات',
          color: '#5cc8ff',
          apps: [
            { name: 'Everything', desc: 'Finds any file or folder on Windows instantly.', desc_ar: 'يبحث عن الملفات والمجلدات في ويندوز بسرعة كبيرة.', url: 'https://www.voidtools.com/' },
            { name: 'WizTree', desc: 'Shows what is filling your drive so big files are easy to find.', desc_ar: 'يعرض الملفات والمجلدات التي تستهلك مساحة القرص لتسهيل العثور على الملفات الكبيرة.', url: 'https://diskanalyzer.com/' },
            { name: 'AnyTXT', desc: 'Searches inside documents and text files, not just file names.', desc_ar: 'يبحث داخل محتوى المستندات والملفات النصية، وليس أسماء الملفات فقط.', url: 'https://anytxt.net/' },
            { name: 'Listary', desc: 'Quick search and launcher for files and apps.', desc_ar: 'أداة بحث وتشغيل سريع للملفات والبرامج.', url: 'https://www.listary.com/' },
            { name: 'File Pilot', desc: 'A fast, modern file manager for Windows.', desc_ar: 'مدير ملفات سريع وحديث لويندوز.', url: 'https://filepilot.tech/' },
            { name: 'QuickLook', desc: 'Preview any file by pressing Space, without opening it.', desc_ar: 'يعرض معاينة سريعة للملفات بالضغط على زر المسافة، من دون فتحها.', url: 'https://github.com/QL-Win/QuickLook' },
            { name: 'FreeFileSync', desc: 'Syncs folders and makes file backups.', desc_ar: 'يزامن المجلدات وينشئ نسخًا احتياطية من الملفات.', url: 'https://freefilesync.org/' },
            { name: 'TeraCopy', desc: 'Faster copying and moving, with checks that files arrived intact.', desc_ar: 'ينسخ الملفات وينقلها بسرعة، ويتحقق من سلامتها بعد النقل.', url: 'https://www.codesector.com/teracopy' },
            { name: 'Copy Handler', desc: 'Copy and move files with pause and resume.', desc_ar: 'يدير نسخ الملفات ونقلها، ويتيح إيقافها مؤقتًا واستئنافها.', url: 'https://www.copyhandler.com/' },
            { name: '7-Zip', desc: 'Zips and unzips files in ZIP, 7z and many other formats.', desc_ar: 'يضغط الملفات ويفك ضغطها بصيغ متعددة مثل ZIP و7z.', url: 'https://www.7-zip.org/' }
          ]
        },
        {
          id: 'downloads',
          title: 'Downloads & sharing',
          title_ar: 'التنزيل والمشاركة',
          color: '#7ee08a',
          apps: [
            { name: 'Neat Download Manager', desc: 'Download manager that resumes downloads and hooks into your browser.', desc_ar: 'مدير تنزيلات يستكمل التنزيلات ويندمج مع المتصفح.', url: 'https://www.neatdownloadmanager.com/' },
            { name: 'Free Download Manager', desc: 'Manages and resumes downloads, including torrents.', desc_ar: 'يدير التنزيلات ويستأنفها، ويدعم ملفات التورنت.', url: 'https://www.freedownloadmanager.org/' },
            { name: 'AB Download Manager', desc: 'Free, open-source download manager.', desc_ar: 'مدير تنزيلات مجاني ومفتوح المصدر.', url: 'https://abdownloadmanager.com/' },
            { name: 'LocalSend', desc: 'Sends files between your devices over Wi-Fi, no cloud needed.', desc_ar: 'يرسل الملفات بين أجهزتك عبر الشبكة المحلية من دون خدمة سحابية.', url: 'https://localsend.org/' },
            { name: 'qBittorrent', desc: 'Open-source torrent client.', desc_ar: 'برنامج مفتوح المصدر لتنزيل ملفات التورنت وإدارتها.', url: 'https://www.qbittorrent.org/' },
            { name: 'Ninite', desc: 'Installs and updates popular Windows apps in one go.', desc_ar: 'يثبّت برامج ويندوز الشائعة ويحدّثها من مكان واحد.', url: 'https://ninite.com/' }
          ]
        },
        {
          id: 'windows',
          title: 'Windows tweaks & monitoring',
          title_ar: 'تخصيص ويندوز ومراقبة الجهاز',
          color: '#b49bff',
          apps: [
            { name: 'Microsoft PC Manager', desc: 'Microsoft tool to clean up files and manage startup apps.', desc_ar: 'أداة من مايكروسوفت لتنظيف الملفات وإدارة برامج بدء التشغيل.', url: 'https://pcmanager.microsoft.com/' },
            { name: 'PowerToys', desc: 'Free Microsoft add-ons for windows, files, search and more.', desc_ar: 'أدوات مجانية من مايكروسوفت للنوافذ والملفات والبحث وغيرها.', url: 'https://learn.microsoft.com/windows/powertoys/' },
            { name: 'Windhawk', desc: 'Mods that change how Windows looks and behaves.', desc_ar: 'تعديلات تغيّر مظهر ويندوز وبعض سلوكياته.', url: 'https://windhawk.net/' },
            { name: 'TranslucentTB', desc: 'Makes the taskbar transparent or blurred.', desc_ar: 'يجعل شريط المهام شفافًا أو ضبابيًا.', url: 'https://github.com/TranslucentTB/TranslucentTB' },
            { name: 'Twinkle Tray', desc: 'Brightness control for all your monitors, including external ones.', desc_ar: 'يتحكم في سطوع جميع شاشاتك، بما فيها الخارجية.', url: 'https://twinkletray.com/' },
            { name: 'Monitorian', desc: 'Adjust the brightness of supported monitors from Windows.', desc_ar: 'يضبط سطوع الشاشات المتوافقة من ويندوز.', url: 'https://github.com/emoacht/Monitorian' },
            { name: 'EarTrumpet', desc: 'Separate volume control for every app.', desc_ar: 'تحكم منفصل بمستوى صوت كل تطبيق.', url: 'https://eartrumpet.app/' },
            { name: 'AutoHideMouseCursor', desc: 'Hides the mouse pointer after it sits still for a while.', desc_ar: 'يخفي مؤشر الفأرة بعد توقفه عن الحركة لفترة.', url: 'https://www.softwareok.com/?seite=Microsoft/AutoHideMouseCursor' },
            { name: 'Mem Reduct', desc: 'Shows memory use and frees some of it up.', desc_ar: 'يعرض استخدام الذاكرة ويحرر جزءًا منها.', url: 'https://github.com/henrypp/memreduct' },
            { name: 'CPUSetSetter', desc: 'Choose which CPU cores a game or app can use.', desc_ar: 'يحدد أنوية المعالج التي تستخدمها لعبة أو تطبيق معين.', url: 'https://github.com/SimonvBez/CPUSetSetter' },
            { name: 'Process Lasso', desc: 'Manages process priority and CPU use to keep apps responsive.', desc_ar: 'يدير أولوية العمليات واستخدام المعالج لتبقى التطبيقات سلسة.', url: 'https://bitsum.com/' },
            { name: 'SeaTools', desc: "Seagate's health check for hard drives and SSDs.", desc_ar: 'أداة من Seagate لفحص صحة الأقراص الصلبة وSSD.', url: 'https://www.seagate.com/support/downloads/seatools/' }
          ]
        },
        {
          id: 'capture',
          title: 'Capture, audio & shortcuts',
          title_ar: 'التصوير والصوت والاختصارات',
          color: '#ff8fc4',
          apps: [
            { name: 'Snagit', desc: 'Screenshots and screen recording with editing tools.', desc_ar: 'يلتقط صور الشاشة ويسجلها، مع أدوات للتعليق والتحرير.', url: 'https://www.techsmith.com/snagit/' },
            { name: 'ShareX', desc: 'Free, open-source screenshots, recording and uploads.', desc_ar: 'أداة مجانية ومفتوحة المصدر لالتقاط الشاشة وتسجيلها ورفع الملفات.', url: 'https://getsharex.com/' },
            { name: 'Lightshot', desc: 'Grab part of the screen and mark it up.', desc_ar: 'يلتقط جزءًا من الشاشة ويتيح إضافة تعليقات عليه.', url: 'https://app.prntscr.com/' },
            { name: 'Flameshot', desc: 'Screenshot, draw on it and blur parts out.', desc_ar: 'يلتقط الشاشة ويتيح الرسم عليها وإخفاء أجزاء منها.', url: 'https://flameshot.org/' },
            { name: 'Copyfish', desc: 'Browser extension that copies text out of images and videos.', desc_ar: 'إضافة متصفح تستخرج النص من الصور والفيديو.', url: 'https://ocr.space/copyfish' },
            { name: 'Voicemeeter Banana', desc: 'Virtual mixer to route mic, game and stream audio.', desc_ar: 'خلاط صوت افتراضي لتوجيه صوت الميكروفون والألعاب والبث.', url: 'https://vb-audio.com/Voicemeeter/banana.htm' },
            { name: 'AutoHotkey', desc: 'Make your own shortcuts and automations with simple scripts.', desc_ar: 'ينشئ اختصارات وأوامر آلية بنصوص برمجية بسيطة.', url: 'https://www.autohotkey.com/' }
          ]
        },
        {
          id: 'gaming',
          title: 'Gaming, streaming & remote',
          title_ar: 'الألعاب والبث والتحكم عن بُعد',
          color: '#ffb24d',
          apps: [
            { name: 'SteamDB extension', desc: 'Adds price history and stats to Steam store pages.', desc_ar: 'يضيف سجل الأسعار والإحصاءات إلى صفحات متجر Steam.', url: 'https://steamdb.info/extension/' },
            { name: 'Playnite', desc: 'One library for games from every store.', desc_ar: 'يجمع ألعابك من جميع المتاجر في مكتبة واحدة.', url: 'https://playnite.link/' },
            { name: 'Heroic Games Launcher', desc: 'Open-source launcher for Epic, GOG and Amazon games.', desc_ar: 'مشغّل مفتوح المصدر لألعاب Epic وGOG وAmazon.', url: 'https://heroicgameslauncher.com/' },
            { name: 'Parsec', desc: 'Play on or control another PC remotely with low lag.', desc_ar: 'يتيح اللعب على جهاز آخر أو التحكم به عن بُعد بتأخير منخفض.', url: 'https://parsec.app/' },
            { name: 'StarDesk', desc: 'Remote desktop and game streaming from your PC.', desc_ar: 'وصول عن بُعد إلى جهازك وبث الألعاب منه.', url: 'https://stardesk.net/' },
            { name: 'Medal', desc: 'Records gameplay clips and makes them easy to share.', desc_ar: 'يسجل مقاطع اللعب ويسهّل مشاركتها.', url: 'https://medal.tv/' },
            { name: 'LootBar', desc: 'Top-ups and services for some games. Check game and region before buying.', desc_ar: 'شحن وخدمات لبعض الألعاب. تأكد من اللعبة والمنطقة قبل الشراء.', url: 'https://lootbar.gg/' }
          ]
        },
        {
          id: 'browser',
          title: 'Browser & security',
          title_ar: 'المتصفح والحماية',
          color: '#ff6b6b',
          apps: [
            { name: 'NextDNS', desc: 'DNS that blocks ads, trackers and harmful sites.', desc_ar: 'خدمة DNS تحجب الإعلانات والمتتبعات والمواقع الضارة.', url: 'https://nextdns.io/' },
            { name: 'SponsorBlock', desc: 'Skips sponsor segments in YouTube videos.', desc_ar: 'يتخطى مقاطع الرعاية في فيديوهات YouTube.', url: 'https://sponsor.ajay.app/' },
            { name: 'Popup Blocker (strict)', desc: 'Browser extension that stops pop-ups before they open.', desc_ar: 'إضافة متصفح تحجب النوافذ المنبثقة قبل أن تُفتح.', url: 'https://chromewebstore.google.com/detail/popup-blocker-strict/aefkmifgmaafnojlojpnekbpbmjiiogg' },
            { name: 'The Marvellous Suspender', desc: 'Puts unused browser tabs to sleep to save memory.', desc_ar: 'يعلّق ألسنة المتصفح غير المستخدمة لتوفير الذاكرة.', url: 'https://github.com/gioxx/MarvellousSuspender' },
            { name: 'Brave', desc: 'Browser with built-in ad and tracker blocking.', desc_ar: 'متصفح يحجب الإعلانات والمتتبعات تلقائيًا.', url: 'https://brave.com/' },
            { name: 'Malwarebytes', desc: 'Scans for and removes malware.', desc_ar: 'يفحص الجهاز ويزيل البرمجيات الضارة.', url: 'https://www.malwarebytes.com/' },
            { name: 'Revo Uninstaller', desc: 'Removes apps and the leftovers they leave behind.', desc_ar: 'يزيل البرامج مع الملفات المتبقية بعد حذفها.', url: 'https://www.revouninstaller.com/' }
          ]
        },
        {
          id: 'other',
          title: 'Other tools',
          title_ar: 'أدوات أخرى',
          color: '#f2cf63',
          apps: [
            { name: 'Rufus', desc: 'Makes bootable USB drives, like a Windows installer.', desc_ar: 'ينشئ وحدات USB قابلة للإقلاع، مثل وحدة تثبيت ويندوز.', url: 'https://rufus.ie/' },
            { name: 'Format Factory', desc: 'Converts video, audio and images between formats.', desc_ar: 'يحوّل ملفات الفيديو والصوت والصور بين الصيغ.', url: 'https://www.pcfreetime.com/formatfactory/' }
          ]
        }
      ]
    }
  ]
};
