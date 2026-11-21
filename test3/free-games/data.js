/*
  Free games — one row per platform.

  Each game:
    title   name on the poster
    poster  image (600x900 works best)
    tag     free | plus | gamepass   (sets the badge colour)
    label   badge text
    note    small line under the title (optional)
    url     opened when the poster is clicked

  Checked on 21 Nov 2026:
  - PC: Steam lists all five as free to play.
  - PS Plus monthly games for November 2026 (claim 3–30 Nov): gg.deals,
    PlayStation LifeStyle and TheGamer list the same three games.
  - Xbox: Halo Infinite (multiplayer), Call of Duty: Warzone and
    Marvel Rivals are free to play. Game Pass: High On Life 2 joined
    Game Pass Premium on 18 Nov, Arkheron arrives day one on 27 Nov and
    Gravhounds joined on 2 Nov (both Game Preview), per Pure Xbox,
    Game Rant and Windows Report.
*/
window.FREE_GAMES = {
  month: 'November 2026',
  rows: [
    {
      id: 'pc',
      title: 'PC Games',
      icon: 'p-pc',
      sub: 'Free to play on Steam',
      direction: -1,
      games: [
        { title: 'ROB RUN', poster: 'posters/robrun.jpg', tag: 'free', label: 'Free to play', note: 'New · 4 Nov', url: 'https://store.steampowered.com/app/4262460/' },
        { title: 'Palia', poster: 'posters/palia.jpg', tag: 'free', label: 'Free to play', url: 'https://store.steampowered.com/app/2707930/' },
        { title: 'Heartopia', poster: 'posters/heartopia.jpg', tag: 'free', label: 'Free to play', url: 'https://store.steampowered.com/app/4025700/' },
        { title: 'AION 2', poster: 'posters/aion2.jpg', tag: 'free', label: 'Free to play', url: 'https://store.steampowered.com/app/3393110/' },
        { title: 'Marvel Rivals', poster: 'posters/marvel-rivals.jpg', tag: 'free', label: 'Free to play', url: 'https://store.steampowered.com/app/2767030/' }
      ]
    },
    {
      id: 'ps',
      title: 'PlayStation',
      icon: 'p-ps5',
      sub: 'PS Plus monthly · claim by 30 Nov',
      direction: 1,
      games: [
        { title: 'Dead Island 2', poster: 'posters/dead-island-2.jpg', tag: 'plus', label: 'PS Plus', note: 'PS5 · PS4', url: 'https://www.playstation.com/en-us/ps-plus/whats-new/' },
        { title: 'Tomb Raider IV–VI Remastered', poster: 'posters/tomb-raider-4-6.jpg', tag: 'plus', label: 'PS Plus', note: 'PS5 · PS4', url: 'https://www.playstation.com/en-us/ps-plus/whats-new/' },
        { title: 'Monster Train 2', poster: 'posters/monster-train-2.jpg', tag: 'plus', label: 'PS Plus', note: 'PS5', url: 'https://www.playstation.com/en-us/ps-plus/whats-new/' },
        { title: 'Marvel Rivals', poster: 'posters/marvel-rivals.jpg', tag: 'free', label: 'Free to play', note: 'PS5', url: 'https://www.marvelrivals.com/' },
        { title: 'Call of Duty: Warzone', poster: 'posters/warzone.jpg', tag: 'free', label: 'Free to play', note: 'PS5 · PS4', url: 'https://www.callofduty.com/warzone' }
      ]
    },
    {
      id: 'xbox',
      title: 'Xbox',
      icon: 'p-xbox',
      sub: 'Game Pass and free to play',
      direction: -1,
      games: [
        { title: 'Arkheron', poster: '../upcoming-games/posters/arkheron.jpg', tag: 'gamepass', label: 'Game Pass', note: 'Day one · 27 Nov', url: 'https://www.xbox.com/en-US/xbox-game-pass/games' },
        { title: 'High On Life 2', poster: 'posters/high-on-life-2.jpg', tag: 'gamepass', label: 'Game Pass', note: 'Premium · from 18 Nov', url: 'https://www.xbox.com/en-US/games/store/_/9NF6XPSBTTGB' },
        { title: 'Gravhounds', poster: 'posters/gravhounds.jpg', tag: 'gamepass', label: 'Game Pass', note: 'Game Preview', url: 'https://www.xbox.com/en-US/xbox-game-pass/games' },
        { title: 'Halo Infinite', poster: 'posters/halo-infinite.jpg', tag: 'free', label: 'Free to play', note: 'Multiplayer', url: 'https://www.xbox.com/en-US/games/halo-infinite' },
        { title: 'Call of Duty: Warzone', poster: 'posters/warzone.jpg', tag: 'free', label: 'Free to play', url: 'https://www.callofduty.com/warzone' },
        { title: 'Marvel Rivals', poster: 'posters/marvel-rivals.jpg', tag: 'free', label: 'Free to play', url: 'https://www.marvelrivals.com/' }
      ]
    }
  ]
};
