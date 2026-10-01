# Assets

## Photography

All photos are from Unsplash under the free [Unsplash License](https://unsplash.com/license) (none are Unsplash+; each was downloaded from `images.unsplash.com`). They are resized to 2,000 px on the long edge, compressed, served from `public/images/` with `next/image`, and credited on `/credits`, which the footer links to.

| File | Unsplash page | Photographer | Profile | Used on |
|-|-|-|-|-|
| `public/images/project-review.jpg` | https://unsplash.com/photos/Uzwig52Fpqg | Derek Coleman | https://unsplash.com/@derektuff | Home, "For everyone who works with people they've never met": student associations; `/credits` |
| `public/images/contributors.jpg` | https://unsplash.com/photos/wmhehhmeA1o | Mapbox | https://unsplash.com/@mapbox | Home, same section: contributors; `/credits` |
| `public/images/cafe-partners.jpg` | https://unsplash.com/photos/dU3KJqyYlO0 | Vitaly Gariev | https://unsplash.com/@silverkblack | Home, same section: local partners; `/credits` |

## Monark brand assets

From `lovable-migration/brand-refs/` and the [monark-community/website](https://github.com/monark-community/website) repo, used per `monark-brand-guidelines.md`:

| File | Source | Used for |
|-|-|-|
| `public/brand/monark-mark.svg`, `src/app/icon.svg` | brand-refs `logos/svg/standalone/logo-branded-standalone.svg` | Header brand, favicon, wallet prompt, connect gate, Open Graph image |
| `public/brand/monark-horizontal-{light,dark}.svg` | website `public/vectors/brand/horizontal/` | Footer Monark band |
| `public/brand/monark-vertical-{light,dark}.svg` | brand-refs `logos/svg/vertical/` | 404 page |
| `public/brand/monark-mesh.svg` | website `public/vectors/decorative/monark-mesh.svg` | Home hero only (once per site) |
| `public/brand/socials/*.svg` | website `public/vectors/socials/` | Footer social links (recoloured to `foreground` through a CSS mask) |

## Built in code

- Score dial, stars, seal stamp, verified / unverified chips, weight bars, moderation tally: flat orange line art in SVG/JSX (`src/components/trust/`).
- "Life of a review" and "moderation" step diagrams on `/how-it-works` (`src/components/diagrams/steps-diagram.tsx`).
- Live profile card in the home hero (`src/components/home/hero-card.tsx`).
- Open Graph image: generated per locale with `next/og` (`src/app/[locale]/opengraph-image.tsx`).
- Wallet avatars: Jazzicons via the `@monark/ui` `wallet` component.
- Icons: [Lucide](https://lucide.dev). Type: Nunito Sans via `next/font/google`.
