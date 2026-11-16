# Unisanda

A personal links and reviews site built with Next.js.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Run `npm run build` to generate the static site in `out/`.

## Pages

- `/` — profile, social links, email, and support.
- `/reviews/` — review list. Entries are marked “Coming soon” until real review URLs are available.
- `/reviews/reviews.html` — redirects the former URL to `/reviews/`.

The Arabic and English interface, light and dark themes, and their saved preferences work across both pages.

## Deployment

The GitHub Actions workflow builds pull requests and publishes `out/` to GitHub Pages when changes reach `main`. In the repository's Pages settings, choose **GitHub Actions** as the build and deployment source. The custom domain is supplied by `public/CNAME`.

The Arabic interface uses the locally installed Thmanyah Sans font when available and falls back to Tahoma elsewhere. The font files are not included in this repository.
