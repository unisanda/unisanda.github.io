# ألعاب هذا الشهر — أكتوبر 2026

Static Arabic RTL game-release guide. Open `index.html` directly, or publish this directory at `/test/` on GitHub Pages. No build, server, API, environment variables, accounts, analytics or third-party runtime requests. All CSS, JavaScript and promotional artwork are local; asset paths are relative.

## Editorial scope
Six curated October 2026 releases, researched October 14, 2026. **Not exhaustive.** The reference date is intentionally fixed to the research snapshot, including countdown labels. Source dates are announced release dates, not guarantees of regional availability. Source links and platform/date caveats appear in each game's detail dialog; data and citations live in `games.js`.

- Star Wars: Galactic Racer — October 6: https://www.starwars.com/news/star-wars-galactic-racer-reveal-trailer
- Gears of War: E-Day — October 6 general release: https://www.xbox.com/en-US/games/gears-of-war-eday . Premium early access October 1: https://news.xbox.com/en-us/2026/10/01/gears-of-war-e-day-early-access-launch-trailer-xbox/
- Silver Pines — October 8: https://www.gematsu.com/2026/06/silver-pines-launches-october-8 ; https://store.steampowered.com/app/2333000/Silver_Pines/
- Castlevania: Belmont’s Curse — October 15: https://www.konami.com/games/castlevania/belmonts_curse/us/en-us/
- Tenebris Somnia — October 16: https://monstervine.com/2026/09/tenebris-somnia-price-launch-discount-october-16 ; https://www.gematsu.com/2026/06/tenebris-somnia-launches-october-16
- Phantom Blade Zero — October 29 (October 28 in the US/select regions): https://blog.playstation.com/2026/08/17/phantom-blade-zero-state-of-play-dives-deep-into-combat-and-the-wulin-world/ ; https://gamescomingout.com/games/phantom-blade-zero

Official KONAMI, Star Wars and PlayStation pages were read directly. Xbox and Gematsu blocked automated full-page requests; their indexed official announcements and specialized coverage/store listings were cross-checked. The general third-party calendar incorrectly groups Gears' early access as its release date; this page uses October 6 from Xbox instead. Boltgun 2 was excluded after contradictory October/November wording in one retrieved report.

## Design and interactions
Adapted the supplied TV-series frontend's charcoal/gold Arabic RTL vocabulary, selected-game cinematic display, background artwork, counter/progress, thumbnail selection, wrapping navigation, keyboard arrows and image swipe. Added search across title/Arabic summary, exact platform filters, chronological/name sorting, explicit empty/reset states and accessible native detail dialogs. ArrowRight advances and ArrowLeft returns, matching original requested behavior. Inputs and open dialogs do not trigger background navigation. Motion respects the OS setting. No unrelated Telegram subscription link retained.

## Artwork provenance
Promotional artwork remains copyrighted by its respective owners; no ownership or free-license claim. Local copies support reliable static display. Verify reuse rights for your intended publication.

- `assets/starwars.jpg`: https://lumiere-a.akamaihd.net/v1/images/star-wars-galactic-racer-reveal-preorder-feature_d3645d37.jpeg?region=0%2C0%2C1600%2C900 (StarWars.com article)
- `assets/castlevania.jpg`: https://www.konami.com/games/castlevania/belmonts_curse/s/images/sns_castlevania_bc2.jpg?v=37 (official site social artwork)
- `assets/phantom.png`: https://blog.playstation.com/tachyon/2026/08/73753f4b9c4fae867024267f70e4a7ba40c055b4.png
- `assets/gears.jpg`: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3010850/header.jpg
- `assets/silver.jpg`: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2333000/header.jpg
- `assets/tenebris.jpg`: https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2121510/header.jpg

## Maintenance
Edit `games.js` to update titles, dates, platforms and sources together, then update the snapshot date in `app.js` and visible review copy in `index.html`. `catalog.js` contains pure search/filter/sort/date behavior. Development tests, extraction, source captures and screenshots are outside the repository in the agent scratch directory; this folder contains only publishable site files.
