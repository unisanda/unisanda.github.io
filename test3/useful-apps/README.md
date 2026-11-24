# Useful apps — test page

Hand-picked PC apps grouped by category. Each app is a card with a two-letter badge in its group's colour, its name and the site it links to, with a one-line description underneath. Cards rest at slightly different angles and sway gently; under the mouse a card straightens up, lifts and tilts towards the pointer. They settle into place as they scroll into view. A search box and category chips filter the list.

The background and colour switch come from `../styles.css` and `../app.js`.

## Editing the list

Everything is in `apps.js`: sections (only "PC Apps" for now), groups with a colour, and apps with a name, a short description and a link. Add another section (for example phone apps) to the `sections` list and it gets its own heading, search and chips.

## Links

Links go to each project's own site, GitHub page or store listing, checked on 21 November 2026. Left out until their official source is clear:

- WinGrep: only an old, unmaintained site.
- Your Uninstaller: no official site found.
- Rift Launcher: several different products use that name.
- "Popup": not enough to tell which app it is.

## Folded groups

Each group shows its first 3 apps; the rest sit behind a "+N more" tile (one row of 3 apps + the tile on desktop, two rows on phones and tablets). The tile opens the whole group and becomes "Show less". While searching, every match shows. Change `VISIBLE` in `useful.js` to show more or fewer per group.

`apps-list.txt` lists every app name on the page (A–Z), to check a new batch for duplicates before adding it.
