# TrustRate by Monark: site plan

Status: shipped on `develop`. This plan describes what the site does, and it is kept in sync with the code.

- Product: **TrustRate**, Monark's reputation module: wallet-bound reviews for the people and partners a Web3 community works with.
- Authoritative description: https://www.monark.io/en/project/address-review-system
- Branding: **Monark-branded** (`true`). `lovable-migration/monark-brand-guidelines.md` is binding.
- Stack: Next.js 16 (App Router, `src/`, TypeScript strict), pnpm, Tailwind CSS v4, shadcn/ui on the Monark UI registry, `lucide-react`.

---

## 1. Product brief

**Target user.** People in a Monark community who have to decide whether to trust someone they only know by a wallet address:

- the treasurer or project lead of a **student blockchain association** hiring a freelance designer, developer or translator for a bounty;
- **DAO and open-source contributors** who want their track record to follow them from one project to the next;
- **local partners** (a café that hosts meetups, a print shop, a sponsor) who work with the community and want a public, fair record of how that went, in both directions;
- **community moderators** who keep the review space honest without a central admin.

Secondary users are **students and developers** learning how an on-chain review system works (the documentation page frames this project as a learning build: contracts for public data submission, browsing UIs, wallet-linked identity).

**Core job to be done.** *"Before I hand a bounty, a budget or a venue to someone I only know by a wallet address, show me how their past collaborations actually went, from people who really worked with them, in a way nobody can quietly edit."*

**Domain concepts** (each is explained in plain words the first time the site uses it):

| Concept | Meaning in TrustRate |
|-|-|
| Profile | Everything the chain knows about one wallet address: reviews received and given, replies, votes and moderation outcomes. There is no sign-up; any address has a profile. |
| Review | A rating (1 to 5 stars), a comment (40 to 600 characters), up to three tags and a timestamp, signed by the reviewer's wallet and **sealed** on-chain. It can't be edited or deleted. |
| Seal | The transaction that writes a review on-chain. It has a transaction hash and a block number anyone can check. |
| Verified interaction | A review linked to a real on-chain interaction between the two wallets (a bounty paid, a milestone released, a Splitflow payout, an event invoice). Verified reviews carry full weight. |
| Reviewer standing | *Established* reviewers (at least two verified on-chain interactions, as payer or payee) carry full weight; *new* wallets carry 60%. Stops a fresh wallet from farming reputation. |
| Trust score | The weighted average of visible reviews, pulled gently towards 3.0 when there is little evidence (a prior worth two reviews), shown with a **confidence** label: *Early*, *Growing* or *Solid*. |
| Sentiment | A simple classifier reads the comment and labels it *positive*, *mixed* or *negative*. When the words and the stars disagree, the writer is warned before sealing. |
| Reply | The reviewed person can answer each review once, publicly, under the review. |
| Helpful vote | A lightweight vote on a review, signed with the session approved at sign-in (no network fee, no prompt per click). Sorts reviews by usefulness; it does not change the score. |
| Flag and moderation | Anyone can flag a review (spam, harassment, off-topic, conflict of interest). A case opens for the community's five moderators; three matching votes decide. A hidden review stays on-chain (nothing can delete it) but is collapsed with the reason and left out of the score. |
| Activity trail | Every event for an address (reviews, replies, flags, moderation votes and outcomes) with time, block and transaction hash. |

**What the Lovable version got wrong or left out.**

- It was a generic blue-to-cyan gradient landing page with frosted cards: nothing Monark about it, and nothing that made "trust" tangible.
- Nothing worked. "Search reviews" did nothing, "Submit review" only logged to the console, profile cards and upvotes were decorative, and the reviewee address wasn't even validated.
- Every review counted the same, so one fresh wallet could post five stars for itself from a second wallet. The documented reputation scores and aggregation per address were absent, as were the moderation layer, sentiment analysis, filtering and the activity history.
- No wallet connection, no transaction states (pending, confirmed, failed), no replies, no way to find or open a profile.
- Sentiment was a hard-coded field, English only, no disclaimers, and a white "🚧" banner fixed over the content.

## 2. Value proposition

