#!/usr/bin/env node
/*
  Refreshes the live data used by the test pages. Run by
  .github/workflows/update-feeds.yml every few hours; also safe to run by hand:

    node scripts/update-feeds.mjs

  1. Steam  -> test3/upcoming-games/steam.json
     The most popular Steam games releasing this calendar month (UTC), from
     the public IStoreQueryService/Query endpoint (no key needed):
     - already out this month: ranked by Steam's top-sellers order
     - still to come this month: ranked by Steam's most-wishlisted order
     Adult-only titles are skipped. The page merges these with its own
     hand-picked list and sorts everything by release date.

  2. Free games -> test3/free-games/live.json
     PC games that are free to keep for a limited time, from:
     - GamerPower's public giveaways API (no key): PC and Epic Games Store
       giveaways of full games.
     - FreeStuff API v2, only if FREESTUFF_API_KEY is set (its REST API is
       part of FreeStuff's paid "full" tier).
     Duplicates are merged, ended offers are dropped, and the list is
     ordered: ending soonest first, then offers with no end date (newest
     first).

  3. X profiles -> test3/accounts/profiles.json
     Name, bio, profile picture, banner and follower count for each handle
     in test3/accounts/accounts.json, from FxTwitter's public API (no key).

  4. Upcoming games test 2 -> test3/upcoming-games-2/steam.json
     The 12 most popular Steam games releasing this month (6 best-selling
     already out, 6 most-wishlisted still to come). For each: Arabic
     support and player modes from Steam, and the consoles it is also on,
     checked by exact title in the public PlayStation Store, Microsoft
     Store and Nintendo (Europe) searches. No keys needed.

  A file is only rewritten when its content actually changes, so the scheduled
  run does not create a commit every time.
*/
import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const STEAM_FILE = new URL('test3/upcoming-games/steam.json', ROOT);
const FREE_FILE = new URL('test3/free-games/live.json', ROOT);
const ACCOUNTS_FILE = new URL('test3/accounts/accounts.json', ROOT);
const PROFILES_FILE = new URL('test3/accounts/profiles.json', ROOT);
const UP2_FILE = new URL('test3/upcoming-games-2/steam.json', ROOT);

const PICKS_RELEASED = 4;   // games already out this month
const PICKS_UPCOMING = 3;   // games still to come this month
const ADULT_DESCRIPTORS = new Set([3, 4]); // adult only sexual content, frequent nudity

const UA = 'unisanda-site-feeds/1.0 (+https://unisanda.com)';

async function readJson(url) {
  try { return JSON.parse(await readFile(url, 'utf8')); } catch { return null; }
}

async function writeIfChanged(url, data, keyFn) {
  const old = await readJson(url);
  if (old && JSON.stringify(keyFn(old)) === JSON.stringify(keyFn(data))) {
    console.log(`unchanged: ${url.pathname}`);
    return false;
  }
  await writeFile(url, JSON.stringify(data, null, 2) + '\n');
  console.log(`updated:   ${url.pathname}`);
  return true;
}

/* ------------------------------------------------------------------ */
/* Steam                                                               */
/* ------------------------------------------------------------------ */

const SORT_TOP_SELLERS = 12;  // undocumented enum values, checked against the store
const SORT_WISHLISTED = 23;

