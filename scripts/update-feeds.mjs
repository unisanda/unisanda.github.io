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

  2. FreeStuff -> test3/free-games/live.json
     Games that are free for a limited time (100% off, or free weekends),
     from the FreeStuff API v2 REST endpoint. Needs FREESTUFF_API_KEY (the
     REST API is part of FreeStuff's paid "full" tier). Without a key the
     file is left as it is.

  A file is only rewritten when its games actually change, so the scheduled
  run does not create a commit every time.
*/
import { readFile, writeFile } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url);
const STEAM_FILE = new URL('test3/upcoming-games/steam.json', ROOT);
const FREE_FILE = new URL('test3/free-games/live.json', ROOT);

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

async function updateFreeStuff() {
  const key = process.env.FREESTUFF_API_KEY;
  if (!key) {
    console.log('skipped:   FreeStuff (no FREESTUFF_API_KEY)');
    return;
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
          rating: typeof p.rating === 'number' ? Math.round(p.rating * 100) / 100 : null
        });
      }
      offset += list.length;
      if (!list.length || offset >= (page.count ?? 0)) break;
    }
  }
  // ending soonest first; offers with no end date go last
  items.sort((a, b) => (a.until ?? Infinity) - (b.until ?? Infinity) || a.title.localeCompare(b.title));
  const data = { source: 'FreeStuff API v2', updated: new Date().toISOString(), items };
  await writeIfChanged(FREE_FILE, data, (d) => d.items);
}

/* ------------------------------------------------------------------ */

// One feed failing should not stop the other from being saved, so errors are
// reported as workflow warnings and the old file is kept.
for (const [name, job] of [['Steam', updateSteam], ['FreeStuff', updateFreeStuff]]) {
  try {
    await job();
  } catch (err) {
    console.log(`::warning title=${name} feed::${err.message}`);
  }
}
