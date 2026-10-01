import { sameAddress } from "./network"
import { classify } from "./sentiment"
import type { DemoState, Rating, Review, Sentiment, TagId } from "./types"

/**
 * The TrustRate score, as the contract's view function would compute it.
 * Public on purpose: the profile page shows every review's weight.
 *
 *   weight = interaction factor × standing factor
 *     interaction: 1.0 when tied to a real interaction between the wallets, 0.4 otherwise
 *     standing:    1.0 for reviewers with at least two verified interactions, 0.6 otherwise
 *   score  = (Σ weight × rating + PRIOR_WEIGHT × PRIOR) / (Σ weight + PRIOR_WEIGHT)
 */

export const VERIFIED_FACTOR = 1
export const UNVERIFIED_FACTOR = 0.4
export const ESTABLISHED_FACTOR = 1
export const NEW_FACTOR = 0.6
export const PRIOR = 3
export const PRIOR_WEIGHT = 2
export const ESTABLISHED_MIN_INTERACTIONS = 2

export type Standing = "established" | "new"
export type Confidence = "early" | "growing" | "solid"

export function isHidden(state: DemoState, reviewId: string): boolean {
  return state.cases.some((c) => c.reviewId === reviewId && c.status === "hidden")
}

export function openCaseFor(state: DemoState, reviewId: string) {
  return state.cases.find((c) => c.reviewId === reviewId && c.status === "open") ?? null
}

export function interactionCount(state: DemoState, address: string): number {
  return state.interactions.filter((i) => sameAddress(i.from, address) || sameAddress(i.to, address)).length
}

export function standingOf(state: DemoState, address: string): Standing {
  return interactionCount(state, address) >= ESTABLISHED_MIN_INTERACTIONS ? "established" : "new"
}

export interface Weighted {
  review: Review
  verified: boolean
  standing: Standing
  weight: number
}

export function weigh(state: DemoState, review: Review): Weighted {
  const verified = review.interactionId !== null
  const standing = standingOf(state, review.from)
  const weight = (verified ? VERIFIED_FACTOR : UNVERIFIED_FACTOR) * (standing === "established" ? ESTABLISHED_FACTOR : NEW_FACTOR)
  return { review, verified, standing, weight }
}

/** Weight a not-yet-sealed review would carry. */
export function previewWeight(state: DemoState, from: string, verified: boolean): number {
  const standing = standingOf(state, from)
  return (verified ? VERIFIED_FACTOR : UNVERIFIED_FACTOR) * (standing === "established" ? ESTABLISHED_FACTOR : NEW_FACTOR)
}

export function scoreFrom(entries: { rating: number; weight: number }[]): number {
  const sw = entries.reduce((s, e) => s + e.weight, 0)
  const swr = entries.reduce((s, e) => s + e.weight * e.rating, 0)
  return (swr + PRIOR_WEIGHT * PRIOR) / (sw + PRIOR_WEIGHT)
}

export function confidenceOf(totalWeight: number): Confidence {
  if (totalWeight < 3) return "early"
  if (totalWeight < 7) return "growing"
  return "solid"
}

export interface Reputation {
  address: string
  received: Review[]
  visible: Weighted[]
  hidden: Review[]
  score: number | null
  rawAverage: number | null
  totalWeight: number
  confidence: Confidence
  verifiedCount: number
  distribution: Record<Rating, number>
  sentiment: Record<Sentiment, number>
  topTags: { tag: TagId; count: number }[]
  given: Review[]
}

export function reputationOf(state: DemoState, address: string): Reputation {
  const received = state.reviews
    .filter((r) => sameAddress(r.to, address))
    .sort((a, b) => b.at.localeCompare(a.at))
  const visible = received.filter((r) => !isHidden(state, r.id)).map((r) => weigh(state, r))
  const hidden = received.filter((r) => isHidden(state, r.id))
  const totalWeight = visible.reduce((s, w) => s + w.weight, 0)
  const distribution: Record<Rating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const sentiment: Record<Sentiment, number> = { positive: 0, mixed: 0, negative: 0 }
  const tagCounts = new Map<TagId, number>()
  for (const w of visible) {
    distribution[w.review.rating] += 1
    sentiment[classify(w.review.comment).label] += 1
    for (const t of w.review.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1)
  }
  const topTags = [...tagCounts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
  const given = state.reviews.filter((r) => sameAddress(r.from, address)).sort((a, b) => b.at.localeCompare(a.at))

  return {
    address,
    received,
    visible,
    hidden,
    score: visible.length ? scoreFrom(visible.map((w) => ({ rating: w.review.rating, weight: w.weight }))) : null,
    rawAverage: visible.length ? visible.reduce((s, w) => s + w.review.rating, 0) / visible.length : null,
    totalWeight,
    confidence: confidenceOf(totalWeight),
    verifiedCount: visible.filter((w) => w.verified).length,
    distribution,
    sentiment,
    topTags,
    given,
  }
}

/** Score to one decimal, floored at 1 and capped at 5. */
export function roundScore(score: number): number {
  return Math.min(5, Math.max(1, Math.round(score * 10) / 10))
}