async function steamQuery(sort, filters, start, count) {
  const input = {
    query: {
      start, count, sort,
      filters: { ...filters, type_filters: { include_games: true } }
    },
    context: { language: 'english', country_code: 'US' },
    data_request: { include_basic_info: true, include_release: true, include_assets: true, include_platforms: true }
  };
  const url = 'https://api.steampowered.com/IStoreQueryService/Query/v1/?input_json=' + encodeURIComponent(JSON.stringify(input));
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Steam query failed: ${res.status}`);
  const body = await res.json();
  return body.response?.store_items ?? [];
}

function monthKey(date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function assetUrl(item, names) {
  const a = item.assets;
  if (!a?.asset_url_format) return null;
  for (const n of names) {
    if (a[n]) return 'https://shared.akamai.steamstatic.com/store_item_assets/' + a.asset_url_format.replace('${FILENAME}', a[n]);
  }
  return null;
}

async function pickSteam(sort, filters, month, pages, wanted) {
  const picks = [];
  for (let p = 0; p < pages && picks.length < wanted; p++) {
    const items = await steamQuery(sort, filters, p * 1000, 1000);
    for (const it of items) {
      const ts = it.release?.steam_release_date;
      if (!ts || !it.visible) continue;
      const d = new Date(ts * 1000);
      if (monthKey(d) !== month) continue;
      if ((it.content_descriptorids || []).some((c) => ADULT_DESCRIPTORS.has(c))) continue;
      const poster = assetUrl(it, ['library_capsule_2x', 'library_capsule']);
      if (!poster) continue;
      picks.push({
        appid: it.appid,
        title: it.name,
        date: d.toISOString().slice(0, 10),
        platforms: ['pc'],
        poster,
        url: `https://store.steampowered.com/app/${it.appid}/`
      });
      if (picks.length >= wanted) break;
    }
    if (items.length < 1000) break;
  }
  return picks;
}

async function updateSteam() {
  const month = monthKey(new Date());
  const released = await pickSteam(SORT_TOP_SELLERS, { released_only: true }, month, 3, PICKS_RELEASED);
  const upcoming = await pickSteam(SORT_WISHLISTED, { coming_soon_only: true }, month, 5, PICKS_UPCOMING);
  const seen = new Set();
  const games = [...released, ...upcoming]
    .filter((g) => !seen.has(g.appid) && seen.add(g.appid))
    .map((g, rank) => ({ ...g, rank: rank + 1 }));
  const data = {
    source: 'Steam store (IStoreQueryService/Query)',
    month,
    updated: new Date().toISOString(),
    games
  };
  await writeIfChanged(STEAM_FILE, data, (d) => [d.month, d.games]);
}

/* ------------------------------------------------------------------ */
/* FreeStuff                                                           */
/* ------------------------------------------------------------------ */

const FS_API = 'https://api.freestuffbot.xyz/v2';
const FS_COMPAT = '2026-11-15';
const FLAG_TRASH = 1 << 0;
const FLAG_PERMANENT = 1 << 2;
const FLAG_FIRSTPARTY_EXCLUSIVE = 1 << 4;
const IMG_AR_WIDE = 1 << 1;
const IMG_AR_TALL = 1 << 3;
const IMG_WATERMARK = 1 << 8;
const IMG_TAGS = 1 << 9;
const URL_OPENS_IN_BROWSER = 1 << 3;

async function freestuff(path, key) {
  const res = await fetch(FS_API + path, {
    headers: { Authorization: `Bearer ${key}`, 'X-Compatibility-Date': FS_COMPAT, 'User-Agent': UA }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`FreeStuff ${path} failed: ${res.status} ${text.slice(0, 200)}`);
  }
  return res.json();
}

function bestImage(images = []) {
  const clean = images.filter((i) => !(i.flags & (IMG_WATERMARK | IMG_TAGS)));
  const pool = clean.length ? clean : images;
  const byPrio = (a, b) => (b.priority || 0) - (a.priority || 0);
  const tall = pool.filter((i) => i.flags & IMG_AR_TALL).sort(byPrio)[0];
  const wide = pool.filter((i) => i.flags & IMG_AR_WIDE).sort(byPrio)[0];
  return { tall: tall?.url || null, wide: wide?.url || pool.slice().sort(byPrio)[0]?.url || null };
}

function bestUrl(urls = []) {
  const byPrio = (a, b) => (b.priority || 0) - (a.priority || 0);
  const web = urls.filter((u) => u.flags & URL_OPENS_IN_BROWSER).sort(byPrio)[0];
  return (web || urls.slice().sort(byPrio)[0])?.url || null;
}

function usdPrice(prices = []) {
  const p = prices.find((x) => x.currency === 'USD') || prices.find((x) => x.currency === 'EUR') || prices[0];
  return p ? { currency: p.currency, old: p.oldValue } : null;
}

