# Upcoming games — layout test 2

A second, static take on the monthly releases page, styled after Unisanda's monthly posts. It is not linked from the links page; open it at `/test3/upcoming-games-2/`.

- Top: the round month artwork (`hero-2026-11.webp`, cut out of the November post with a transparent background).
- Below: one framed poster per game in date order (1st → end of month, same-day games by name). The date sits above each card, platform icons below. Badges on the poster: Arabic support (green ع = supported, red ع = not), single/multiplayer, a fire on the most anticipated games, and a DLC tag. Cards tilt slightly under the mouse; nothing scrolls on its own.
- English/Arabic and the background switch work as on the other pages.

To make a new month, replace `hero` and the `games` list in `games.js` and add posters to `posters/` (2:3 works best).

Posters: Steam library art for most games. Brotato: Primal Dread (a DLC with no portrait art on Steam), Kick (not found on Steam) and Grand Theft Auto VI are cropped from the November post.
