# Upcoming games — test page

A 3D ring of game posters for the month's notable releases. Drag, swipe, use the arrow buttons or the keyboard arrows to turn it. The centre poster shows its release date and name above it and its platforms below it. Clicking the centre poster opens the game's page. The background and colour switch come from `../styles.css` and `../app.js`.

## Changing the month

Edit `games.js`: each game has a title, a `YYYY-MM-DD` date, its platforms (`ps5`, `xbox`, `switch2`, `switch`, `pc`), a poster in `posters/` (600×900), a glow colour and an optional link. The list is sorted by date, and the ring opens on the next game still to come out. The "In 3 days" / "Out now" label is worked out from the visitor's date.

## Sources (checked 16 November 2026)

- Release list: https://gamescomingout.com/games-coming-out-november-2026 and https://www.videogameschronicle.com/guide/upcoming-game-release-dates-schedule/
- PC dates and store pages: Steam store data for each app.
- Grand Theft Auto VI (19 Nov, PS5/Xbox), The Legend of Zelda: Ocarina of Time (5 Nov, Switch 2) and Sonic Pico Park (12 Nov): their English Wikipedia articles.
- Left out: Edge of Memories and Warhammer 40,000: Dawn of War IV. Some lists still show them in November, but Steam lists both for 3 December 2026.
- IGDB and releases.com block automated requests, so they were not used.

## Posters

All artwork belongs to its publishers. Local copies are used so the page works offline.

- Steam library art (600×900): ArcheAge Chronicles, Airframe Ultra, Tanuki: Pon's Summer, Arkheron, Metaphor: ReFantazio, Stellar Blade.
- Cropped from Steam screenshots (those games have no portrait art at the standard path): Void/Breaker, Warhammer Survivors, Sonic Pico Park.
- From the Wikipedia cover images, placed on a blurred copy of themselves to fill the 2:3 frame: Grand Theft Auto VI, The Legend of Zelda: Ocarina of Time. These are low resolution and look soft on large screens; swap them for official art when you can.

## Top Steam games (live)

On top of the hand-picked list in `games.js`, the page loads `steam.json`: the most popular Steam games releasing this month, refreshed every 3 hours by the "Update game feeds" GitHub Action (`scripts/update-feeds.mjs`) from Steam's public `IStoreQueryService/Query` endpoint (no key needed). It takes the 4 best-selling games already out this month and the 3 most-wishlisted games still to come, skips adult-only titles, and drops any game already in `games.js`. Everything is then shown in release-date order. When the month changes, the page switches to the new month automatically.