async function fetchFreeStuff() {
  const key = process.env.FREESTUFF_API_KEY;
  if (!key) {
    console.log('skipped:   FreeStuff (no FREESTUFF_API_KEY)');
    return [];
  }
  const now = Date.now();
  const items = [];
  for (const type of ['keep', 'timed']) {
    let offset = 0;
    for (;;) {
      const page = await freestuff(`/products?type=${type}&resolve=true&limit=50&offset=${offset}`, key);
      const list = page.products || [];
      for (const p of list) {
        if (p.flags & (FLAG_TRASH | FLAG_FIRSTPARTY_EXCLUSIVE)) continue;
        if (!['game', 'dlc'].includes(p.kind)) continue;
        const permanent = Boolean(p.flags & FLAG_PERMANENT);
        if (!permanent && (!p.until || p.until <= now)) continue;
        const img = bestImage(p.images);
        items.push({
          id: p.id,
          title: p.title,
          type,                      // keep = free to keep, timed = free to play for a while
          kind: p.kind,
          store: p.store || 'other',
          until: permanent ? null : p.until,
          price: usdPrice(p.prices),
          image: img.wide || img.tall,
          poster: img.tall,
          url: bestUrl(p.urls),
          source: 'freestuff'
        });
      }
      offset += list.length;
      if (!list.length || offset >= (page.count ?? 0)) break;
    }
  }
  return items;
}

/* ------------------------------------------------------------------ */
/* GamerPower                                                          */
/* ------------------------------------------------------------------ */

const GP_FEEDS = [
  'https://www.gamerpower.com/api/giveaways?platform=pc&type=game',
  'https://www.gamerpower.com/api/giveaways?platform=epic-games-store&type=game'
];

// "Mark of the Deep (Epic Games) Giveaway" -> title "Mark of the Deep", store "Epic Games"
function gpTitle(raw) {
  let title = raw.replace(/\s+(key\s+)?giveaway$/i, '').trim();
  let label = '';
  const m = /\s*\(([^)]+)\)\s*$/.exec(title);
  if (m) {
    label = m[1].trim();
    title = title.slice(0, m.index).trim();
  }
  return { title, label };
}

function gpStore(platforms, label) {
  const p = platforms.toLowerCase();
  const l = label.toLowerCase();
  if (p.includes('epic games store') || l.startsWith('epic')) return 'epic';
  if (p.includes('steam') || l === 'steam') return 'steam';
  if (p.includes('gog') || l === 'gog') return 'gog';
  if (p.includes('itch.io') || l === 'itch.io') return 'itch';
  if (l.includes('indiegala')) return 'indiegala';
  if (l === 'stove') return 'stove';
  if (p.includes('drm-free')) return 'drmfree';
  return 'other';
}

function gpPrice(worth) {
  const m = /^\$(\d+(?:\.\d+)?)$/.exec(String(worth).trim());
  return m ? { currency: 'USD', old: Math.round(parseFloat(m[1]) * 100) } : null;
}

// GamerPower gives end dates as "YYYY-MM-DD HH:MM:SS" without a zone;
// they are read as UTC and shown as a date (the time is often a placeholder).
function gpUntil(end) {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(String(end).trim());
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : null;
}

async function fetchGamerPower() {
  const byId = new Map();
  for (const url of GP_FEEDS) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status === 201) continue; // GamerPower: no active giveaways
    if (!res.ok) throw new Error(`GamerPower failed: ${res.status} ${url}`);
    const list = await res.json();
    if (!Array.isArray(list)) continue;
    for (const g of list) byId.set(g.id, g);
  }
  const now = Date.now();
  const items = [];
  for (const g of byId.values()) {
    if (g.status && g.status !== 'Active') continue;
    const until = gpUntil(g.end_date);
    if (until && until <= now) continue;
    const { title, label } = gpTitle(g.title);
    items.push({
      id: 'gp-' + g.id,
      title,
      type: 'keep',
      kind: 'game',
      store: gpStore(g.platforms || '', label),
      storeLabel: label || null,
      until,
      untilPrecision: until ? 'day' : null,
      price: gpPrice(g.worth),
      image: g.image || g.thumbnail || null,
      url: g.open_giveaway_url || g.gamerpower_url,
      published: g.published_date ? gpUntil(g.published_date) : null,
      source: 'gamerpower'
    });
  }
  console.log(`fetched:   GamerPower (${items.length} active)`);
  return items;
}

