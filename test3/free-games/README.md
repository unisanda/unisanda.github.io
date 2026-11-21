# Free games — test page

Three shelves of posters, one per platform (PC, PlayStation, Xbox). Each shelf loops forever, drifts slowly on its own (the middle one the other way), and can be dragged, swiped, scrolled sideways on a trackpad or moved with its arrow buttons. Posters lean while the shelf moves fast and curve in at the edges of the screen. Hovering a poster tilts it towards the mouse; clicking opens its store page. A drag never counts as a click.

The background and colour switch come from `../styles.css` and `../app.js`.

## Changing the games

Edit `data.js`. Each shelf has a title, an icon, a subtitle and a list of games; each game has a title, a poster (600×900), a tag (`free`, `plus` or `gamepass`, which sets the badge colour), the badge text, an optional small note and a link.

## Sources (checked 21 November 2026)

- PC: Steam lists ROB RUN, Palia, Heartopia, AION 2 and Marvel Rivals as free to play.
- PlayStation Plus monthly games for November 2026, claimable 3–30 November: Dead Island 2, Tomb Raider IV–VI Remastered and Monster Train 2 (gg.deals, PlayStation LifeStyle, TheGamer).
- Xbox Game Pass: High On Life 2 joined Game Pass Premium on 18 November; Arkheron arrives day one on 27 November and Gravhounds joined on 2 November, both as Game Preview (Pure Xbox, Game Rant, Windows Report).
- Free to play on consoles: Marvel Rivals, Call of Duty: Warzone and Halo Infinite multiplayer.

## Posters

All artwork belongs to its publishers. Steam library art for Palia, Marvel Rivals, Dead Island 2, Tomb Raider IV–VI Remastered, Monster Train 2, Halo Infinite and Call of Duty: Warzone. ROB RUN, Heartopia, AION 2, High On Life 2 and Gravhounds have no portrait art at Steam's standard path, so their posters are cropped Steam screenshots. Arkheron reuses the poster from `../upcoming-games/posters/`.

## Free for a limited time (live)

The section at the top lists games that are free for a limited time: 100% off to keep, or free to play for a while. It reads `live.json`, which the "Update game feeds" GitHub Action (`.github/workflows/update-feeds.yml`, script `scripts/update-feeds.mjs`) refreshes every 3 hours from the FreeStuff API v2.

- Order is fixed: the offer ending soonest comes first. Each card shows the old price, a countdown and the exact end time in the visitor's time zone. Offers that end while the page is open disappear on their own.
- The FreeStuff REST endpoint (`GET /v2/products`) is part of FreeStuff's paid "full" tier; the free tier only offers webhooks. Add the API key as a repository secret named `FREESTUFF_API_KEY`. Until then the section says the feed is not connected yet.
