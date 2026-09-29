/**
 * Domain types for the TrustRate demo. Everything the UI knows about
 * profiles, reviews, moderation and transactions goes through these shapes,
 * so the simulated layer in this folder could be replaced by wagmi/viem calls
 * and an indexer without UI changes.
 */

export type Locale = "en" | "fr"

export type TokenSymbol = "tUSDC" | "tDAI" | "tETH"

export type Rating = 1 | 2 | 3 | 4 | 5

export const TAG_IDS = [
  "smart-contracts",
  "security",
  "frontend",
  "design",
  "docs",
  "translation",
  "mentoring",
  "events",
  "community",
  "on-time",
  "communication",
  "payments",
] as const
export type TagId = (typeof TAG_IDS)[number]

export type Sentiment = "positive" | "mixed" | "negative"

/** A labelled address the community knows. Any other address still has a profile. */
export interface Member {
  address: string
  name: string
  role: string
  /** ISO date of the address's first on-chain activity in the community. */
  since: string
  moderator?: boolean
  partner?: boolean
}

export type InteractionKind = "bounty" | "milestone" | "payout" | "invoice" | "sponsorship"

/** A real on-chain interaction between two wallets that a review can be tied to. */
export interface Interaction {
  id: string
  kind: InteractionKind
  /** The paying side. */
  from: string
  /** The paid side. */
  to: string
  /** Short reference shown on review cards, e.g. "Bounty #231". */
  ref: string
  title: string
  amount: number
  token: TokenSymbol
  at: string
  hash: string
}

export interface Reply {
  text: string
  at: string
  hash: string
  block: number
}

export interface Review {
  id: string
  from: string
  to: string
  rating: Rating
  comment: string
  tags: TagId[]
  /** Verified when tied to an interaction between the two wallets. */
  interactionId: string | null
  at: string
  hash: string
  block: number
  /** Addresses that voted this review helpful. */
  helpful: string[]
  reply: Reply | null
}

export type FlagReason = "spam" | "harassment" | "off-topic" | "conflict"
export type ModVote = "hide" | "keep"

export interface CaseVote {
  moderator: string
  vote: ModVote
  at: string
  hash: string
}

export interface ModerationCase {
  id: string
  reviewId: string
  reason: FlagReason
  note: string
  flaggedBy: string
  openedAt: string
  hash: string
  block: number
  votes: CaseVote[]
  status: "open" | "hidden" | "kept"
  resolvedAt?: string
  resolvedBlock?: number
  /** How the other (simulated) moderators lean on this case. */
  lean: ModVote
}

export type WalletStatus = "disconnected" | "connecting" | "connected"

export interface WalletState {
  status: WalletStatus
  address: string
  name: string
  lastError: "rejected" | null
}

export interface DemoSettings {
  slow: boolean
  failNext: boolean
}

export interface DemoState {
  version: 1
  seededLocale: Locale
  /** Current simulated block height. */
  head: number
  wallet: WalletState
  members: Member[]
  interactions: Interaction[]
  reviews: Review[]
  cases: ModerationCase[]
  settings: DemoSettings
}

/** Lifecycle of one simulated transaction, as the UI sees it. */
export type TxPhase = "idle" | "signing" | "pending" | "confirmed" | "failed"
export type TxError = "rejected" | "reverted"

export interface TxState {
  phase: TxPhase
  hash?: string
  block?: number
  error?: TxError
}

export interface TxSummary {
  /** Short title, e.g. "Seal a review of Amara Okafor". */
  title: string
  rows?: { label: string; value: string }[]
  /** Transactions paying a network fee show the testnet disclaimer. */
  movesValue: boolean
  /** Off-chain signature (sign-in): no network fee row. */
  noFee?: boolean
}
