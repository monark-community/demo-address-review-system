# Simplification pass (pilot)

Owner feedback: *"Generally, products are too loaded. Simplify, reduce text quantity, revise flows so that context is only given only when necessary. Two top bars on homepage is too busy, if you must have the demo banner, have them live only on demos/app pages."*

Binding rules: `monark-brand-guidelines.md` §8 "Restraint", §10 and §11. This file records the audit before the pass, what changed, the result, and a checklist to repeat the pass on other sites.

How the numbers are measured (both scripts are in `scripts/`, run against `pnpm start -p 3139`):

- `node scripts/wordcount.mjs`: words per page, English, at 1440px. *Visible* is the `innerText` of `<main>` (what a visitor reads without opening anything); *total* also counts closed disclosures and FAQ answers; *chrome* is everything outside `<main>` (header and footer). On `/app` pages the app bar is inside `<main>`, and Explore and Profile include seeded review text (data, not UI copy).
- `node scripts/dictcount.mjs`: words of UI copy in `src/i18n/dictionaries/{en,fr}.ts`, per section. This is the site-wide copy budget, independent of seeded data.

## 1. Before

### Word counts per page (EN)

| Page | Visible in main | Total in main (incl. collapsed) | Chrome (header, footer) |
|-|-:|-:|-:|
| Home | 422 | 583 | 84 |
| How it works | 612 | 612 | 84 |
| Credits | 102 | 102 | 84 |
| 404 | 30 | 30 | 84 |
| App: connect gate | 61 | 61 | 84 |
| App: explore | 451 | 454 | 86 |
| App: profile (Amara) | 603 | 698 | 86 |
| App: write a review | 204 | 204 | 86 |
| App: moderation | 163 | 166 | 86 |
| **Total** | **2,648** | **2,910** | **764** |

Dictionary copy: **EN 2,909 words** (meta 159 · common 145 · home 622 · how 524 · credits 79 · pricing 186 · app 1,193); **FR 3,154 words**.

### Inventory: sections, panels and notes

