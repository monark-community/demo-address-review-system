"use client"

import { sleep } from "./chain"
import { randomHash, randomId } from "./ids"
import { sameAddress } from "./network"
import { standingOf } from "./score"
import { getDemo, nextBlock, update } from "./store"
import type { DemoState, FlagReason, Interaction, Member, ModVote, Rating, TagId } from "./types"

/** Matching moderator votes needed to decide a case (out of five moderators). */
export const QUORUM = 3

/* ---------------------------------------------------------------------------
 * Reads
 * ------------------------------------------------------------------------ */

export function memberOf(state: DemoState, address: string): Member | null {
  return state.members.find((m) => sameAddress(m.address, address)) ?? null
}

export function moderators(state: DemoState): Member[] {
  return state.members.filter((m) => m.moderator)
}

export function interactionById(state: DemoState, id: string | null): Interaction | null {
  if (!id) return null
  return state.interactions.find((i) => i.id === id) ?? null
}

/** Interactions between two wallets, newest first, with whether `from` already reviewed each one. */
export function interactionsBetween(state: DemoState, from: string, to: string) {
  return state.interactions
    .filter(
      (i) =>
        (sameAddress(i.from, from) && sameAddress(i.to, to)) || (sameAddress(i.from, to) && sameAddress(i.to, from))
    )
    .sort((a, b) => b.at.localeCompare(a.at))
    .map((i) => ({
      interaction: i,
      reviewed: state.reviews.some((r) => r.interactionId === i.id && sameAddress(r.from, from)),
    }))
}

/** True when `from` already sealed an unverified review of `to` (one per pair). */
export function hasUnverifiedReview(state: DemoState, from: string, to: string): boolean {
  return state.reviews.some((r) => r.interactionId === null && sameAddress(r.from, from) && sameAddress(r.to, to))
}

export type ActivityKind =
  | "review_received"
  | "review_given"
  | "reply_posted"
  | "reply_received"
  | "flagged"
  | "mod_vote"
  | "case_resolved"

export interface ActivityEntry {
  id: string
  kind: ActivityKind
  at: string
  block: number
  hash: string
  /** The other party (reviewer, reviewee, case). */
  other?: string
  rating?: Rating
  vote?: ModVote
  outcome?: "hidden" | "kept"
  reason?: FlagReason
}

/** Every event touching an address, newest first. Derived from reviews and cases. */
export function activityOf(state: DemoState, address: string): ActivityEntry[] {
  const out: ActivityEntry[] = []
  for (const r of state.reviews) {
    if (sameAddress(r.to, address)) out.push({ id: `rr-${r.id}`, kind: "review_received", at: r.at, block: r.block, hash: r.hash, other: r.from, rating: r.rating })
    if (sameAddress(r.from, address)) out.push({ id: `rg-${r.id}`, kind: "review_given", at: r.at, block: r.block, hash: r.hash, other: r.to, rating: r.rating })
    if (r.reply) {
      if (sameAddress(r.to, address)) out.push({ id: `rp-${r.id}`, kind: "reply_posted", at: r.reply.at, block: r.reply.block, hash: r.reply.hash, other: r.from })
      if (sameAddress(r.from, address)) out.push({ id: `rq-${r.id}`, kind: "reply_received", at: r.reply.at, block: r.reply.block, hash: r.reply.hash, other: r.to })
    }
  }
  for (const c of state.cases) {
    const review = state.reviews.find((r) => r.id === c.reviewId)
    if (sameAddress(c.flaggedBy, address)) out.push({ id: `fl-${c.id}`, kind: "flagged", at: c.openedAt, block: c.block, hash: c.hash, other: review?.to, reason: c.reason })
    for (const v of c.votes) {
      if (sameAddress(v.moderator, address)) out.push({ id: `mv-${c.id}-${v.hash}`, kind: "mod_vote", at: v.at, block: c.block, hash: v.hash, other: review?.to, vote: v.vote })
    }
    if (c.status !== "open" && c.resolvedAt && review && (sameAddress(review.to, address) || sameAddress(review.from, address))) {
      out.push({ id: `cr-${c.id}`, kind: "case_resolved", at: c.resolvedAt, block: c.resolvedBlock ?? c.block, hash: c.votes.at(-1)?.hash ?? c.hash, outcome: c.status, reason: c.reason, other: review.to })
    }
  }
  return out.sort((a, b) => b.at.localeCompare(a.at) || b.block - a.block)
}

