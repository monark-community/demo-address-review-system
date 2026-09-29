"use client"

import { AlertTriangleIcon, CircleDashedIcon, InfoIcon, LockIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useId, useMemo, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WalletAvatar } from "@/components/ui/wallet"
import { SentimentChip, TagChip, UnverifiedChip, VerifiedChip } from "@/components/trust/chips"
import { SealStamp } from "@/components/trust/seal-stamp"
import { Star, Stars } from "@/components/trust/stars"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { isAddress, sameAddress } from "@/lib/demo/network"
import { addReview, hasUnverifiedReview, interactionById, interactionsBetween, memberOf } from "@/lib/demo/ops"
import { previewWeight, reputationOf, roundScore, scoreFrom, standingOf } from "@/lib/demo/score"
import { classify, mismatch } from "@/lib/demo/sentiment"
import { getDemo, useDemo } from "@/lib/demo/store"
import { TAG_IDS, type DemoState, type Rating, type TagId } from "@/lib/demo/types"
import { formatDate, formatPercent, formatScore, formatToken, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { Disclaimer } from "./disclaimer"
import { Identity, nameOf } from "./identity"
import { TxFeedback } from "./tx-feedback"

const MIN = 40
const MAX = 600
const MAX_TAGS = 3

/** First interaction with this address that you haven't reviewed yet. */
function firstOpenInteraction(state: DemoState, from: string, to: string): string | null {
  return interactionsBetween(state, from, to).find((x) => !x.reviewed)?.interaction.id ?? null
}

export function Composer({ initialTo }: { initialTo?: string }) {
  const demo = useDemo()
  if (!demo) return null
  return <ComposerForm demo={demo} initialTo={initialTo} />
}

function ComposerForm({ demo, initialTo }: { demo: DemoState; initialTo?: string }) {
  const { app, locale, disclaimer } = useAppCopy()
  const c = app.composer
  const id = useId()
  const router = useRouter()
  const tx = useTx()
  const me = demo.wallet.address

  const startTo = initialTo && isAddress(initialTo) && !sameAddress(initialTo, me) ? initialTo : ""
  const [to, setTo] = useState(startTo)
  const [toInput, setToInput] = useState(startTo)
  const [interaction, setInteraction] = useState<string | null>(() => {
    const s = getDemo()
    return s && startTo ? firstOpenInteraction(s, me, startTo) : null
  })
  const [rating, setRating] = useState<Rating | 0>(0)
  const [tags, setTags] = useState<TagId[]>([])
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [tagError, setTagError] = useState(false)

  const chosen = to !== ""
  const pairs = chosen ? interactionsBetween(demo, me, to) : []
  const unverifiedUsed = chosen && hasUnverifiedReview(demo, me, to)

  // People you've worked with: counterparties of your interactions.
  const partners = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const i of demo.interactions) {
      const other = sameAddress(i.from, me) ? i.to : sameAddress(i.to, me) ? i.from : null
      if (other && !seen.has(other.toLowerCase())) {
        seen.add(other.toLowerCase())
        out.push(other)
      }
    }
    return out
  }, [demo.interactions, me])

  const toError = (() => {
    const v = toInput.trim()
    if (!v) return submitted ? c.who.invalid : null
    if (!isAddress(v)) return c.who.invalid
    if (sameAddress(v, me)) return c.who.self
    return null
  })()

  const length = comment.trim().length
  const commentError = length < MIN ? c.comment.tooShort : length > MAX ? c.comment.tooLong : null
  const interactionError = chosen && interaction === null ? c.interaction.required : null
  const ratingError = rating === 0 ? c.rating.required : null
  const tone = classify(comment)
  const toneReady = length >= 12
  const disagree = toneReady && rating !== 0 && mismatch(rating, tone.label)

  const verified = interaction !== null && interaction !== "none"
  const weight = previewWeight(demo, me, verified)
  const standing = standingOf(demo, me)

  const rep = chosen ? reputationOf(demo, to) : null
  const before = rep && rep.score !== null ? roundScore(rep.score) : null
  const after =
    rep && rating !== 0
      ? roundScore(scoreFrom([...rep.visible.map((w) => ({ rating: w.review.rating, weight: w.weight })), { rating, weight }]))
      : null

  const valid = chosen && !toError && !interactionError && !ratingError && !commentError
  const showErr = (e: string | null) => (submitted ? e : null)

  function choose(address: string) {
    setTo(address)
    setToInput(address)
    setInteraction(firstOpenInteraction(demo, me, address) ?? (hasUnverifiedReview(demo, me, address) ? null : "none"))
  }

  function toggleTag(tag: TagId) {
    setTags((prev) => {
      if (prev.includes(tag)) {
        setTagError(false)
        return prev.filter((x) => x !== tag)
      }
      if (prev.length >= MAX_TAGS) {
        setTagError(true)
        return prev
      }
      return [...prev, tag]
    })
  }

  async function seal() {
    setSubmitted(true)
    // Invalid: the fields and the line under the button explain what to fix.
    if (!valid || rating === 0) return
    const inter = interactionById(demo, verified ? interaction : null)
    let newId = ""
    const ok = await tx.run(
      {
        title: t(app.summaries.seal, { name: nameOf(demo, to) }),
        rows: [
          { label: app.summaries.rows.subject, value: nameOf(demo, to) },
          { label: app.summaries.rows.rating, value: t(app.stars, { n: rating }) },
          { label: app.summaries.rows.interaction, value: inter ? inter.ref : c.interaction.none },
        ],
        movesValue: true,
      },
      (hash, block) => {
        newId = addReview({ from: me, to, rating, comment, tags, interactionId: verified ? interaction : null }, hash, block)
        toast.success(t(c.done, { block: new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA").format(block) }))
      }
    )
    if (ok && newId) router.push(href(locale, `/app/profile/${to}?sealed=${newId}`))
  }

  const subject = chosen ? memberOf(demo, to) : null

  return (
    <div className="flex flex-col gap-8">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{c.title}</h1>
        <p className="mt-2 text-muted-foreground">{c.intro}</p>
      </header>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          void seal()
        }}
        className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10"
      >
        <div className="flex min-w-0 flex-col gap-8">
          {/* 1. Who */}
          <Section n={1} title={c.who.title} hint={c.who.hint}>
            {chosen ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3.5">
                <Identity state={demo} address={to} size={40} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={tx.busy}
                  onClick={() => {
                    setTo("")
                    setInteraction(null)
                  }}
                >
                  {c.who.change}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${id}-to`}>{c.who.address}</Label>
                  <Input
                    id={`${id}-to`}
                    value={toInput}
                    onChange={(e) => {
                      const v = e.target.value
                      setToInput(v)
                      if (isAddress(v) && !sameAddress(v, me)) choose(v.trim())
                    }}
                    placeholder="0x…"
                    className="font-mono"
                    spellCheck={false}
                    autoComplete="off"
                    aria-invalid={!!toError && (submitted || toInput.length > 2)}
                    aria-describedby={`${id}-to-err`}
                  />
                  <p id={`${id}-to-err`} className="min-h-5 text-xs text-destructive" aria-live="polite">
                    {toError && (submitted || toInput.length > 2) ? toError : ""}
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold">{c.who.pick}</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {partners.map((addr) => (
                      <li key={addr}>
                        <button
                          type="button"
                          onClick={() => choose(addr)}
                          className="flex w-full items-center gap-2.5 rounded-2xl border bg-card p-3 text-left transition-colors hover:bg-muted"
                        >
                          <Identity state={demo} address={addr} link={false} size={32} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Section>

          {/* 2. Interaction */}
          {chosen ? (
            <Section n={2} title={c.interaction.title} hint={c.interaction.hint}>
              <fieldset aria-describedby={`${id}-int-err`}>
                <legend className="sr-only">{c.interaction.title}</legend>
                <div className="flex flex-col gap-2">
                  {pairs.length === 0 ? <p className="text-sm text-muted-foreground">{c.interaction.empty}</p> : null}
                  {pairs.map(({ interaction: i, reviewed }) => (
                    <ChoiceCard
                      key={i.id}
                      name={`${id}-interaction`}
                      checked={interaction === i.id}
                      disabled={reviewed || tx.busy}
                      onChange={() => setInteraction(i.id)}
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-bold">{i.ref}</span>
                          <span className="text-xs text-muted-foreground">{app.kinds[i.kind]}</span>
                        </span>
                        <span className="text-sm">{i.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatToken(i.amount, i.token, locale)} · {formatDate(i.at, locale)}
                        </span>
                      </span>
                      {reviewed ? (
                        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">{c.interaction.reviewed}</span>
                      ) : (
                        <SealStamp size={20} className="shrink-0" />
                      )}
                    </ChoiceCard>
                  ))}
                  <ChoiceCard
                    name={`${id}-interaction`}
                    checked={interaction === "none"}
                    disabled={unverifiedUsed || tx.busy}
                    onChange={() => setInteraction("none")}
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-bold">{c.interaction.none}</span>
                      <span className="text-xs text-muted-foreground">{unverifiedUsed ? c.interaction.noneUsed : c.interaction.noneHint}</span>
                    </span>
                    <CircleDashedIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </ChoiceCard>
                </div>
                <p id={`${id}-int-err`} className="mt-1.5 min-h-5 text-xs text-destructive">
                  {showErr(interactionError)}
                </p>
              </fieldset>
            </Section>
          ) : null}

          {/* 3. Rating */}
          <Section n={chosen ? 3 : 2} title={c.rating.title}>
            <div role="radiogroup" aria-label={c.rating.title} aria-describedby={`${id}-rating-err`} className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${t(app.stars, { n })} · ${c.rating.names[n - 1]}`}
                    tabIndex={rating === n || (rating === 0 && n === 1) ? 0 : -1}
                    disabled={tx.busy}
                    onClick={() => setRating(n)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                        e.preventDefault()
                        setRating((r) => (Math.min(5, (r || 0) + 1) as Rating))
                      }
                      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                        e.preventDefault()
                        setRating((r) => (Math.max(1, (r || 2) - 1) as Rating))
                      }
                    }}
                    className="rounded-lg p-1 transition-transform duration-150 hover:scale-110"
                  >
                    <Star filled={rating >= n} size={32} />
                  </button>
                ))}
              </div>
              <span className="text-sm font-semibold" aria-live="polite">
                {rating ? `${rating}/5 · ${c.rating.names[rating - 1]}` : ""}
              </span>
            </div>
            <p id={`${id}-rating-err`} className="mt-1.5 min-h-5 text-xs text-destructive">
              {showErr(ratingError)}
            </p>
          </Section>

          {/* 4. Tags */}
          <Section n={chosen ? 4 : 3} title={c.tags.title} hint={c.tags.hint}>
            <div role="group" aria-label={c.tags.title} className="flex flex-wrap gap-2">
              {TAG_IDS.map((tag) => {
                const on = tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={on}
                    disabled={tx.busy}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors duration-150",
                      on ? "border-foreground bg-foreground text-background" : "border-input text-foreground hover:bg-muted"
                    )}
                  >
                    {on ? <XIcon className="size-3.5" aria-hidden="true" /> : null}
                    {app.tags[tag]}
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 min-h-5 text-xs text-warning" aria-live="polite">
              {tagError ? c.tags.max : ""}
            </p>
          </Section>

          {/* 5. Comment */}
          <Section n={chosen ? 5 : 4} title={c.comment.title} hint={c.comment.hint}>
            <Label htmlFor={`${id}-comment`} className="sr-only">
              {c.comment.title}
            </Label>
            <Textarea
              id={`${id}-comment`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={c.comment.placeholder}
              maxLength={MAX + 100}
              disabled={tx.busy}
              aria-invalid={submitted && !!commentError}
              aria-describedby={`${id}-comment-help ${id}-tone`}
              className="min-h-36"
            />
            <div id={`${id}-comment-help`} className="mt-1.5 flex justify-between gap-3 text-xs">
              <span className="text-destructive">{showErr(commentError)}</span>
              <span className={cn("shrink-0 tabular-nums", length > MAX ? "text-destructive" : "text-muted-foreground")}>
                {t(c.comment.count, { n: length })}
              </span>
            </div>
            <div id={`${id}-tone`} aria-live="polite" className="mt-3 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold">{c.tone.label}</span>
                {toneReady ? (
                  <SentimentChip sentiment={tone.label} label={app.sentiment[tone.label]} />
                ) : (
                  <span className="text-muted-foreground">{c.tone.waiting}</span>
                )}
                <span className="text-xs text-muted-foreground">{c.tone.note}</span>
              </div>
              {disagree ? (
                <p className="tr-in flex items-start gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
                  <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
                  {t(c.tone.mismatch, { tone: c.tone.words[tone.label], n: rating })}
                </p>
              ) : null}
            </div>
          </Section>
        </div>

        {/* Preview + seal */}
        <aside aria-label={c.preview.title} className="flex flex-col gap-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border bg-card p-5">
            <p className="eyebrow text-muted-foreground">{c.preview.title}</p>
            {chosen || comment || rating ? (
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <Identity state={demo} address={me} size={32} link={false} />
                  {rating ? (
                    <Stars value={rating} label={t(app.stars, { n: rating })} size={14} />
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {verified && interaction ? (
                    <VerifiedChip label={t(app.review.verified, { ref: interactionById(demo, interaction)?.ref ?? "" })} />
                  ) : interaction === "none" ? (
                    <UnverifiedChip label={app.review.unverified} />
                  ) : null}
                  {tags.map((tag) => (
                    <TagChip key={tag} label={app.tags[tag]} />
                  ))}
                </div>
                <p className={cn("text-sm leading-relaxed break-words", !comment && "text-muted-foreground")}>
                  {comment || c.preview.empty}
                </p>
                {chosen ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <WalletAvatar address={to} size={16} />
                    {t(app.review.about, { name: subject?.name ?? shortAddress(to) })}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{c.preview.empty}</p>
            )}
          </div>

          <div className="rounded-3xl border bg-card p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-bold">{c.preview.weightTitle}</p>
              <p className="text-sm font-extrabold">
                {weight >= 1 ? c.preview.full : t(c.preview.partial, { pct: formatPercent(weight, locale) })}
              </p>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out" style={{ width: `${weight * 100}%` }} />
            </div>
            <ul className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
              <li>{verified ? c.preview.verified : c.preview.unverified}</li>
              <li>{standing === "established" ? c.preview.established : c.preview.newWallet}</li>
            </ul>
            {before !== null && after !== null ? (
              <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 text-sm font-semibold tabular-nums">
                {t(c.preview.scoreMove, { from: formatScore(before, locale), to: formatScore(after, locale) })}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 rounded-3xl border bg-card p-5">
            <p className="flex items-start gap-2 text-sm">
              <LockIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              {c.permanent}
            </p>
            <TxFeedback
              state={tx.state}
              pendingLabel={c.pending}
              onRetry={tx.state.phase === "failed" ? () => void seal() : undefined}
              onDismiss={tx.reset}
            />
            {tx.state.phase === "failed" ? <p className="text-xs text-muted-foreground">{c.failedDraft}</p> : null}
            <Button type="submit" size="lg" disabled={tx.busy} className="w-full">
              {c.submit}
            </Button>
            {submitted && !valid ? (
              <p role="alert" className="flex items-start gap-2 text-xs text-destructive">
                <InfoIcon className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                {c.fix}
              </p>
            ) : null}
            <Disclaimer text={disclaimer} />
          </div>
        </aside>
      </form>
    </div>
  )
}

function Section({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-primary text-xs font-extrabold">
          {n}
        </span>
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
        </div>
      </div>
      <div className="sm:pl-10">{children}</div>
    </section>
  )
}

function ChoiceCard({
  name,
  checked,
  disabled,
  onChange,
  children,
}: {
  name: string
  checked: boolean
  disabled?: boolean
  onChange: () => void
  children: React.ReactNode
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-3.5 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
        checked ? "border-primary bg-secondary/50" : "hover:bg-muted",
        disabled && !checked && "cursor-not-allowed opacity-60 hover:bg-card"
      )}
    >
      <input type="radio" name={name} checked={checked} disabled={disabled} onChange={onChange} className="size-4 shrink-0 accent-[var(--primary)]" />
      {children}
    </label>
  )
}