/* ------------------------------------------------------------------ */
/* live.json                                                           */
/* ------------------------------------------------------------------ */

function norm(t) { return String(t).toLowerCase().replace(/[^a-z0-9]+/g, ''); }

async function updateLive() {
  const lists = [];
  const sources = [];
  for (const [name, fn] of [['GamerPower', fetchGamerPower], ['FreeStuff', fetchFreeStuff]]) {
    try {
      const items = await fn();
      if (items.length) sources.push(name);
      lists.push(items);
    } catch (err) {
      console.log(`::warning title=${name} feed::${err.message}`);
    }
  }
  if (!lists.length) throw new Error('no free-game source answered');
  const seen = new Set();
  const items = lists.flat().filter((it) => {
    const k = norm(it.title);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  // ending soonest first; offers with no end date after, newest first
  items.sort((a, b) =>
    (a.until ?? Infinity) - (b.until ?? Infinity) ||
    (b.published ?? 0) - (a.published ?? 0) ||
    a.title.localeCompare(b.title));
  const data = { sources, updated: new Date().toISOString(), items };
  await writeIfChanged(FREE_FILE, data, (d) => d.items);
}

/* ------------------------------------------------------------------ */
/* Upcoming games test 2: Steam + console availability                 */
/* ------------------------------------------------------------------ */

// compare titles loosely: case, ™/®, punctuation and spacing don't matter
function titleKey(t) {
  return String(t).toLowerCase().replace(/[™®©]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '');
}

// store listings often add an edition or label after the name,
// e.g. "Football Manager 27 Console", "Arkheron (Game Preview)"
const EDITION_SUFFIXES = new Set(['', 'console', 'consoleedition', 'gamepreview', 'standardedition', 'standard',
  'deluxeedition', 'digitaldeluxeedition', 'ultimateedition', 'digitaledition', 'ps4', 'ps5', 'ps4ps5', 'ps4andps5',
  'xboxseriesxs', 'forxboxseriesxs', 'xboxone', 'xboxonexboxseriesxs', 'nintendoswitch', 'nintendoswitch2edition', 'pc']);
function sameGame(name, title) {
  const n = titleKey(name), t = titleKey(title);
  return n.startsWith(t) && EDITION_SUFFIXES.has(n.slice(t.length));
}
// punctuation confuses some store searches
function searchText(title) {
  return String(title).replace(/[™®©]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function onPlayStation(title) {
  const d = await getJson('https://store.playstation.com/store/api/chihiro/00_09_000/tumbler/US/en/999/' +
    encodeURIComponent(searchText(title)) + '?suggested_size=20&mode=game');
  return (d.links || []).some((l) => sameGame(l.name, title) &&
    (l.playable_platform || []).some((p) => /^PS[45]/.test(p)));
}

// Microsoft Store: is the game on Xbox, and is it in Game Pass?
async function onMicrosoft(title, gamePassIds) {
  const s = await getJson('https://displaycatalog.mp.microsoft.com/v7.0/productFamilies/autosuggest?market=US&languages=en-US&productFamilyNames=Games&query=' +
    encodeURIComponent(searchText(title)));
  const ids = (s.Results || []).flatMap((r) => r.Products || [])
    .filter((p) => sameGame(p.Title, title)).map((p) => p.ProductId).slice(0, 4);
  if (!ids.length) return { xbox: false, gamePass: false };
  const d = await getJson(`https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${ids.join(',')}&market=US&languages=en-US`);
  return {
    xbox: /"PlatformName":"Windows\.Xbox"/.test(JSON.stringify(d)),
    gamePass: ids.some((id) => gamePassIds.has(id))
  };
}

// Microsoft's public Game Pass lists: PC, console, all games, coming soon
const GAME_PASS_LISTS = [
  'fdd9e2a7-0fee-49f6-ad69-4354098401ff',
  'f6f1f99f-9b49-4ccd-b3bf-4d9767a77f5e',
  '29a81209-df6f-41fd-a528-2ae6b91f719c',
  '609d944c-d395-4c0a-9ea4-e9f39b52c1ad',
  '095bda36-f5cd-43f2-9ee1-0a72f371fb96'
];
async function gamePassCatalog() {
  const ids = new Set();
  for (const list of GAME_PASS_LISTS) {
    try {
      const d = await getJson(`https://catalog.gamepass.com/sigls/v2?id=${list}&language=en-us&market=US`);
      for (const x of d) if (x.id) ids.add(x.id);
    } catch (err) {
      console.log(`::warning title=Game Pass list::${list}: ${err.message}`);
    }
  }
  return ids;
}

// titles of the hand-picked games in test3/upcoming-games-2/games.js
async function handPickedTitles() {
  try {
    const { runInNewContext } = await import('node:vm');
    const src = await readFile(new URL('test3/upcoming-games-2/games.js', ROOT), 'utf8');
    const sandbox = { window: {} };
    runInNewContext(src, sandbox, { timeout: 1000 });
    return (sandbox.window.UPCOMING2?.games || []).map((g) => g.title);
  } catch (err) {
    console.log(`::warning title=Hand-picked games::${err.message}`);
    return [];
  }
}

async function onSwitch(title) {
  const d = await getJson('https://searching.nintendo-europe.com/en/select?fq=type:GAME&rows=10&wt=json&fl=title,system_names_txt&q=' +
    encodeURIComponent(searchText(title)));
  return (d.response?.docs || []).some((doc) => sameGame(doc.title, title) &&
    (doc.system_names_txt || []).some((n) => /switch/i.test(n)));
}

async function safe(fn, title) {
  try { return await fn(title); } catch (err) { console.log(`::warning title=Platform check::${title}: ${err.message}`); return null; }
}

const STEAM_SINGLE = 2;
const STEAM_MULTI = new Set([1, 36, 49, 47, 27]);   // multi-player, online/LAN PvP
const STEAM_COOP = new Set([9, 38, 48, 39, 24]);    // co-op, online/LAN co-op, shared screen

async function updateUpcoming2() {
  const month = monthKey(new Date());
  const gamePassIds = await gamePassCatalog();
  console.log(`fetched:   Game Pass catalog (${gamePassIds.size} products)`);
  const released = await pickSteam(SORT_TOP_SELLERS, { released_only: true }, month, 4, 6);
  const upcoming = await pickSteam(SORT_WISHLISTED, { coming_soon_only: true }, month, 6, 6);
  const seen = new Set();
  const picks = [...released, ...upcoming].filter((g) => !seen.has(g.appid) && seen.add(g.appid));
  const games = [];
  for (const [rank, g] of picks.entries()) {
    let details = {};
    try {
      const d = await getJson(`https://store.steampowered.com/api/appdetails?appids=${g.appid}&cc=us&l=en`);
      details = d[g.appid]?.data || {};
    } catch (err) {
      console.log(`::warning title=Steam details::${g.title}: ${err.message}`);
    }
    const cats = new Set((details.categories || []).map((c) => c.id));
    const players = [];
    if (cats.has(STEAM_SINGLE)) players.push('single');
    if ([...cats].some((c) => STEAM_MULTI.has(c))) players.push('multi');
    if ([...cats].some((c) => STEAM_COOP.has(c))) players.push('coop');
    const platforms = ['pc'];
    if (details.platforms?.mac) platforms.push('mac');
    const [ps, ms, sw] = await Promise.all([
      safe(onPlayStation, g.title),
      safe((t) => onMicrosoft(t, gamePassIds), g.title),
      safe(onSwitch, g.title)
    ]);
    if (ps) platforms.push('ps');
    if (ms?.xbox) platforms.push('xbox');
    if (sw) platforms.push('switch');
    games.push({
      appid: g.appid,
      title: g.title,
      date: g.date,
      platforms,
      players: players.length ? players : ['single'],
      arabic: /arabic/i.test(details.supported_languages || ''),
      dlc: details.type === 'dlc',
      gamePass: Boolean(ms?.gamePass),
      hot: rank < 3 || (rank >= released.length && rank < released.length + 2),
      poster: g.poster,
      url: g.url,
      rank: rank + 1
    });
  }
  // Game Pass check for the hand-picked games too
  const gamePassTitles = [];
  if (gamePassIds.size) {
    for (const t of await handPickedTitles()) {
      const ms = await safe((x) => onMicrosoft(x, gamePassIds), t);
      if (ms?.gamePass) gamePassTitles.push(t);
    }
  }
  const data = { source: 'Steam + PlayStation / Microsoft / Nintendo store search + Game Pass catalog', month, updated: new Date().toISOString(), games, gamePassTitles };
  await writeIfChanged(UP2_FILE, data, (d) => [d.month, d.games, d.gamePassTitles]);
}

/* ------------------------------------------------------------------ */
/* X profiles (FxTwitter)                                              */
/* ------------------------------------------------------------------ */

// FxTwitter often answers "User not found" for an account that exists, and
// can be picky about capital letters, so try a few times and both spellings.
async function fxUser(handle) {
  const spellings = [...new Set([handle, handle.toLowerCase()])];
  let last = '';
  for (let attempt = 0; attempt < 6; attempt++) {
    for (const h of spellings) {
      const res = await fetch('https://api.fxtwitter.com/' + encodeURIComponent(h), { headers: { 'User-Agent': UA } });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.user) return body.user;
      last = `${res.status} ${body.message || ''}`.trim();
    }
    await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  throw new Error(last || 'no answer');
}

async function updateProfiles() {
  const list = (await readJson(ACCOUNTS_FILE))?.accounts || [];
  const old = (await readJson(PROFILES_FILE))?.profiles || [];
  const profiles = [];
  for (const { handle } of list) {
    try {
      const u = await fxUser(handle);
      profiles.push({
        handle,
        screenName: u.screen_name,
        name: u.name,
        bio: u.raw_description?.text ?? u.description ?? '',
        bioLinks: (u.raw_description?.facets || [])
          .filter((f) => f.type === 'url' && f.original)
          .map((f) => ({ text: f.original, url: f.replacement, display: f.display || f.replacement })),
        // full-size images instead of the 48px thumbnail
        avatar: u.avatar_url ? u.avatar_url.replace(/_normal(\.\w+)$/, '_400x400$1') : null,
        banner: u.banner_url ? u.banner_url + '/1500x500' : null,
        followers: u.followers ?? null,
        location: u.location || null,
        website: u.website?.url ? { url: u.website.url, display: u.website.display_url || u.website.url } : null,
        verified: Boolean(u.verification?.verified),
        url: `https://x.com/${u.screen_name || handle}`
      });
    } catch (err) {
      // keep the last good copy of this profile
      const prev = old.find((p) => p.handle === handle);
      if (prev) profiles.push(prev);
      console.log(`::warning title=X profile ${handle}::${err.message}`);
    }
  }
  const data = { source: 'FxTwitter (api.fxtwitter.com)', updated: new Date().toISOString(), profiles };
  await writeIfChanged(PROFILES_FILE, data, (d) => d.profiles);
}

/* ------------------------------------------------------------------ */

// One feed failing should not stop the other from being saved, so errors are
// reported as workflow warnings and the old file is kept.
for (const [name, job] of [['Steam', updateSteam], ['Free games', updateLive], ['X profiles', updateProfiles], ['Upcoming test 2', updateUpcoming2]]) {
  try {
    await job();
  } catch (err) {
    console.log(`::warning title=${name} feed::${err.message}`);
  }
}