**Shell**
- Header: brand, 3 links, Demo chip, EN/FR, theme, primary action (one bar on marketing pages).
- Footer legal band: "Demo · simulated data" **and** "Testnet demo · not financial advice · no real funds" (the second repeats the wallet prompt's notice on every page).
- Demo chip tint `primary/10` in both themes (fails AA in light mode at 12px bold).

**Home** (hero + 5 sections)
1. Hero: eyebrow "Reputation module · Monark", H1 (9 words), sub (25 words), 2 buttons, live profile card.
2. Outcomes: H2 + 3 items (title + 15–20-word body).
3. "What makes a review count": eyebrow + H2 + intro line + 3 cards (20–25-word bodies, each with a UI fragment; the standing card lists 4 weight bars with labels).
4. Section divider.
5. "Who relies on it": H2 + 3 photo cards (title + 15-word body).
6. FAQ: 6 questions (two are mechanics: second-wallet weight, tone classifier).
7. Section divider.
8. Closing: H2 (10 words) + body line (20 words) + button.

Overlap: outcomes 2 and 3 restate the "counts" cards; outcome 1 restates the hero.

**How it works** (intro + 6 sections, 2 dividers)
- Intro: eyebrow + H1 + 30-word intro.
- Life of a review: 5-step diagram, 10–15 words per step.
- Weights: intro line, 4-row table with long "when" cells, formula, 30-word explanation, worked example (3 lines + 35-word result), confidence paragraph.
- Moderation: 25-word intro + 4-step diagram (12–20 words per step).
- Replies and the activity trail: 50-word paragraph.
- For developers: 40-word paragraph + contract interface + 3 notes (15 words each).
- CTA: H2 + line + button.

**App (`/app/...`)**
- Two bars under the header: a strip (network badge, the testnet notice, Demo controls) **and** the section nav (Explore, My reputation, Moderation, Write a review).
- Connect gate: logo, H1, 18-word paragraph, 3 feature bullets, button.
- Explore: H1 + intro paragraph; visible search label + placeholder; members list; feed of 6 reviews.
- Profile: header (name, role, address, since, interactions); score panel (dial, "out of 5", reviews/verified, confidence, plain average, hidden count, ratings, tone, known for, "How this score is calculated" disclosure with an intro line); tabs; filters; review cards.
- Review card: identity, stars, verified chip, tone chip, tags, **interaction title line**, comment, reply, footer with block, date and **transaction hash**, Helpful, Reply, Flag.
- Write a review: H1 + intro paragraph; 5 numbered steps, 4 of them with a hint line; tone line with a permanent note; aside with 3 cards (preview; weight with 2 reason lines and score move; permanent notice + seal button + **testnet notice**).
- Reply form: title + 25-word hint + visible label + **testnet notice**.
- Flag dialog: title + 18-word description + **testnet notice**.
- Wallet prompt: summary, network, fee, testnet notice (correct place).
- Moderation: H1 + 25-word intro + "You're one of the five moderators" line; case cards; decided list.
- Demo controls dialog: 3 hint lines (13–20 words), reset confirm body.
- Repeated messages: sealing a review shows a toast **and** a status line on the profile; a moderation vote shows a toast **and** "You voted to hide" in the card; a reply shows a toast with a block **and** the reply in place with its block.
- Empty/error states with two sentences: invalid address (search and profile), no match, empty profile, "nobody has reviewed you".

## 2. What changed

No feature or flow was removed. Words and chrome were.

### Shell
- **Demo chip:** tint `primary/8` in light mode, `primary/15` in dark (was `/10` in both). 12px bold `primary-ink` on 15% cream is 4.3:1 and fails AA; 8% gives 4.5:1.
- **Footer legal band:** removed the testnet line; it keeps "Demo · simulated data". Product line cut from 22 to 10 words.
- **Marketing pages:** exactly one top bar (the header). Nothing was stacked above or below it.

### Home (hero + 5 sections → hero + 4 sections)
- Hero: removed the eyebrow; subline 25 → 12 words; secondary CTA "See how a review counts" → "How a review counts".
- **Merged** "Outcomes" and "What makes a review count" into one section, "Why the score is hard to fake": heading only (no eyebrow, no intro line), 3 cards of 7–10 words each, each keeping its UI fragment. The standing card shows 2 weight bars, not 4 (the 4-way table is on `/how-it-works`). Outcome 1 repeated the hero; outcomes 2–3 repeated the cards.
- "Who relies on it": heading 10 → 7 words; card lines 15–17 → 9–10 words.
- FAQ: 6 → 4 questions, answers 20–40 → 12–15 words. The two mechanics questions moved: "second wallet" became a line of the worked example on `/how-it-works`, and "how is tone worked out" became the "Replies, votes and tone" line there. This is the only FAQ on the site.
- Closing: removed the body line; heading 10 → 7 words. Removed one of the two section dividers.

### How it works
- Removed the eyebrow; intro 30 → 8 words.
- Diagram step lines cut to 5–9 words; table "when" cells cut to 2–6 words; formula note, worked example and confidence reduced to one line each.
- "Replies and the activity trail" (50 words) → "Replies, votes and tone" (25 words).
- For developers: 40 → 20-word line; the contract interface and notes sit behind a "Show the contract interface" disclosure (context on demand). Notes cut to 7–8 words.
- CTA: heading + button (removed the body line). Removed one of two dividers.

### App (`/app/...`)
- **One bar instead of two.** The testnet strip is gone. The section nav, one pill that shows the network ("● Sepolia testnet") and opens Demo controls, and "Write a review" share one compact bar under the header. On phones the pill is icon-only and "Write a review" moves off the bar (every profile has it), so the three sections fit.
- **Testnet line once per transaction:** only in the wallet prompt. Removed from the composer's seal card, the reply form and the flag dialog.
- Connect gate: removed the three feature bullets; line 18 → 9 words.
- Explore: removed the intro paragraph; the search label is screen-reader only (placeholder carries it); feed shows 4 reviews at a time (was 6).
- Profile: removed "out of 5" under the dial; "Plain average" moved into the "How is this calculated?" disclosure (renamed from "How this score is calculated"), whose intro line was removed; reviews shown 5 at a time with "Show more reviews".
- Review card: removed the interaction title line (it is in the verified chip's tooltip) and the transaction hash (it is in the "Sealed in block" tooltip).
- Write a review: removed the intro paragraph and 3 step hints (who, interaction, comment). "What are you reviewing?" and "Tone" get an info icon (popover) instead. The preview and the weight card are one card; the two "why" lines behind the weight moved into a "How is this calculated?" info popover with a link to `/how-it-works`. Kept the one note that matters at this step: "Once sealed, a review can't be edited or deleted."
- Reply form: removed the 25-word hint; "you can reply once" moved into the placeholder; the title is the field label.
- Flag dialog: description 18 → 7 words.
- Moderation: removed the intro paragraph and "You're one of the five moderators" line; both are in an info popover next to the title. The moderators' avatars stay.
- Demo controls: hints cut to 4–7 words; reset confirmation 16 → 9 words.
- **One message, once:** sealing a review no longer shows a toast (the profile opens on the sealed review with a status line); a moderation vote no longer shows a toast (the card says "You voted to hide"); the reply toast lost its block description (the reply shows its block in place).
- Empty and error states are one line plus the next action: "Not a wallet address (0x + 40 characters).", "No one matches "{q}". Try their full address.", "No reviews yet." + *Write the first review*, "No reviews of you yet.", invalid profile = title + *Back to Explore*.
- New shared component: `src/components/ui/info-tip.tsx` (Radix Popover behind an info icon; opens on click or tap, so it works on touch, unlike a tooltip).

French was rewritten to the same brevity (not translated word for word) in `src/i18n/dictionaries/fr.ts`.

## 3. After

### Word counts per page (EN)

| Page | Visible before | Visible after | Change | Total before (incl. collapsed) | Total after | Chrome before | Chrome after |
|-|-:|-:|-:|-:|-:|-:|-:|
| Home | 422 | 214 | −49% | 583 | 264 | 84 | 64 |
| How it works | 612 | 291 | −52% | 612 | 408 | 84 | 64 |
| Credits | 102 | 78 | −24% | 102 | 78 | 84 | 64 |
| 404 | 30 | 20 | −33% | 30 | 20 | 84 | 64 |
| App: connect gate | 61 | 19 | −69% | 61 | 19 | 84 | 64 |
| App: explore | 451 | 296 | −34% | 454 | 299 | 86 | 66 |
| App: profile (Amara) | 603 | 324 | −46% | 698 | 405 | 86 | 66 |
| App: write a review | 204 | 127 | −38% | 204 | 127 | 86 | 66 |
| App: moderation | 163 | 128 | −21% | 166 | 131 | 86 | 66 |
| **Total** | **2,648** | **1,497** | **−43%** | **2,910** | **1,751** | **764** | **584** |

Marketing pages alone (home, how it works, credits, 404): 1,166 → 603 visible words (−48%). The remaining app words are mostly seeded data (member names and roles, review comments).

Dictionary copy: **EN 2,909 → 2,063 words (−29%)**, FR 3,154 → 2,243 (−29%). Per section (EN): meta 159 → 128 · common 145 → 123 · home 622 → 305 · how 524 → 320 · credits 79 → 55 · app 1,193 → 945 · pricing 186 → 186 (internal, unlinked page, left as is). The dictionary also holds required microcopy (labels, validation, activity lines, tags), so it shrinks less than the pages.

### Screenshots

- Before: `docs/screenshots/before/en-1440-light-page-home.png`, `docs/screenshots/before/en-1440-light-flow3-composer-filled.png`.
- After: `docs/screenshots/en-1440-light-page-home.png`, `docs/screenshots/en-1440-light-flow3-composer-filled.png`, and every other page and flow step in `docs/screenshots/` (EN 390/1440 light/dark, FR 390/1440 light).

## 4. Reusable checklist (apply the same pass to another site)

Measure first, change second, measure again.

1. **Measure.** Copy `scripts/wordcount.mjs` and `scripts/dictcount.mjs`; adapt the page list, the connect step and the dictionary path. Build, `pnpm start -p <port>`, record the before table in `docs/simplification.md`, and list every section, panel, note and repeated message per page.
2. **Shell.**
   - [ ] Demo chip tint: `bg-primary/8 dark:bg-primary/15` with `text-primary-ink`.
   - [ ] Marketing pages (home, how it works, credits, pricing, 404): exactly one top bar, the header. Remove any demo/testnet/announcement strip.
   - [ ] Footer legal band: "Demo · simulated data" only; remove the testnet line. Footer product line ≤ 12 words.
3. **Home.**
   - [ ] Hero: no eyebrow unless it adds information; headline ≤ 10 words; one line ≤ 25 words (aim for ~12); ≤ 2 buttons.
   - [ ] ≤ 5 sections after the hero, closing CTA included. Merge sections that restate each other or the hero (outcomes vs. features is the usual pair).
   - [ ] Each section: heading + at most one short line. Drop eyebrows and intro paragraphs.
   - [ ] Card text ≤ 20 words (aim for ~10). Keep the UI fragment or visual; cut the sentence that describes it. Cut numbers and formulas from cards (a chip or bar can show "100% / 40%").
   - [ ] FAQ ≤ 5 questions, in one place only. Move mechanics questions (formulas, weights, classifiers) into `/how-it-works` content.
   - [ ] Closing: heading + button, no body line. At most one decorative divider.
4. **How it works.**
   - [ ] No eyebrow; one-line intro.
   - [ ] Diagram steps ≤ 10 words each; table cells ≤ 6 words; one line per formula note, example and threshold.
   - [ ] Code, contract interfaces and developer notes behind a disclosure.
   - [ ] CTA: heading + button.
5. **App bar.**
   - [ ] One compact bar under the header: section nav + one pill for network and demo controls (+ at most one action). No testnet strip.
   - [ ] Check it at 390px in both languages: the sections must fit without clipping; move secondary actions off the bar on phones if needed.
6. **Disclaimers.**
   - [ ] Testnet / not financial advice line only in the confirmation step (wallet prompt or confirm dialog), once per transaction. Remove it from forms, cards, dialogs, bars and the footer.
7. **Flows, step by step** (walk every flow in the site plan).
   - [ ] Remove intro paragraphs above forms and page titles.
   - [ ] Remove step hints; keep only real constraints ("Up to three"). Put the "why" behind an info icon (`info-tip.tsx`, a popover, works on touch) or a "How is this calculated?" disclosure linking to `/how-it-works`.
   - [ ] Remove permanent help panels; merge adjacent cards that describe the same thing (e.g. preview + weight).
   - [ ] Keep at most one consequence note at the commit step ("can't be edited or deleted").
   - [ ] Remove per-card repetition: secondary metadata (hashes, linked-work titles) goes into tooltips.
   - [ ] Long lists: page them (4–5 items + "Show more").
   - [ ] One message, once: no toast when the next screen or the card itself already confirms the result.
   - [ ] Empty and error states: one line + the next action.
   - [ ] Demo controls: hints ≤ 7 words.
8. **Languages.** Rewrite FR to the same brevity; keep EN and FR keys identical (typed dictionary). Remove keys that are no longer used.
9. **Docs.** Update `docs/site-plan.md` (hero, page map, header/app bar, content tables, FAQ, implementation notes). Update Playwright selectors for any text you changed.
10. **Verify.** Re-run the word counts (target ≥ 40% fewer visible words site-wide), the full screenshot script, and look at home, how it works and each flow step at 1440 and 390, light and dark, plus FR at 390. Re-render the project image. `lint`, `typecheck`, `build` must pass.
