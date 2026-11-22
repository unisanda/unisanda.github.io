# Accounts worth following — test page

One card per X account, in the order of `accounts.json`: the banner across the top half, the profile picture in a circle in the middle, and the name, handle, bio, followers, location and website on the bottom half, with a "Follow on X" button. Links in the bio (and e-mail addresses and @mentions) are clickable.

## Adding an account

Add `{ "handle": "TheirHandle" }` to `accounts.json`. The hourly "Update game feeds" GitHub Action (`scripts/update-feeds.mjs`) then reads each profile from FxTwitter's public API (`api.fxtwitter.com`, no key) and writes `profiles.json`; you can also start it by hand from the Actions tab. Pictures and banners load straight from X's image server.

FxTwitter sometimes answers "User not found" for accounts that exist, and can be picky about capital letters. The script retries and also tries the all-lowercase handle; if a profile still cannot be read, the last good copy is kept. If a new account never shows up, try writing its handle with different capitals (for example `U7madX` works where `u7madx` does not).
