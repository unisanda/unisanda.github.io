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
      icon: 'p-pc',
      groups: [
        {
          id: 'files',
          title: 'Search & files',
          color: '#5cc8ff',
          apps: [
            { name: 'Everything', desc: 'Finds any file or folder on Windows instantly.', url: 'https://www.voidtools.com/' },
            { name: 'WizTree', desc: 'Shows what is filling your drive so big files are easy to find.', url: 'https://diskanalyzer.com/' },
            { name: 'AnyTXT', desc: 'Searches inside documents and text files, not just file names.', url: 'https://anytxt.net/' },
            { name: 'Listary', desc: 'Quick search and launcher for files and apps.', url: 'https://www.listary.com/' },
            { name: 'File Pilot', desc: 'A fast, modern file manager for Windows.', url: 'https://filepilot.tech/' },
            { name: 'QuickLook', desc: 'Preview any file by pressing Space, without opening it.', url: 'https://github.com/QL-Win/QuickLook' },
            { name: 'FreeFileSync', desc: 'Syncs folders and makes file backups.', url: 'https://freefilesync.org/' },
            { name: 'TeraCopy', desc: 'Faster copying and moving, with checks that files arrived intact.', url: 'https://www.codesector.com/teracopy' },
            { name: 'Copy Handler', desc: 'Copy and move files with pause and resume.', url: 'https://www.copyhandler.com/' },
            { name: '7-Zip', desc: 'Zips and unzips files in ZIP, 7z and many other formats.', url: 'https://www.7-zip.org/' }
          ]
        },
        {
          id: 'downloads',
          title: 'Downloads & sharing',
          color: '#7ee08a',
          apps: [
            { name: 'Neat Download Manager', desc: 'Download manager that resumes downloads and hooks into your browser.', url: 'https://www.neatdownloadmanager.com/' },
            { name: 'Free Download Manager', desc: 'Manages and resumes downloads, including torrents.', url: 'https://www.freedownloadmanager.org/' },
            { name: 'AB Download Manager', desc: 'Free, open-source download manager.', url: 'https://abdownloadmanager.com/' },
            { name: 'LocalSend', desc: 'Sends files between your devices over Wi-Fi, no cloud needed.', url: 'https://localsend.org/' },
            { name: 'qBittorrent', desc: 'Open-source torrent client.', url: 'https://www.qbittorrent.org/' },
            { name: 'Ninite', desc: 'Installs and updates popular Windows apps in one go.', url: 'https://ninite.com/' }
          ]
        },
        {
          id: 'windows',
          title: 'Windows tweaks & monitoring',
          color: '#b49bff',
          apps: [
            { name: 'Microsoft PC Manager', desc: 'Microsoft tool to clean up files and manage startup apps.', url: 'https://pcmanager.microsoft.com/' },
            { name: 'PowerToys', desc: 'Free Microsoft add-ons for windows, files, search and more.', url: 'https://learn.microsoft.com/windows/powertoys/' },
            { name: 'Windhawk', desc: 'Mods that change how Windows looks and behaves.', url: 'https://windhawk.net/' },
            { name: 'TranslucentTB', desc: 'Makes the taskbar transparent or blurred.', url: 'https://github.com/TranslucentTB/TranslucentTB' },
            { name: 'Twinkle Tray', desc: 'Brightness control for all your monitors, including external ones.', url: 'https://twinkletray.com/' },
            { name: 'Monitorian', desc: 'Adjust the brightness of supported monitors from Windows.', url: 'https://github.com/emoacht/Monitorian' },
            { name: 'EarTrumpet', desc: 'Separate volume control for every app.', url: 'https://eartrumpet.app/' },
            { name: 'AutoHideMouseCursor', desc: 'Hides the mouse pointer after it sits still for a while.', url: 'https://www.softwareok.com/?seite=Microsoft/AutoHideMouseCursor' },
            { name: 'Mem Reduct', desc: 'Shows memory use and frees some of it up.', url: 'https://github.com/henrypp/memreduct' },
            { name: 'CPUSetSetter', desc: 'Choose which CPU cores a game or app can use.', url: 'https://github.com/SimonvBez/CPUSetSetter' },
            { name: 'Process Lasso', desc: 'Manages process priority and CPU use to keep apps responsive.', url: 'https://bitsum.com/' },
            { name: 'SeaTools', desc: "Seagate's health check for hard drives and SSDs.", url: 'https://www.seagate.com/support/downloads/seatools/' }
          ]
        },
        {
          id: 'capture',
          title: 'Capture, audio & shortcuts',
          color: '#ff8fc4',
          apps: [
            { name: 'Snagit', desc: 'Screenshots and screen recording with editing tools.', url: 'https://www.techsmith.com/snagit/' },
            { name: 'ShareX', desc: 'Free, open-source screenshots, recording and uploads.', url: 'https://getsharex.com/' },
            { name: 'Lightshot', desc: 'Grab part of the screen and mark it up.', url: 'https://app.prntscr.com/' },
            { name: 'Flameshot', desc: 'Screenshot, draw on it and blur parts out.', url: 'https://flameshot.org/' },
            { name: 'Copyfish', desc: 'Browser extension that copies text out of images and videos.', url: 'https://ocr.space/copyfish' },
            { name: 'Voicemeeter Banana', desc: 'Virtual mixer to route mic, game and stream audio.', url: 'https://vb-audio.com/Voicemeeter/banana.htm' },
            { name: 'AutoHotkey', desc: 'Make your own shortcuts and automations with simple scripts.', url: 'https://www.autohotkey.com/' }
          ]
        },
        {
          id: 'gaming',
          title: 'Gaming, streaming & remote',
          color: '#ffb24d',
          apps: [
            { name: 'SteamDB extension', desc: 'Adds price history and stats to Steam store pages.', url: 'https://steamdb.info/extension/' },
            { name: 'Playnite', desc: 'One library for games from every store.', url: 'https://playnite.link/' },
            { name: 'Heroic Games Launcher', desc: 'Open-source launcher for Epic, GOG and Amazon games.', url: 'https://heroicgameslauncher.com/' },
            { name: 'Parsec', desc: 'Play on or control another PC remotely with low lag.', url: 'https://parsec.app/' },
            { name: 'StarDesk', desc: 'Remote desktop and game streaming from your PC.', url: 'https://stardesk.net/' },
            { name: 'Medal', desc: 'Records gameplay clips and makes them easy to share.', url: 'https://medal.tv/' },
            { name: 'LootBar', desc: 'Top-ups and services for some games. Check game and region before buying.', url: 'https://lootbar.gg/' }
          ]
        },
        {
          id: 'browser',
          title: 'Browser & security',
          color: '#ff6b6b',
          apps: [
            { name: 'NextDNS', desc: 'DNS that blocks ads, trackers and harmful sites.', url: 'https://nextdns.io/' },
            { name: 'SponsorBlock', desc: 'Skips sponsor segments in YouTube videos.', url: 'https://sponsor.ajay.app/' },
            { name: 'Popup Blocker (strict)', desc: 'Browser extension that stops pop-ups before they open.', url: 'https://chromewebstore.google.com/detail/popup-blocker-strict/aefkmifgmaafnojlojpnekbpbmjiiogg' },
            { name: 'The Marvellous Suspender', desc: 'Puts unused browser tabs to sleep to save memory.', url: 'https://github.com/gioxx/MarvellousSuspender' },
            { name: 'Brave', desc: 'Browser with built-in ad and tracker blocking.', url: 'https://brave.com/' },
            { name: 'Malwarebytes', desc: 'Scans for and removes malware.', url: 'https://www.malwarebytes.com/' },
            { name: 'Revo Uninstaller', desc: 'Removes apps and the leftovers they leave behind.', url: 'https://www.revouninstaller.com/' }
          ]
        },
        {
          id: 'other',
          title: 'Other tools',
          color: '#f2cf63',
          apps: [
            { name: 'Rufus', desc: 'Makes bootable USB drives, like a Windows installer.', url: 'https://rufus.ie/' },
            { name: 'Format Factory', desc: 'Converts video, audio and images between formats.', url: 'https://www.pcfreetime.com/formatfactory/' }
          ]
        }
      ]
    }
  ]
};
