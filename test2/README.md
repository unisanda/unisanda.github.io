# ألعاب أكتوبر 2026 — cinematic preview

Second, independent static website. Nothing in `../test` is changed. No build, API, CDN or server-side runtime required. Open `index.html` directly or serve the repository and visit `/test2/`.

The six-game release snapshot and six artwork files are byte-for-byte copies from `../test`, researched there on 2026-10-14. This is a curated snapshot, not an exhaustive release calendar or live availability service. Release dates may change. `games.js` preserves the original source links and regional/date notes. The blue button opens an official game page when available, otherwise the supplied release-detail source; it is not a subscription link.

Arabic RTL cinematic layout follows the user-supplied original site's screenshot: full-screen blurred artwork, portrait crop, gold month/counter, pill badges, title with side arrows, synopsis, blue details link, thumbnail strip and gold progress line. Local IBM Plex Sans Arabic font matches the original Arabic font family; see `assets/OFL-IBM-Plex-Sans-Arabic.txt`.

Controls: right arrow / right circular button = next game; left arrow / left circular button = previous; Home / End = first / last. Swipe left / right on the main game area to advance / go back. Thumbnail strip is independently horizontally scrollable. All controls are keyboard-focusable, the current thumbnail is marked with `aria-current`, and the game title is a polite live region. Reduced motion is respected. Very short screens scroll vertically rather than hiding content.

QA (real headless Chromium via Playwright): first-game rendering, all six thumbnails, next/previous and wraparound, keyboard, Home, swipe, source-link update, active thumbnail, no overflow; all six games at 320×700, 390×658, 768×1024, 1440×900 and 844×390; direct `file://` loading; no failed local requests or JavaScript/console errors. Mobile and desktop PNG previews were saved outside the repository in Hermes scratch. No commit, push or upload was made.