/* ---------------------------------------------------------------------------
 * Writes (applied once the simulated transaction confirms)
 * ------------------------------------------------------------------------ */

export interface ReviewDraft {
  from: string
  to: string
  rating: Rating
  comment: string
  tags: TagId[]
  interactionId: string | null
}

export function addReview(draft: ReviewDraft, hash: string, block: number): string {
  const id = randomId("r")
  update((s) => ({
    ...s,
    reviews: [
      ...s.reviews,
      { id, ...draft, comment: draft.comment.trim(), at: new Date().toISOString(), hash, block, helpful: [], reply: null },
    ],
  }))
  return id
}

export function addReply(reviewId: string, text: string, hash: string, block: number) {
  update((s) => ({
    ...s,
    reviews: s.reviews.map((r) =>
      r.id === reviewId ? { ...r, reply: { text: text.trim(), at: new Date().toISOString(), hash, block } } : r
    ),
  }))
}

export function toggleHelpful(reviewId: string, voter: string) {
  update((s) => ({
    ...s,
    reviews: s.reviews.map((r) => {
      if (r.id !== reviewId) return r
      const has = r.helpful.some((a) => sameAddress(a, voter))
      return { ...r, helpful: has ? r.helpful.filter((a) => !sameAddress(a, voter)) : [...r.helpful, voter] }
    }),
  }))
}

export function openCase(
  input: { reviewId: string; reason: FlagReason; note: string; flaggedBy: string },
  hash: string,
  block: number
): string {
  const id = `case-${Math.floor(13 + Math.random() * 80)}-${randomId("c").slice(2, 6)}`
  update((s) => {
    const review = s.reviews.find((r) => r.id === input.reviewId)
    // The other moderators lean towards hiding low-evidence reviews from new wallets.
    const lean: ModVote =
      review && review.interactionId === null && standingOf(s, review.from) === "new" ? "hide" : "keep"
    return {
      ...s,
      cases: [
        { id, ...input, note: input.note.trim(), openedAt: new Date().toISOString(), hash, block, votes: [], status: "open", lean },
        ...s.cases,
      ],
    }
  })
  return id
}

function tally(votes: { vote: ModVote }[]) {
  return {
    hide: votes.filter((v) => v.vote === "hide").length,
    keep: votes.filter((v) => v.vote === "keep").length,
  }
}

/** Record one moderator's vote; resolves the case at QUORUM matching votes. */
export function castVote(caseId: string, moderator: string, vote: ModVote, hash: string, block: number) {
  update((s) => ({
    ...s,
    cases: s.cases.map((c) => {
      if (c.id !== caseId || c.status !== "open") return c
      if (c.votes.some((v) => sameAddress(v.moderator, moderator))) return c
      const votes = [...c.votes, { moderator, vote, at: new Date().toISOString(), hash }]
      const t = tally(votes)
      if (t.hide >= QUORUM || t.keep >= QUORUM) {
        return { ...c, votes, status: t.hide >= QUORUM ? "hidden" : "kept", resolvedAt: new Date().toISOString(), resolvedBlock: block }
      }
      return { ...c, votes }
    }),
  }))
}

const running = new Set<string>()

/**
 * The other moderators vote in turn (about 1.5 s apart) until the case is
 * decided. Runs outside React so it continues across page changes.
 */
export async function simulateOtherModerators(caseId: string, you: string) {
  if (running.has(caseId)) return
  running.add(caseId)
  try {
    for (let guard = 0; guard < 5; guard++) {
      await sleep(1300 + Math.random() * 600)
      const s = getDemo()
      const c = s?.cases.find((x) => x.id === caseId)
      if (!s || !c || c.status !== "open") return
      const next = moderators(s).find(
        (m) => !sameAddress(m.address, you) && !c.votes.some((v) => sameAddress(v.moderator, m.address))
      )
      if (!next) return
      castVote(caseId, next.address, c.lean, randomHash(), nextBlock())
    }
  } finally {
    running.delete(caseId)
  }
}
