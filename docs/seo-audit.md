# GymCat SEO audit

This audit covers the production site at `https://gymcat.es` and the local
Astro project as of May 13, 2026. The goal is to make GymCat easier to share,
index, and understand while keeping the message focused on helping people
choose a gym without hidden costs.

## Summary

The site already had a valid `robots.txt`, a dynamic sitemap, canonical URLs,
and useful page titles. The largest gap was social sharing: pages declared
`summary_large_image` but did not provide `og:image` or `twitter:image`, so
link previews had no reliable spotlight image. Several public pages also relied
on default descriptions, and admin pages lacked explicit `noindex` tags.

## Findings

- Social previews were incomplete because `og:image`, image dimensions, image
  alt text, and `twitter:image` were missing.
- The home page had a broken CTA to `/vs`; the existing comparison route is
  `/comparar`.
- Astro did not define `site`, which makes canonical and sitemap behavior less
  explicit for Vercel deployments.
- Public pages shared one generic metadata fallback, which weakened search
  snippets for `/gimnasios` and `/mapa`.
- Gym detail pages did not expose gym-specific structured data.
- Admin pages were blocked by `robots.txt`, but they did not include an
  explicit `noindex, nofollow` meta tag.
- The previous local spotlight image was an unused portrait photo and was not
  wired into metadata.

## Changes made

- Added a reusable Open Graph image at `/seo/gymcat-og-image.png`.
- Added a Twitter-compatible image at `/seo/gymcat-twitter-image.png`.
- Added an Instagram Stories creative at `/seo/gymcat-story-image.png`.
- Added metadata props to `BaseLayout.astro` for title, description, canonical
  path, image, image alt text, robots policy, Open Graph type, and JSON-LD.
- Added default `WebSite` and `Organization` structured data site-wide.
- Added `HealthClub` JSON-LD to gym detail pages.
- Added page-specific descriptions for `/gimnasios` and `/mapa`.
- Added `site: "https://gymcat.es"` to Astro config for Vercel.
- Added `site.webmanifest` and app icon metadata.
- Added `noindex, nofollow` meta tags to admin pages.
- Fixed the home page comparison CTA from `/vs` to `/comparar`.

## Remaining recommendations

- Add a dynamic OG image route later if each gym needs a custom share card with
  price, city, and verified status.
- Add `hreflang` only when Catalan or English versions exist.
- Use Search Console after deployment to validate sitemap discovery and page
  indexing.
- Run a rich-results validation on a few gym pages after production deploy.
- Consider moving the Google Maps API key out of the layout and into an
  environment-backed public variable before scaling traffic.

## Generated campaign assets

The project now includes reusable campaign assets:

- `/public/seo/gymcat-og-image.png`
- `/public/seo/gymcat-twitter-image.png`
- `/public/seo/gymcat-story-image.png`
- `/scripts/render-social-assets.html`

The source HTML keeps text overlays deterministic, so future changes can be
rendered again without relying on AI-generated text.
