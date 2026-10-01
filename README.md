# TrustRate by Monark

**Know who delivered before you hand them the work.**

TrustRate is Monark's reputation module: a public, wallet-bound record of how past collaborations went. Anyone can review the wallet of a contributor, freelancer or partner they worked with. Reviews are sealed on-chain (they can't be edited or deleted), weighted towards reviews tied to a real on-chain interaction and written by people with a record, and moderated in the open by five community moderators.

This repository is the **demo site**: a Next.js app with a simulated wallet and chain, in English and French. Project page: https://www.monark.io/en/project/address-review-system

> Demo · simulated data. Testnet demo · not financial advice · no real funds.

## What you can do in the demo

1. **Connect a demo wallet** (a signed sign-in message; reject it to see the failure state).
2. **Look someone up** by name or address, open their profile and see exactly how the trust score is built, review by review.
3. **Write and seal a review** tied to a real interaction (a bounty, milestone, invoice or sponsorship). The composer reads the tone of your words and warns you when they disagree with your stars, shows the weight your review will carry and how the score will move, then seals it through the wallet prompt (pending, confirmed or failed).
4. **Reply and vote helpful** on reviews of you.
5. **Flag a review and moderate it**: the case opens in the moderation queue, you vote, the other moderators' votes arrive, and at three matching votes the review is hidden (still on-chain, no longer counted).

## Run it locally

Requirements: Node.js 22, pnpm 10.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Other scripts:

```bash
pnpm lint
pnpm typecheck      # next typegen && tsc --noEmit
pnpm build && pnpm start
pnpm screenshots    # Playwright screenshots of every page and flow (needs a running server, BASE_URL defaults to http://localhost:3139)
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` is optional (canonical URLs, sitemap and Open Graph; defaults to `https://trustrate.monark.io`).

## How the simulation works

Everything lives in the browser; there is no backend and no real chain.

- `src/lib/demo/` is a small typed data layer shaped like the real thing, so it could be swapped for wagmi/viem calls and an indexer without touching UI code:
  - `types.ts`: members, interactions, reviews, replies, moderation cases, wallet and transaction states.
  - `seed.ts`: the example community (a student blockchain association, its contributors, moderators and local partners), written natively in English and French.
  - `store.ts`: an external store persisted to `localStorage` (every access in try/catch), plus the wallet-prompt request/response.
  - `chain.ts`: a transaction is a wallet prompt, then pending with a hash for 1.2 to 2.4 s (3 to 6 s with "slow network"), then confirmed in a block or reverted.
  - `wallet.ts`: simulated connect/disconnect.
  - `score.ts`: the public score formula: `weight = interaction (1.0 verified / 0.4) × standing (1.0 with ≥ 2 verified interactions / 0.6)`, `score = (Σ weight × stars + 2 × 3.0) ÷ (Σ weight + 2)`, and a confidence label.
  - `sentiment.ts`: a small, transparent English/French word-list classifier (it never changes the score).
  - `ops.ts`: reads (profiles, activity trail) and writes (seal a review, reply, helpful vote, flag, moderation vote with a 3-of-5 quorum and the simulated votes of the other moderators).
- **Demo controls** (in the app bar) let you slow the network, force the next transaction to fail, and **Reset demo**.

## Project structure

```
src/
  app/
    [locale]/              # en, fr (proxy.ts redirects / to the preferred language)
      page.tsx             # home
      how-it-works/        # the mechanics, score formula, contract interface
      credits/             # photo, type and icon credits
      pricing/             # internal review only: unlinked, noindex, not in the sitemap
      app/                 # the interactive demo: explore, profile/[address], write, moderation
      opengraph-image.tsx  # per-locale OG image
    sitemap.ts, robots.ts, icon.svg, globals.css
  components/
    site/                  # standard Monark header, footer, brand, locale switch, theme toggle
    demo/                  # app frame, wallet prompt, review card, composer, profile, moderation…
    trust/                 # stars, score dial, seal stamp, chips
    home/, diagrams/       # hero card, step diagrams
    ui/                    # @monark/ui registry components (restyled)
  i18n/                    # typed EN/FR dictionaries
  lib/                     # demo data layer, formatting, metadata helpers
docs/
  site-plan.md             # product brief, flows, copy, aesthetics (kept in sync with the code)
  assets.md                # every image and its licence
  screenshots/             # Playwright screenshots at 390 and 1440 px, light and dark, EN and FR
```

Built with Next.js 16 (App Router, TypeScript strict), Tailwind CSS v4, shadcn/ui on the [Monark UI registry](https://ui.monark.io) and Lucide icons, following Monark's brand guidelines (cream and espresso themes derived from Monark orange, Nunito Sans).

## Deploy to Vercel

Import the repository in Vercel and deploy with the framework defaults: no `vercel.json`, no environment variables. The Node version is pinned in `package.json` (`engines.node: 22.x`) and pnpm is picked up from `pnpm-lock.yaml`.

## Licence and credits

Open source, by the Monark community. Photos from Unsplash (see `docs/assets.md` and `/credits`).
