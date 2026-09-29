"use client"

import { ArrowRightIcon, CornerDownRightIcon, EyeOffIcon, FlagIcon, Loader2Icon, MessageSquareReplyIcon, ShieldAlertIcon, ThumbsUpIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { SentimentChip, TagChip, UnverifiedChip, VerifiedChip } from "@/components/trust/chips"
import { SealStamp } from "@/components/trust/seal-stamp"
import { Stars } from "@/components/trust/stars"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { sameAddress } from "@/lib/demo/network"
import { interactionById, toggleHelpful } from "@/lib/demo/ops"
import { isHidden, openCaseFor } from "@/lib/demo/score"
import { classify } from "@/lib/demo/sentiment"
import type { DemoState, Review } from "@/lib/demo/types"
import { formatBlock, formatDate, formatRelative, formatToken, shortHash } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { FlagDialog } from "./flag-dialog"
import { Identity, isYou, nameOf } from "./identity"
import { ReplyForm } from "./reply-form"

export type ReviewCardMode = "received" | "given" | "feed"

export function ReviewCard({
  state,
  review,
  mode = "received",
  fresh = false,
  className,
}: {
  state: DemoState
  review: Review
  mode?: ReviewCardMode
  /** Just sealed: the stamp draws itself. */
  fresh?: boolean
  className?: string
}) {
  const { app, locale } = useAppCopy()
  const r = app.review
  const [replying, setReplying] = useState(false)
  const [reveal, setReveal] = useState(false)
  const helpfulTx = useTx()

  const me = state.wallet.address
  const hidden = isHidden(state, review.id)
  const hiddenCase = hidden ? state.cases.find((c) => c.reviewId === review.id && c.status === "hidden") : null
  const flagged = openCaseFor(state, review.id)
  const interaction = interactionById(state, review.interactionId)
  const sentiment = classify(review.comment).label
  const aboutYou = sameAddress(review.to, me)
  const byYou = sameAddress(review.from, me)
  const votedHelpful = review.helpful.some((a) => sameAddress(a, me))
  const helpfulCount = review.helpful.length

  const person = mode === "given" ? review.to : review.from
  const headingId = `review-${review.id}`

  async function onHelpful() {
    const ok = await helpfulTx.run({ title: r.helpful, movesValue: false, noFee: true }, () => toggleHelpful(review.id, me), {
      skipPrompt: true,
      ms: 500 + Math.random() * 400,
    })
    if (!ok) toast.error(r.helpfulFailed)
    helpfulTx.reset()
  }

  if (hidden && !reveal) {
    return (
      <article aria-labelledby={headingId} className={cn("rounded-2xl border border-dashed bg-card/60 p-4 sm:p-5", className)}>
        <h3 id={headingId} className="sr-only">
          {t(r.by, { name: nameOf(state, review.from) })}
        </h3>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <EyeOffIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{t(r.hidden, { reason: hiddenCase ? app.reasons[hiddenCase.reason].toLowerCase() : "" })}</span>
          </p>
          <Button variant="ghost" size="sm" className="self-start sm:self-auto" onClick={() => setReveal(true)}>
            {r.showAnyway}
          </Button>
        </div>
      </article>
    )
  }

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        "rounded-2xl border bg-card p-4 transition-shadow duration-200 sm:p-5",
        fresh && "tr-in border-primary/70 ring-3 ring-primary/15",
        hidden && "border-dashed",
        className
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          {mode === "feed" ? (
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <Identity state={state} address={review.from} size={28} showRole={false} />
              <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <Identity state={state} address={review.to} size={28} showRole={false} />
            </div>
          ) : (
            <Identity state={state} address={person} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Stars value={review.rating} label={t(app.stars, { n: review.rating })} />
          <span className="text-sm font-bold tabular-nums">{review.rating}/5</span>
        </div>
        <h3 id={headingId} className="sr-only">
          {mode === "given" ? t(r.about, { name: nameOf(state, review.to) }) : t(r.by, { name: nameOf(state, review.from) })}
        </h3>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {interaction ? (
          <VerifiedChip
            label={t(r.verified, { ref: interaction.ref })}
            title={t(r.verifiedTitle, {
              title: interaction.title,
              amount: formatToken(interaction.amount, interaction.token, locale),
              date: formatDate(interaction.at, locale),
            })}
          />
        ) : (
          <UnverifiedChip label={r.unverified} />
        )}
        <SentimentChip sentiment={sentiment} label={app.sentiment[sentiment]} />
        {review.tags.map((tag) => (
          <TagChip key={tag} label={app.tags[tag]} />
        ))}
      </div>

      {interaction ? <p className="mt-2 text-xs text-muted-foreground">{interaction.title}</p> : null}

      <p className="mt-3 max-w-[68ch] leading-relaxed">{review.comment}</p>

      {hidden ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <EyeOffIcon className="size-3.5" aria-hidden="true" />
          {t(r.hidden, { reason: hiddenCase ? app.reasons[hiddenCase.reason].toLowerCase() : "" })}
          <Button variant="link" size="sm" className="text-xs" onClick={() => setReveal(false)}>
            {r.hideAgain}
          </Button>
        </div>
      ) : null}

      {review.reply ? (
        <div className="mt-4 flex gap-2 rounded-xl bg-secondary/60 p-3.5">
          <CornerDownRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-bold">
              {r.replyFrom} · {nameOf(state, review.to)}
            </p>
            <p className="mt-1 text-sm leading-relaxed">{review.reply.text}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t(r.sealedIn, { block: formatBlock(review.reply.block, locale) })} · {formatRelative(review.reply.at, locale)}
            </p>
          </div>
        </div>
      ) : null}

      {replying ? (
        <ReplyForm state={state} review={review} onDone={() => setReplying(false)} className="mt-4" />
      ) : null}

      <footer className="mt-4 flex flex-col gap-3 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <SealStamp size={16} animate={fresh} />
            {t(r.sealedIn, { block: formatBlock(review.block, locale) })}
          </span>
          <span aria-hidden="true">·</span>
          <time dateTime={review.at} title={formatDate(review.at, locale)}>
            {formatRelative(review.at, locale)}
          </time>
          <span aria-hidden="true">·</span>
          <span className="font-mono" title={review.hash}>
            {shortHash(review.hash)}
          </span>
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {flagged ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">
              <ShieldAlertIcon className="size-3.5" aria-hidden="true" />
              {r.flagged}
            </span>
          ) : null}
          <Button
            variant={votedHelpful ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={votedHelpful}
            aria-label={`${votedHelpful ? r.unmarkHelpful : r.markHelpful} (${helpfulCount})`}
            disabled={helpfulTx.busy || byYou}
            onClick={() => void onHelpful()}
            className={cn(votedHelpful && "border-primary/60")}
          >
            {helpfulTx.busy ? (
              <Loader2Icon className="animate-spin" aria-hidden="true" />
            ) : (
              <ThumbsUpIcon className={cn(votedHelpful && "fill-primary/30")} aria-hidden="true" />
            )}
            <span aria-hidden="true">{helpfulCount ? t(r.helpfulCount, { n: helpfulCount }) : r.helpful}</span>
          </Button>
          {aboutYou && mode !== "feed" && !review.reply && !replying && !hidden ? (
            <Button variant="outline" size="sm" onClick={() => setReplying(true)}>
              <MessageSquareReplyIcon aria-hidden="true" />
              {r.reply}
            </Button>
          ) : null}
          {!byYou && !aboutYou && !flagged && !hidden && !isYou(state, review.from) ? (
            <FlagDialog state={state} review={review}>
              <Button variant="ghost" size="sm">
                <FlagIcon aria-hidden="true" />
                {r.flag}
              </Button>
            </FlagDialog>
          ) : null}
        </div>
      </footer>
    </article>
  )
}
