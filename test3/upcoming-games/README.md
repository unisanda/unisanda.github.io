# Upcoming games of this month

The monthly releases page, styled after Unisanda's monthly posts, opened from "Upcoming games of this month" on the links page. (The earlier 3D poster-ring version is kept as an archive at `/test3/upcoming-games-2/`.)

- Top: the round month artwork (`hero-2026-11.webp`, cut out of the November post with a transparent background).
- Below: one framed poster per game in date order (1st → end of month, same-day games by name). The date sits above each card, platform icons below. Badges on the poster: Arabic support (green ع = supported, red ع = not), single/multiplayer, a fire on the most anticipated games, and a DLC tag. Cards tilt slightly under the mouse; nothing scrolls on its own.
- English/Arabic and the background switch work as on the other pages.

To make a new month, replace `hero` and the `games` list in `games.js` and add posters to `posters/` (2:3 works best).

Posters: Steam library art for most games. Brotato: Primal Dread (a DLC with no portrait art on Steam), Kick (not found on Steam) and Grand Theft Auto VI are cropped from the November post.

Release dates follow Steam where the game is listed there (checked 23 November 2026): Wilderdark moved from 3 to 10 November, and UnderMire was removed because Steam now lists it for December 2026.

## Top Steam games (live)

The page also loads `steam.json`, refreshed every hour by the "Update game feeds" GitHub Action (`scripts/update-feeds.mjs`): this month's 6 best-selling released and 6 most-wishlisted upcoming Steam games. For each one the script reads Arabic support and single/multiplayer/co-op from Steam, and checks whether the same game is also on PlayStation, Xbox and Switch through the public PlayStation Store, Microsoft Store and Nintendo (Europe) searches. A console is only marked when the store has a game with the same name (store labels like "Console" or "Deluxe Edition" are allowed). The top 3 sellers and top 2 wishlisted get the fire badge.

Games in `games.js` win over the same game from Steam, so hand-set badges stay. Everything is shown in date order. When the month changes, the page switches to the new month; until a round artwork for it is added to `games.js`, the month name is shown as a heading instead.

SteamDB was tried but blocks automated requests with a browser check, so Steam's own store API is used.

## Game Pass

A small Xbox-green square joins the badges when a game is on Game Pass. The feed script loads Microsoft's public Game Pass lists (`catalog.gamepass.com`: PC, console, all games and "coming to Game Pass") and marks a game when one of its Microsoft Store products with the same name is in them. This is checked for the Steam games and for the hand-picked games in `games.js`; add `gamePass: true` or `false` to a hand-picked game to override it. Day-one games only show once Microsoft adds them to one of these lists.