**TrustRate gives Monark communities a public, wallet-bound record of how past collaborations went, weighted towards reviews from people who really worked together and moderated in the open, so you can hand work to a pseudonymous contributor with the same confidence as to someone you've known for years.**

Supporting benefits, as outcomes:

1. **You know who delivered before you hand over the bounty.** A contributor's whole track record, across projects, in one place.
2. **Fake praise doesn't move the needle.** Reviews tied to a real payment or bounty count fully; a fresh wallet praising itself barely registers.
3. **Nobody can quietly rewrite history.** Reviews are sealed on-chain; disputes are settled by community moderators in the open, and every decision stays visible.

## 3. Hero

- **Headline** (8 words): *Know who delivered before you hand them the work.*
  FR: *Sachez qui a livré avant de confier le travail.*
- **Subheadline:** *TrustRate turns every bounty, gig and partnership in your community into a public review tied to a wallet, weighted towards people who really worked together.*
  FR: *TrustRate transforme chaque prime, mission et partenariat de votre communauté en un avis public lié à un portefeuille, qui pèse d'autant plus que la collaboration était réelle.*
- **Primary CTA:** "Launch the demo" / « Lancer la démo » → `/{locale}/app`.
- **Secondary CTA:** "See how a review counts" / « Comprendre le calcul » → `/{locale}/how-it-works`.
- **Visual:** a **live profile card**, built in code: Amara Okafor's profile (score dial, review count, verified count, rating bars). A new review from a verified bounty slides in, goes through *Signing → Sealing in block 5,812,344 → Sealed*, then the score dial settles from 4.2 to 4.3 and "9 reviews · 7 verified" ticks up to 10 · 8 (the same numbers the demo produces when you seal that review). It loops calmly (about 8 s). Product UI over a photo, because the product's promise is exactly this moment: evidence arrives, and the reputation moves only as much as it should. The mesh butterfly sits large and cropped behind it (see §8).

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`). `/` and any locale-less path redirect to the visitor's preferred language (fallback English) via `src/proxy.ts`.

| Route | Purpose | Sections, in order |
|-|-|-|
| `/{locale}` | Home: explain the idea in 30 seconds and send people into the demo. | Hero with live profile card · Three outcomes · "What makes a review count" (verified interaction, reviewer standing, open moderation), each with a small piece of real UI · Who relies on it (3 photo cards: student associations, contributors, local partners) · FAQ · Closing call to action |
| `/{locale}/app` | Demo: explore the community's reputation. | Connect gate (when disconnected) · App bar (Explore, My reputation, Moderation with open-case count, Write a review) · Search (name or address) · Community members (sortable by score or reviews) · Latest reviews feed (all / verified only) |
| `/{locale}/app/profile/[address]` | One address's reputation. Any valid address works; unknown ones show an empty profile. | Identity (avatar, name, role, address with copy, member since) · Score panel (dial, confidence, rating bars, sentiment mix, top tags) · "How this score is calculated" (per-review weights) · Actions (write a review, or "This is you") · Tabs: Reviews received (filter, sort) · Reviews given · Activity trail |
| `/{locale}/app/write` | Write and seal a review (`?to=` preselects the subject). | Who (address or pick a member) · The interaction you're reviewing (verified list or "no on-chain interaction") · Rating · Tags · Comment with live sentiment and mismatch warning · Live preview with the weight it will carry · Seal |
| `/{locale}/app/moderation` | The community moderation queue. | How moderation works (one line) · Open cases (flagged review, reason, votes so far, your vote) · Resolved cases (outcome, votes, block) · Empty state |
| `/{locale}/how-it-works` | For students, developers and careful organisers: the mechanics. Justified because Monark's audience includes students learning how the contract works, and because trust needs the formula to be public. | Intro · The life of a review (diagram) · What makes a review count (weights, formula, worked example) · When the community steps in (moderation diagram) · Replies and the activity trail · For developers (contract interface + how the demo's data layer mirrors it) · Call to action |
| `/{locale}/credits` | Photo, font and icon credits (required by the asset rules). | Photos · Type and icons · Monark brand assets |
| `/{locale}/pricing` | **Internal strategy review only.** Never linked, excluded from the sitemap, `noindex, nofollow`. | Price card "Free, part of Monark" · What it costs to use · For partners · Reasoning |
| 404 | Friendly not-found with the vertical Monark logo and links home and to the demo. | |

**Header** (the approved standard Monark navbar, guidelines §2 and §10): butterfly mark + "TrustRate" on one line (no "by Monark"; aria-label "TrustRate, by Monark: home") → home · 28px gap · left-aligned links *Overview*, *How it works*, *Demo* (active in `foreground`) · right: Demo chip · EN/FR switch · theme toggle · primary *Launch demo*. Inside `/app` the primary action becomes the `connect-wallet` component. Below `lg`: brand + menu button; the sheet holds links, Demo chip, EN/FR, theme and the action. Inside the demo an app bar adds the network badge, the testnet notice, *Demo controls* and the section nav (Explore, My reputation, Moderation with its open-case count, Write a review).

**Footer** (three bands): product line + links (Overview, How it works, Demo, Credits) · "TrustRate is built by Monark", Monark logo + tagline, links to the project page on monark.io and the GitHub repo, social icons · "© {year} Monark · Open source", "Demo · simulated data", the testnet notice, photo credits link.

## 5. Feature highlights

| Feature | User benefit | Where it appears | Proven by flow |
|-|-|-|-|
| Wallet-bound profiles for any address | See anyone's track record before you work with them | Home hero; Explore; profile page | Flow 2 |
| Sealed, uneditable reviews | Nobody can quietly rewrite history | Home outcomes; review cards (block + hash); `/how-it-works` | Flow 3 |
| Weighted trust score with a public formula | Fake praise doesn't move the needle | Home "what counts"; profile "How this score is calculated"; composer preview | Flows 2, 3 |
| Sentiment check before sealing | Stars and words tell the same story | Composer; review cards | Flow 3 |
| Replies and helpful votes | Both sides are heard; the most useful reviews rise | Profile (your own) | Flow 4 |
| Open community moderation | Abuse gets hidden without anyone being able to delete evidence | Home "what counts"; moderation queue; `/how-it-works` | Flow 5 |

## 6. Key flows

Every write goes through a simulated wallet prompt ("Confirm in your wallet": action summary, network, estimated network fee, the testnet notice, *Confirm* / *Reject*), then a pending state with a transaction hash (1.2 to 2.4 s; 3 to 6 s with "slow network"), then confirmed (with a block number) or failed. The demo controls can make the next transaction fail on-chain, and rejecting in the prompt always produces the "rejected" failure.

1. **Connect a wallet.** Visitor opens `/app` → "Connect demo wallet" → prompt "Sign in to TrustRate" (a signed message, no fee; it also approves a voting session) → *pending* ("Waiting for signature…") → *connected*: the header shows the `connect-wallet` chip (Jazzicon + `0x5a1C…7e2B`, "Sam Rivera"). *Failed*: rejecting shows "You declined the sign-in request. Nothing was shared." with a retry.
2. **Look someone up.** Explore → type "amara" or paste an address → results filter live → open Amara Okafor's profile: score 4.2 (plain average 4.6, pulled down by the prior and a low-weight spam review), *Solid*, rating bars, sentiment mix, top tags → open "How this score is calculated" to see each review's weight. *Error*: an invalid address shows "That isn't a wallet address. Addresses start with 0x followed by 40 letters and numbers." *Empty*: a valid address nobody has reviewed opens an empty profile: "No reviews yet for this address. If you've worked with them, you can write the first one."
3. **Write and seal a review.** From Amara's profile → *Write a review* → the subject is prefilled; pick the verified interaction "Bounty #231 · Smart contract for the ticketing club · 1,200 tUSDC" → 5 stars → tags → comment. The sentiment line reads the text live; if the words disagree with the stars ("Your words sound negative but you gave 5 stars. Is that right?") it warns without blocking. The preview shows the card as it will appear and "Counts fully: verified interaction, established reviewer" → *Seal review* → prompt → *pending* ("Sealing your review…", hash) → *confirmed*: redirect to the profile, the review appears at the top with its seal stamp and the score dial settles to the new value. *Failed*: "The network rejected the transaction. Nothing was written, and your draft is still here." with *Try again*. Validation: can't review yourself, one review per interaction, rating required, 40 to 600 characters, at most three tags.
4. **Reply and vote helpful.** *My reputation* → Café Lumen's 3-star review of you ("Paid three weeks late…") → *Reply* → write → prompt → *pending* → *confirmed*: the reply appears under the review, marked "Reply from the reviewed address". On another review, *Helpful* → short pending on the button → count increases (session vote, no prompt). *Failed* variants as above; a failed helpful vote reverts the count with a message.
5. **Flag and moderate.** On a spammy five-star review of Amara from a two-day-old wallet → *Flag* → reason "Spam or self-promotion" + note → prompt → *pending* → *confirmed*: "Flag recorded. Moderators have been notified." → *Moderation* (badge shows 2 open cases) → the case shows the review, the reason, the reviewer's standing and a three-slot tally per outcome → *Vote to hide* → prompt → *pending* → *confirmed*: your vote is counted; the other moderators' votes arrive one by one (Diego, then Priya) → at 3 matching votes the case resolves: "Hidden by community moderation (3 of 5 moderators)". On Amara's profile the review is collapsed with the reason and a *Show anyway* toggle, and it no longer counts in the score. *Empty*: "No open cases. The community is behaving." 

## 7. Content (EN / FR)

The shipped copy lives in `src/i18n/dictionaries/en.ts` and `fr.ts` (typed; French must satisfy the English shape). Seeded demo data (names, reviews, replies) is written natively in both languages in `src/lib/demo/seed.ts`. The main sections:

### Home

| Slot | English | Français |
|-|-|-|
| Eyebrow | Reputation module · Monark | Module de réputation · Monark |
| H1 | Know who delivered before you hand them the work. | Sachez qui a livré avant de confier le travail. |
| Sub | TrustRate turns every bounty, gig and partnership in your community into a public review tied to a wallet, weighted towards people who really worked together. | TrustRate transforme chaque prime, mission et partenariat de votre communauté en un avis public lié à un portefeuille, qui pèse d'autant plus que la collaboration était réelle. |
| CTAs | Launch the demo · See how a review counts | Lancer la démo · Comprendre le calcul |
| Outcomes H2 | Trust, without knowing everyone personally | La confiance, sans connaître tout le monde |
| Outcome 1 | **Know who delivered.** A contributor's whole track record, across projects, in one place, before you hand over the bounty. | **Sachez qui a livré.** Tout le parcours d'un contributeur, d'un projet à l'autre, au même endroit, avant de confier la prime. |
| Outcome 2 | **Fake praise doesn't move the needle.** Reviews tied to a real payment count fully; a fresh wallet praising itself barely registers. | **Les faux éloges ne pèsent rien.** Un avis lié à un vrai paiement compte pleinement ; un portefeuille tout neuf qui se félicite lui-même ne change presque rien. |
| Outcome 3 | **Nobody can quietly rewrite history.** Reviews are sealed on-chain, and disputes are settled by moderators in the open. | **Personne ne réécrit l'histoire en douce.** Les avis sont scellés on-chain, et les litiges sont tranchés au grand jour par les modérateurs. |
| Counts H2 | What makes a review count | Ce qui donne du poids à un avis |
| Verified | **Tied to real work.** Link a review to the bounty, milestone or payment it's about and it carries full weight. Without one, it counts for 40%. | **Lié à un vrai travail.** Rattachez l'avis à la prime, au jalon ou au paiement concerné : il compte pleinement. Sans lien, il compte pour 40 %. |
| Standing | **Written by someone with a record.** Reviewers with at least two verified interactions count fully; brand-new wallets count for 60%. | **Écrit par quelqu'un qui a un historique.** Les évaluateurs qui comptent au moins deux interactions vérifiées pèsent pleinement ; les portefeuilles tout neufs, pour 60 %. |
| Moderation | **Moderated in the open.** Flagged reviews go to five community moderators. Three votes decide, and hidden reviews stay on-chain for anyone to check. | **Modéré au grand jour.** Les avis signalés passent devant cinq modérateurs de la communauté. Trois votes suffisent, et un avis masqué reste on-chain, consultable par tous. |
| Who H2 | For everyone who works with people they've never met | Pour tous ceux qui travaillent avec des gens jamais rencontrés |
| Student associations | Hire the designer or developer for your next bounty from their track record, not a hunch. | Choisissez le graphiste ou le développeur de votre prochaine prime sur son parcours, pas sur une impression. |
| Contributors | Take your reputation from one project to the next. Your wallet carries the record. | Emportez votre réputation d'un projet à l'autre : c'est votre portefeuille qui la porte. |
| Local partners | The café that hosts your meetups gets a fair record too, and can review you back. | Le café qui accueille vos rencontres a lui aussi un dossier équitable, et peut vous évaluer en retour. |
| Closing | Look someone up in the demo. It takes ten seconds. / Launch the demo | Consultez un profil dans la démo. Dix secondes suffisent. / Lancer la démo |

**FAQ**

1. *Is this real?* No. It's a testnet demo with simulated data: no real wallet, no real network, nothing leaves your browser. / *Est-ce réel ?* Non. C'est une démo sur testnet avec des données simulées : aucun vrai portefeuille, aucun vrai réseau, rien ne quitte votre navigateur.
2. *Can a review be edited or deleted?* No. A review is sealed on-chain (written to the blockchain for good). You can't edit it, but the reviewed person can reply, and moderators can hide it from view if it breaks the community rules. / *Peut-on modifier ou supprimer un avis ?* Non. Un avis est scellé on-chain (inscrit pour de bon sur la blockchain). On ne peut pas le modifier, mais la personne évaluée peut répondre, et les modérateurs peuvent le masquer s'il enfreint les règles de la communauté.
3. *What stops someone from reviewing themselves from a second wallet?* Nothing stops them from posting, but it barely counts: with no real interaction and no record, the review carries 24% of the weight of a verified one, and it can be flagged. / *Qu'est-ce qui empêche quelqu'un de s'évaluer avec un second portefeuille ?* Rien ne l'empêche de publier, mais l'avis ne pèse presque rien : sans vraie interaction ni historique, il compte pour 24 % d'un avis vérifié, et il peut être signalé.
4. *Who are the moderators?* Five members elected by the community for a term, through the Monark governance module. Three matching votes decide a case, and every vote is public. / *Qui sont les modérateurs ?* Cinq membres élus par la communauté pour un mandat, via le module de gouvernance de Monark. Trois votes concordants tranchent un dossier, et chaque vote est public.
5. *Is my name stored on-chain?* Only your wallet address. Names in the demo are labels the community gives to known addresses; you can review and be reviewed without one. / *Mon nom est-il inscrit on-chain ?* Seule votre adresse de portefeuille l'est. Les noms de la démo sont des étiquettes que la communauté associe à des adresses connues ; on peut évaluer et être évalué sans nom.
6. *How is the sentiment worked out?* A small word-based classifier reads the comment in English or French. It never changes the score; it only warns you when your words and your stars disagree. / *Comment le ton est-il déterminé ?* Un petit classificateur fondé sur le vocabulaire lit le commentaire, en français ou en anglais. Il ne modifie jamais le score ; il vous avertit seulement quand vos mots et vos étoiles se contredisent.

### App: key strings

| Slot | English | Français |
|-|-|-|
| Connect gate | Connect a demo wallet to look people up, write reviews and moderate. Nothing is signed for real. | Connectez un portefeuille de démo pour consulter des profils, écrire des avis et modérer. Rien n'est signé pour de vrai. |
| Search | Search by name or paste an address | Chercher un nom ou coller une adresse |
| Invalid address | That isn't a wallet address. Addresses start with 0x followed by 40 letters and numbers. | Ce n'est pas une adresse de portefeuille. Une adresse commence par 0x, suivi de 40 lettres et chiffres. |
| No match | Nobody in this community matches "{q}". Paste their full address to open their profile. | Personne dans cette communauté ne correspond à « {q} ». Collez son adresse complète pour ouvrir son profil. |
| Empty profile | No reviews yet for this address. If you've worked with them, you can write the first one. | Aucun avis pour cette adresse. Si vous avez travaillé avec cette personne, vous pouvez écrire le premier. |
| Score confidence | Early · Growing · Solid | Débutant · En construction · Solide |
| Composer mismatch | Your words sound {tone} but you gave {n} stars. Is that right? | Vos mots semblent {tone}, mais vous avez donné {n} étoiles. Est-ce bien voulu ? |
| Permanent notice | Once sealed, a review can't be edited or deleted. | Une fois scellé, un avis ne peut être ni modifié ni supprimé. |
| Wallet prompt | Confirm in your wallet · Estimated network fee · Confirm · Reject | Confirmez dans votre portefeuille · Frais de réseau estimés · Confirmer · Refuser |
| Disclaimer | Testnet demo · not financial advice · no real funds | Démo sur testnet · ceci n'est pas un conseil financier · aucun fonds réel |
| Pending | Sealing your review… | Scellement de votre avis… |
| Sealed | Sealed in block {block} | Scellé dans le bloc {block} |
| Failed (reverted) | The network rejected the transaction. Nothing was written, and your draft is still here. | Le réseau a rejeté la transaction. Rien n'a été inscrit, et votre brouillon est toujours là. |
| Rejected | You rejected the request in your wallet. Nothing was sent. | Vous avez refusé la demande dans votre portefeuille. Rien n'a été envoyé. |
| Hidden review | Hidden by community moderation: {reason}. It stays on-chain and no longer counts in the score. | Masqué par la modération : {reason}. L'avis reste on-chain et ne compte plus dans le score. |
| Moderation empty | No open cases. The community is behaving. | Aucun dossier ouvert. La communauté se tient bien. |
| Activity empty | Nothing has happened for this address yet. | Il ne s'est encore rien passé pour cette adresse. |
| Storage error | Your browser blocked local storage, so the demo will forget changes when you leave. | Votre navigateur bloque le stockage local : la démo oubliera vos changements à la fermeture. |

The complete list (validation messages, demo controls, tabs, toasts, how-it-works and credits copy) is in the dictionaries.

## 8. Aesthetics (within the Monark guidelines)

Colour, type, logo, header and footer are fixed by the guidelines: cream / espresso tokens derived from `#f88d10` with `--surface-tint: 1` (the §3 token block pasted over the registry `theme.json`), Nunito Sans 400/600/700/800, pill actions, 1rem cards, borders rather than shadows, flat orange only.

