import { CircleDashedIcon, FrownIcon, MehIcon, SmileIcon } from "lucide-react"

import type { Sentiment } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { SealStamp } from "./seal-stamp"

const chip = "inline-flex h-7 max-w-full items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold"

/** "Verified · Bounty #198": the review is tied to a real interaction. */
export function VerifiedChip({ label, title, className }: { label: string; title?: string; className?: string }) {
  return (
    <span title={title} className={cn(chip, "border-primary/50 bg-card text-foreground", className)}>
      <SealStamp size={16} />
      <span className="truncate">{label}</span>
    </span>
  )
}

export function UnverifiedChip({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn(chip, "border-dashed border-input text-muted-foreground", className)}>
      <CircleDashedIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  )
}

const SENTIMENT_ICON = { positive: SmileIcon, mixed: MehIcon, negative: FrownIcon } as const
const SENTIMENT_TONE = {
  positive: "text-success",
  mixed: "text-muted-foreground",
  negative: "text-destructive",
} as const

/** Tone label with an icon, always in text (never colour alone). */
export function SentimentChip({ sentiment, label, className }: { sentiment: Sentiment; label: string; className?: string }) {
  const Icon = SENTIMENT_ICON[sentiment]
  return (
    <span className={cn(chip, "border-transparent bg-secondary text-foreground", className)}>
      <Icon className={cn("size-3.5 shrink-0", SENTIMENT_TONE[sentiment])} aria-hidden="true" />
      {label}
    </span>
  )
}

export function TagChip({ label, className }: { label: string; className?: string }) {
  return <span className={cn(chip, "border-border bg-transparent text-muted-foreground", className)}>{label}</span>
}
