"use client"

import { CheckIcon, EyeIcon, EyeOffIcon, FlagIcon, Loader2Icon, ShieldCheckIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { WalletAvatar } from "@/components/ui/wallet"
import { UnverifiedChip, VerifiedChip } from "@/components/trust/chips"
import { Stars } from "@/components/trust/stars"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { sameAddress } from "@/lib/demo/network"
import { castVote, interactionById, moderators, QUORUM, simulateOtherModerators } from "@/lib/demo/ops"
import { standingOf } from "@/lib/demo/score"
import { useDemo } from "@/lib/demo/store"
import type { DemoState, ModerationCase, ModVote } from "@/lib/demo/types"
import { formatBlock, formatRelative } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { Identity, nameOf } from "./identity"

export function ModerationView() {
  const demo = useDemo()
  const { app } = useAppCopy()
  const m = app.moderation
  // Cases you voted on this visit stay in place so you can watch the tally decide.
  const [pinned, setPinned] = useState<string[]>([])

  if (!demo) return null
  const mods = moderators(demo)
  const open = demo.cases.filter((c) => c.status === "open" || pinned.includes(c.id))
  const resolved = demo.cases.filter((c) => c.status !== "open" && !pinned.includes(c.id))

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{m.title}</h1>
          <p className="mt-2 text-muted-foreground">{m.intro}</p>
        </div>
        <div className="flex flex-col gap-2 lg:items-end">
          <ul className="flex -space-x-2" aria-label={m.title}>
            {mods.map((mod) => (
              <li key={mod.address} title={mod.name}>
                <WalletAvatar address={mod.address} size={36} className="ring-2 ring-background" />
                <span className="sr-only">{mod.name}</span>
              </li>
            ))}
          </ul>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
            <ShieldCheckIcon className="size-4 text-primary" aria-hidden="true" />
            {m.youAre}
          </p>
        </div>
      </header>

      <section aria-labelledby="open-cases" className="flex flex-col gap-4">
        <h2 id="open-cases" className="text-xl font-bold">
          {m.open} <span className="text-muted-foreground tabular-nums">{demo.cases.filter((c) => c.status === "open").length}</span>
        </h2>
        {open.length === 0 ? (
          <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            <CheckIcon className="size-4 text-success" aria-hidden="true" />
            {m.empty}
          </p>
        ) : (
          open.map((c) => <CaseCard key={c.id} demo={demo} c={c} onVoted={() => setPinned((p) => [...p, c.id])} />)
        )}
      </section>

      <section aria-labelledby="resolved-cases" className="flex flex-col gap-3">
        <h2 id="resolved-cases" className="text-xl font-bold">
          {m.resolved}
        </h2>
        {resolved.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{m.emptyResolved}</p>
        ) : (
          <ul className="flex flex-col divide-y rounded-2xl border bg-card">
            {resolved.map((c) => (
              <ResolvedRow key={c.id} demo={demo} c={c} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Tally({ c, labels }: { c: ModerationCase; labels: { hide: string; keep: string; slot: string } }) {
  const rows: { vote: ModVote; icon: typeof EyeOffIcon; label: string }[] = [
    { vote: "hide", icon: EyeOffIcon, label: labels.hide },
    { vote: "keep", icon: EyeIcon, label: labels.keep },
  ]
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => {
        const votes = c.votes.filter((v) => v.vote === row.vote)
        const decided = (c.status === "hidden" && row.vote === "hide") || (c.status === "kept" && row.vote === "keep")
        return (
          <div key={row.vote} className="flex items-center gap-3">
            <span className={cn("flex w-28 shrink-0 items-center gap-1.5 text-xs font-bold capitalize", decided ? "text-foreground" : "text-muted-foreground")}>
              <row.icon className="size-3.5" aria-hidden="true" />
              {row.label}
            </span>
            <span className="flex items-center gap-1.5">
              {Array.from({ length: QUORUM }).map((_, i) => {
                const v = votes[i]
                return v ? (
                  <span key={i} className="tr-pop rounded-full ring-2 ring-primary ring-offset-2 ring-offset-card">
                    <WalletAvatar address={v.moderator} size={24} />
                  </span>
                ) : (
                  <span key={i} aria-label={labels.slot} className="size-6 rounded-full border-2 border-dashed border-input" />
                )
              })}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function CaseCard({ demo, c, onVoted }: { demo: DemoState; c: ModerationCase; onVoted: () => void }) {
  const { app, locale } = useAppCopy()
  const m = app.moderation
  const tx = useTx()
  const review = demo.reviews.find((r) => r.id === c.reviewId)
  const me = demo.wallet.address
  if (!review) return null
  const myVote = c.votes.find((v) => sameAddress(v.moderator, me))
  const involved = sameAddress(review.to, me) || sameAddress(review.from, me)
  const interaction = interactionById(demo, review.interactionId)
  const leading = Math.max(c.votes.filter((v) => v.vote === "hide").length, c.votes.filter((v) => v.vote === "keep").length)

  async function vote(v: ModVote) {
    const ok = await tx.run(
      {
        title: t(app.summaries.vote, { vote: m.voteNames[v], name: nameOf(demo, review!.to) }),
        rows: [
          { label: app.summaries.rows.review, value: nameOf(demo, review!.from) },
          { label: app.summaries.rows.reason, value: app.reasons[c.reason] },
          { label: app.summaries.rows.vote, value: v === "hide" ? m.hide : m.keep },
        ],
        movesValue: true,
      },
      (hash, block) => {
        castVote(c.id, me, v, hash, block)
        onVoted()
      }
    )
    if (ok) {
      toast.success(t(m.youVoted, { vote: m.voteNames[v] }))
      void simulateOtherModerators(c.id, me)
    }
  }

  const decided = c.status !== "open"

  return (
    <article aria-labelledby={`case-${c.id}`} className={cn("rounded-3xl border bg-card p-4 sm:p-6", decided && "border-primary/60")}>
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`case-${c.id}`} className="flex flex-wrap items-center gap-2 font-bold">
          <FlagIcon className="size-4 text-primary" aria-hidden="true" />
          {app.reasons[c.reason]}
          <span className="text-xs font-semibold text-muted-foreground">{t(m.caseLabel, { id: c.id.replace("case-", "#") })}</span>
        </h3>
        <p className="text-xs text-muted-foreground">
          {t(m.flaggedBy, { name: nameOf(demo, c.flaggedBy), when: formatRelative(c.openedAt, locale) })}
        </p>
      </header>

      {c.note ? (
        <p className="mt-3 border-l-2 border-primary pl-3 text-sm italic">
          <span className="sr-only">{m.note}: </span>
          {c.note}
        </p>
      ) : null}

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 rounded-2xl border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Identity state={demo} address={review.from} size={32} />
            <Stars value={review.rating} label={t(app.stars, { n: review.rating })} size={14} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {interaction ? <VerifiedChip label={t(app.review.verified, { ref: interaction.ref })} /> : <UnverifiedChip label={app.review.unverified} />}
            <span className="inline-flex h-7 items-center rounded-full bg-secondary px-2.5 text-xs font-semibold">
              {app.standing[standingOf(demo, review.from)]}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed">{review.comment}</p>
          <p className="mt-3 text-xs text-muted-foreground">
            {t(app.review.about, { name: nameOf(demo, review.to) })} ·{" "}
            <Link href={href(locale, `/app/profile/${review.to}`)} className="font-semibold text-primary-ink underline underline-offset-4">
              {m.openProfile}
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold text-muted-foreground" aria-live="polite">
              {t(m.votes, { n: leading })}
            </p>
            <Tally c={c} labels={{ hide: m.voteNames.hide, keep: m.voteNames.keep, slot: m.slot }} />
          </div>

          <ul className="flex flex-col gap-1 text-xs text-muted-foreground" aria-live="polite">
            {c.votes.map((v) => (
              <li key={v.hash} className="tr-in">
                {t(m.voted, { name: nameOf(demo, v.moderator), vote: m.voteNames[v.vote] })}
              </li>
            ))}
          </ul>

          {decided ? (
            <p role="status" className="tr-pop flex items-start gap-2 rounded-xl bg-secondary px-3 py-2.5 text-sm font-bold">
              {c.status === "hidden" ? <EyeOffIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" /> : <EyeIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />}
              <span>
                {t(c.status === "hidden" ? m.outcomeHidden : m.outcomeKept, { n: c.votes.filter((v) => v.vote === (c.status === "hidden" ? "hide" : "keep")).length })}
                {c.resolvedBlock ? (
                  <span className="mt-0.5 block text-xs font-semibold text-muted-foreground">{t(m.decidedIn, { block: formatBlock(c.resolvedBlock, locale) })}</span>
                ) : null}
              </span>
            </p>
          ) : involved ? (
            <p className="text-xs text-muted-foreground">{m.ownReview}</p>
          ) : myVote ? (
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Loader2Icon className="size-4 animate-spin text-primary" aria-hidden="true" />
              {m.waiting}
            </p>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Button onClick={() => void vote("hide")} disabled={tx.busy} className="flex-1 lg:flex-none">
                <EyeOffIcon aria-hidden="true" />
                {m.hide}
              </Button>
              <Button variant="outline" onClick={() => void vote("keep")} disabled={tx.busy} className="flex-1 lg:flex-none">
                <EyeIcon aria-hidden="true" />
                {m.keep}
              </Button>
            </div>
          )}
          {myVote && !decided ? <p className="text-xs text-muted-foreground">{t(m.youVoted, { vote: m.voteNames[myVote.vote] })}</p> : null}
          <TxInline state={tx.state} onRetry={tx.reset} />
        </div>
      </div>
    </article>
  )
}

function TxInline({ state, onRetry }: { state: ReturnType<typeof useTx>["state"]; onRetry: () => void }) {
  const { app } = useAppCopy()
  if (state.phase === "idle" || state.phase === "confirmed") return null
  if (state.phase === "failed") {
    return (
      <div role="alert" className="flex flex-col gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <p>
          <span className="font-bold text-destructive">{app.tx.failed}. </span>
          {state.error === "rejected" ? app.tx.rejected : app.tx.reverted}
        </p>
        <Button size="sm" variant="outline" className="self-start" onClick={onRetry}>
          {app.tx.dismiss}
        </Button>
      </div>
    )
  }
  return (
    <p role="status" className="flex items-center gap-2 text-sm font-semibold">
      <Loader2Icon className="size-4 animate-spin text-primary" aria-hidden="true" />
      {state.phase === "signing" ? app.tx.signing : app.moderation.pending}
    </p>
  )
}

function ResolvedRow({ demo, c }: { demo: DemoState; c: ModerationCase }) {
  const { app, locale } = useAppCopy()
  const m = app.moderation
  const review = demo.reviews.find((r) => r.id === c.reviewId)
  if (!review) return null
  const n = c.votes.filter((v) => v.vote === (c.status === "hidden" ? "hide" : "keep")).length
  return (
    <li className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
          {c.status === "hidden" ? <EyeOffIcon className="size-4 text-primary" aria-hidden="true" /> : <EyeIcon className="size-4 text-primary" aria-hidden="true" />}
          {t(c.status === "hidden" ? m.outcomeHidden : m.outcomeKept, { n })}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {app.reasons[c.reason]} · {t(app.review.about, { name: nameOf(demo, review.to) })}
          {c.resolvedBlock ? ` · ${t(m.decidedIn, { block: formatBlock(c.resolvedBlock, locale) })}` : ""}
        </p>
      </div>
      <Button asChild variant="ghost" size="sm" className="self-start sm:self-auto">
        <Link href={href(locale, `/app/profile/${review.to}`)}>{m.openProfile}</Link>
      </Button>
    </li>
  )
}
