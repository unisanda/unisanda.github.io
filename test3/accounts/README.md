# Accounts worth following — test page

One card per X account, in the order of `accounts.json`: the banner across the top half, the profile picture in a circle in the middle, and the name, handle, bio, followers, location and website on the bottom half, with a "Follow on X" button. Links in the bio (and e-mail addresses and @mentions) are clickable.

## Adding an account

Add `{ "handle": "TheirHandle" }` to `accounts.json`. The hourly "Update game feeds" GitHub Action (`scripts/update-feeds.mjs`) then reads each profile from FxTwitter's public API (`api.fxtwitter.com`, no key) and writes `profiles.json`; you can also start it by hand from the Actions tab. Pictures and banners load straight from X's image server.

FxTwitter sometimes answers "User not found" for accounts that exist, and can be picky about capital letters. The script retries and also tries the all-lowercase handle; if a profile still cannot be read, the last good copy is kept. If a new account never shows up, try writing its handle with different capitals (for example `U7madX` works where `u7madx` does not).

## Platforms: X, Instagram, TikTok

Tabs at the top switch between platforms. X is selected every time the page opens; `#instagram` or `#tiktok` at the end of the address opens those tabs instead.

- **X**: as above, from `profiles.json`.
- **Instagram**: Instagram does not show profiles without logging in, so these cards are filled in by hand in `accounts.json` under `instagram`: `handle`, and optionally `name`, `category`, `bio`, `posts`, `followers`, `following`, `website`, `verified` and `avatar` (an image in `avatars/`). A handle on its own gives a simple card with the first letter and a Follow button. The card copies an Instagram profile header: story-ring picture, posts / followers / following, category, bio, link and a blue Follow button.
- **TikTok**: list handles in `accounts.json` under `tiktok`. The hourly workflow reads each public TikTok profile page and writes `tiktok.json`, saving the profile picture in `avatars/` (TikTok's picture links expire). The card copies a TikTok profile header: the picture blurred across the top, name, @handle, following / followers / likes, bio, link and a red Follow button.
