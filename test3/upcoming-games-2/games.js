/*
  Upcoming games — layout test 2 (static grid, like the social posts)

  month      YYYY-MM, used for the heading and the "NOV" labels
  hero       the round month artwork shown at the top
  games      one entry per game, any order (the page sorts by date):
    title      game name
    date       YYYY-MM-DD
    platforms  any of: switch, xbox, pc, ps, mac, android
    players    any of: single, multi, coop   (icons on the poster)
    arabic     true when the game supports Arabic (green "ع"), false = red
    hot        true for a fire badge on the most anticipated games
    dlc        true to add a "DLC" tag
    poster     image in ./posters (2:3 works best)
    url        store or official page (optional)

  The 12 games, dates, platforms and badges follow Unisanda's November
  2026 posts.
*/
window.UPCOMING2 = {
  month: '2026-11',
  hero: 'hero-2026-11.webp',
  games: [
    { title: 'Gravhounds', date: '2026-11-02', platforms: ['xbox', 'pc'], players: ['multi'], arabic: false, poster: 'posters/gravhounds.jpg', url: 'https://store.steampowered.com/app/2440760/' },
    { title: 'Wilderdark', date: '2026-11-03', platforms: ['pc'], players: ['single'], arabic: false, poster: 'posters/wilderdark.jpg', url: 'https://store.steampowered.com/app/2735850/' },
    { title: 'Brotato: Primal Dread', date: '2026-11-02', platforms: ['pc'], players: ['single'], arabic: false, dlc: true, poster: 'posters/brotato-primal-dread.jpg', url: 'https://store.steampowered.com/app/4498220/' },
    { title: 'Death at Fleming Manor', date: '2026-11-03', platforms: ['pc'], players: ['single'], arabic: false, poster: 'posters/death-at-fleming-manor.jpg', url: 'https://store.steampowered.com/app/3758950/' },
    { title: 'Kick', date: '2026-11-03', platforms: ['pc'], players: ['single'], arabic: false, poster: 'posters/kick.jpg' },
    { title: 'Godzilla: Destroy All Monsters Melee Remastered', date: '2026-11-03', platforms: ['switch', 'xbox', 'pc', 'ps'], players: ['single'], arabic: false, poster: 'posters/godzilla-dam-melee.jpg', url: 'https://store.steampowered.com/app/4251460/' },
    { title: "Tanuki: Pon's Summer", date: '2026-11-10', platforms: ['switch', 'xbox', 'pc', 'ps'], players: ['single'], arabic: false, poster: 'posters/tanuki.jpg', url: 'https://store.steampowered.com/app/3218570/' },
    { title: 'Warhammer Survivors', date: '2026-11-10', platforms: ['mac', 'switch', 'pc', 'xbox', 'ps', 'android'], players: ['single'], arabic: false, hot: true, poster: 'posters/warhammer-survivors.jpg', url: 'https://store.steampowered.com/app/3669620/' },
    { title: 'Barbie Rewind', date: '2026-11-12', platforms: ['switch', 'xbox', 'pc', 'ps'], players: ['single'], arabic: false, hot: true, poster: 'posters/barbie-rewind.jpg', url: 'https://store.steampowered.com/app/4082030/' },
    { title: 'Fat Goblins', date: '2026-11-12', platforms: ['pc'], players: ['single', 'multi'], arabic: false, poster: 'posters/fat-goblins.jpg', url: 'https://store.steampowered.com/app/2450350/' },
    { title: 'UnderMire', date: '2026-11-13', platforms: ['pc'], players: ['single'], arabic: true, hot: true, poster: 'posters/undermire.jpg', url: 'https://store.steampowered.com/app/3366370/' },
    { title: 'Grand Theft Auto VI', date: '2026-11-19', platforms: ['xbox', 'ps'], players: ['single'], arabic: false, hot: true, poster: 'posters/gta6.jpg', url: 'https://www.rockstargames.com/VI' }
  ]
};