- **Layout and rhythm.** Home alternates statement bands and evidence bands: hero (copy left, live profile card right on desktop; stacked on mobile) → outcomes (three columns, icons top-left) → "what makes a review count" (three cards, each containing a real fragment of UI: a verified-interaction chip, a weight bar, a moderation tally) → photo cards → FAQ (single column, 68ch) → closing band. The branded section divider appears twice. The app is a working tool: an app bar under the header, a dense two-column profile on desktop (score panel sticky on the left, reviews on the right), single column on mobile, generous touch targets.
- **Hero visual.** The live profile card (see §3).
- **Mesh butterfly.** Used once, on the home hero, large and cropped off the right edge at low opacity behind the card. Not used anywhere else. No gradients anywhere except inside the logo.
- **Illustrations.** No reused Monark decorative illustrations beyond the mesh butterfly. The site draws its own flat orange line art: the score dial (a semicircle gauge), "the life of a review" and "moderation" diagrams on `/how-it-works`, and the seal stamp (an outlined circle like the brand divider's end caps).
- **Photography direction.** Warm, natural-light photos of real people working together: contributors around a sticker-covered laptop, a small team reviewing a web project at a table, two café owners in their shop. Used only in the "who relies on it" section, always paired with a line of copy and a sample profile chip.
- **Stars.** Flat orange filled stars with `input`-coloured outlines for empty ones, always with the numeric value in text next to them.
- **Signature moments.**
  1. **The seal.** When a review confirms, its card gets stamped: an orange circle draws itself around a check, and "Sealed in block 5,812,344" and the hash fade in (hero loop and after sealing in the app).
  2. **The score settles.** The dial's needle and number move from the old score to the new one, and the matching rating bar grows, at a pace that says "weighted, not raw". A new wallet's review visibly moves it less.
  3. **The tally decides.** In a moderation case, the votes arrive one by one on a three-slot tally; when the third matching vote lands, the case resolves and the review collapses behind its reason.
- All motion 150 to 250 ms ease-out (the hero loop and dial are slower, explanatory), and everything respects `prefers-reduced-motion` (final states render directly).

## 9. Assets

| Asset | Purpose | Placement |
|-|-|-|
| `public/images/contributors.jpg` (Unsplash, Mapbox) | Contributors use case | Home "who relies on it" |
| `public/images/project-review.jpg` (Unsplash, Derek Coleman) | Student association hiring a freelancer | Home "who relies on it" |
| `public/images/cafe-partners.jpg` (Unsplash, Vitaly Gariev) | Local partner use case | Home "who relies on it" |
| `public/brand/*` Monark logos (standalone, horizontal light/dark, vertical light/dark) | Header pairing, footer, 404, favicon, wallet prompt | Shell |
| `public/brand/monark-mesh.svg` | Home hero decoration | Home hero only |
| `public/brand/socials/*.svg` | Footer social icons | Footer |
| Open Graph image | Generated with `next/og` per locale | Metadata |

Icons: Lucide only. Diagrams: built in JSX/SVG (score dial, seal stamp, review lifecycle, moderation tally). Full credits in `docs/assets.md` and on `/credits`.

## 10. Pricing strategy

TrustRate is **free, included in the Monark bundle.** Reasons:

- It is community infrastructure: the reputation layer behind Monark's trust contacts and network trust score. Its value grows with every community that uses it, so anything that discourages use shrinks the product.
- A fee to post or read reviews would make reputation look purchasable, the exact perception the product exists to fight.
- It is open source and a student learning project.

On a real network, sealing a review, replying, flagging or voting in moderation costs only the network fee (gas); helpful votes cost nothing. Organisations that want a supported deployment (their own moderator set, a custom chain, a reputation feed for their app) go through Monark's partnership programme, not a price list.

A designed `/{locale}/pricing` page exists **for internal review only**: not linked anywhere, excluded from `sitemap.xml`, `robots: { index: false, follow: false }`. No other page mentions prices.

## 11. Out of scope

- Real wallets, chains, signing or indexing (no wagmi/viem; the data layer in `src/lib/demo/` is shaped so it could be swapped in).
- Real AI sentiment analysis. The demo uses a small, transparent word list in English and French, and says so.
- Electing moderators, appeals, and moderation of replies. Moderators are a fixed seeded set of five; the demo wallet is one of them.
- ENS names, profile editing, avatars other than Jazzicons, notifications, cross-chain reputation, and a public API.
- Editing or deleting reviews (by design: they are sealed).
- A `/brand` page, a blog, or any backend.

## 12. Implementation notes (as shipped)

Decisions taken while working unattended:

- The sign-in message also approves a **voting session**, so helpful votes don't open a wallet prompt per click (as dapps with session keys do). Every other write (review, reply, flag, moderation vote) goes through the prompt.
- Reviews move no value, but each write pays a small (simulated) network fee, so the wallet prompt shows the testnet notice on every fee-paying action, and the composer shows it next to *Seal review*.
- Other moderators' votes are simulated: after your vote, the remaining seeded moderators vote in sequence (about 1.5 s apart) with the majority's outcome until the case reaches three matching votes.
- Toasts sit top-right on desktop (over the app bar's demo controls, never over the review, score or tally they report on) and at the bottom on phones. Validation errors are shown inline next to each field and under *Seal review*, never as a toast.
- The flagged-and-voted case stays in place in the queue for the rest of the visit, so the visitor watches the tally decide instead of the card jumping to "Decided".
- The sentiment word lists are phrase-aware ("paid late", not "late", so "stayed open late" isn't negative). Spam praise reads as *positive*, which is realistic: tone is a hint, moderation is the safeguard.
- Dependencies beyond the stack: `next-themes` (theme toggle without a flash), `sonner` (toasts), `react-jazzicon` (required by the registry `wallet`), `radix-ui` and `class-variance-authority` (registry components), `shadcn` (its Tailwind stylesheet); `playwright` as a dev dependency for `pnpm screenshots`. No recharts: the dial and bars are drawn in code.
- Profile and composer routes are rendered on demand (they read the address and query string); everything else is prerendered.
- `theme-2026.json` isn't published on ui.monark.io, so `theme.json` was installed and the guidelines' §3 token block pasted over it in `src/app/globals.css`, plus muted `--success` / `--warning` status colours (always paired with a text label).
