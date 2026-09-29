"use client"

import { CalculatorIcon, CheckCircle2Icon, ChevronDownIcon, PenLineIcon, SearchXIcon } from "lucide-react"
import Link from "next/link"
import { useId, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, WalletAvatar } from "@/components/ui/wallet"
import { SentimentChip, TagChip } from "@/components/trust/chips"
import { ScoreDial } from "@/components/trust/score-dial"
import { Stars } from "@/components/trust/stars"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { activityOf, memberOf } from "@/lib/demo/ops"
import { isAddress, sameAddress } from "@/lib/demo/network"
import { interactionCount, reputationOf, roundScore, scoreFrom, type Reputation } from "@/lib/demo/score"
import { useDemo } from "@/lib/demo/store"
import type { DemoState, Rating, Sentiment } from "@/lib/demo/types"
import { formatMonthYear, formatNumber, formatPercent, formatScore, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { ActivityList } from "./activity-list"
import { useAppCopy } from "./app-provider"
import { nameOf } from "./identity"
import { PillToggle } from "./explore-view"
import { ReviewCard } from "./review-card"

export function ProfileView({ address, sealed }: { address: string; sealed?: string }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const p = app.profile

  if (!demo) return null

  if (!isAddress(address)) {
    return (
      <section className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
        <SearchXIcon className="size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-extrabold">{p.invalidTitle}</h1>
        <p className="mt-2 text-muted-foreground">{p.invalidBody}</p>
        <Button asChild className="mt-6">
          <Link href={href(locale, "/app")}>{p.backToExplore}</Link>
        </Button>
      </section>
    )
  }

  return <Profile demo={demo} address={address} sealed={sealed} />
}

function Profile({ demo, address, sealed }: { demo: DemoState; address: string; sealed?: string }) {
  const { app, locale } = useAppCopy()
  const p = app.profile
  const id = useId()
  const member = memberOf(demo, address)
  const you = sameAddress(demo.wallet.address, address)
  const rep = reputationOf(demo, address)
  const freshReview = sealed ? rep.received.find((r) => r.id === sealed) : undefined

  // For the "score settles" moment: the score before the just-sealed review.
  const [initialScore] = useState(() => {
    if (!freshReview || rep.score === null) return undefined
    const others = rep.visible.filter((w) => w.review.id !== freshReview.id)
    return others.length ? roundScore(scoreFrom(others.map((w) => ({ rating: w.review.rating, weight: w.weight })))) : 1
  })

  const name = member?.name ?? shortAddress(address)
  const writeHref = href(locale, `/app/write?to=${address}`)
  const interactions = interactionCount(demo, address)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <WalletAvatar address={address} size={64} className="ring-4 ring-secondary" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className={cn("text-3xl font-extrabold tracking-display", !member && "font-mono text-2xl")}>{name}</h1>
              {you ? <Badge>{p.thisIsYou}</Badge> : null}
              {member?.moderator ? <Badge>{app.moderator}</Badge> : null}
              {member?.partner ? <Badge>{app.partner}</Badge> : null}
            </div>
            <p className="mt-0.5 text-muted-foreground">{member ? member.role : app.unlabelledRole}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <Wallet address={address} size="sm" copyLabel={app.wallet.copy} copiedLabel={app.wallet.copied} className="bg-transparent" />
              {member ? <span>{t(p.since, { date: formatMonthYear(member.since, locale) })}</span> : null}
              <span>{t(p.interactions, { n: interactions })}</span>
            </div>
          </div>
        </div>
        {!you ? (
          <Button asChild size="lg" className="self-start sm:self-auto">
            <Link href={writeHref}>
              <PenLineIcon aria-hidden="true" />
              {rep.received.length ? p.write : p.writeFirst}
            </Link>
          </Button>
        ) : null}
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[21rem_minmax(0,1fr)] lg:gap-8">
        <ScorePanel rep={rep} initial={initialScore} />

        <Tabs defaultValue="received" className="min-w-0 gap-4">
          <TabsList className="self-start">
            <TabsTrigger value="received">
              {p.tabs.received} <span className="tabular-nums opacity-70">{rep.received.length}</span>
            </TabsTrigger>
            <TabsTrigger value="given">
              {p.tabs.given} <span className="tabular-nums opacity-70">{rep.given.length}</span>
            </TabsTrigger>
            <TabsTrigger value="activity">{p.tabs.activity}</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="flex flex-col gap-3">
            {freshReview ? (
              <p role="status" className="flex items-center gap-2 rounded-2xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">
                <CheckCircle2Icon className="size-4 shrink-0" aria-hidden="true" />
                {p.justSealed}
              </p>
            ) : null}
            <ReceivedList demo={demo} rep={rep} you={you} name={name} writeHref={writeHref} freshId={freshReview?.id} listId={id} />
          </TabsContent>

          <TabsContent value="given" className="flex flex-col gap-3">
            {rep.given.length === 0 ? (
              <Empty>{p.emptyGiven}</Empty>
            ) : (
              rep.given.map((r) => <ReviewCard key={r.id} state={demo} review={r} mode="given" />)
            )}
          </TabsContent>

          <TabsContent value="activity">
            <ActivityList state={demo} entries={activityOf(demo, address)} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border px-2.5 py-0.5 text-xs font-bold text-muted-foreground">{children}</span>
}

function Empty({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      <div>{children}</div>
      {action}
    </div>
  )
}

function ReceivedList({
  demo,
  rep,
  you,
  name,
  writeHref,
  freshId,
  listId,
}: {
  demo: DemoState
  rep: Reputation
  you: boolean
  name: string
  writeHref: string
  freshId?: string
  listId: string
}) {
  const { app } = useAppCopy()
  const p = app.profile
  const [filter, setFilter] = useState<"all" | "verified" | "replies">("all")
  const [sort, setSort] = useState<"newest" | "helpful">("newest")

  const list = useMemo(() => {
    const base = rep.received.filter((r) =>
      filter === "all" ? true : filter === "verified" ? r.interactionId !== null : r.reply !== null
    )
    const sorted = [...base].sort((a, b) =>
      sort === "newest" ? b.at.localeCompare(a.at) : b.helpful.length - a.helpful.length || b.at.localeCompare(a.at)
    )
    // The review you just sealed comes first.
    if (freshId) sorted.sort((a, b) => Number(b.id === freshId) - Number(a.id === freshId))
    return sorted
  }, [rep.received, filter, sort, freshId])

  if (rep.received.length === 0) {
    return you ? (
      <Empty>{p.emptyYou}</Empty>
    ) : (
      <Empty
        action={
          <Button asChild>
            <Link href={writeHref}>
              <PenLineIcon aria-hidden="true" />
              {p.writeFirst}
            </Link>
          </Button>
        }
      >
        <p className="font-bold text-foreground">{p.emptyTitle}</p>
        <p className="mt-1">{p.emptyBody}</p>
        <span className="sr-only">{name}</span>
      </Empty>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2" aria-controls={listId}>
        <PillToggle
          label={p.filter.label}
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: p.filter.all },
            { value: "verified", label: p.filter.verified },
            { value: "replies", label: p.filter.replies },
          ]}
        />
        <PillToggle
          label={p.sort.label}
          value={sort}
          onChange={setSort}
          options={[
            { value: "newest", label: p.sort.newest },
            { value: "helpful", label: p.sort.helpful },
          ]}
        />
      </div>
      <div id={listId} className="flex flex-col gap-3">
        {list.length === 0 ? <Empty>{p.emptyFiltered}</Empty> : null}
        {list.map((r) => (
          <ReviewCard key={r.id} state={demo} review={r} mode="received" fresh={r.id === freshId} />
        ))}
      </div>
    </>
  )
}

function ScorePanel({ rep, initial }: { rep: Reputation; initial?: number }) {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const p = app.profile
  const score = rep.score === null ? null : roundScore(rep.score)
  const maxCount = Math.max(1, ...Object.values(rep.distribution))
  const totalSentiment = rep.visible.length || 1

  return (
    <aside aria-label={p.scoreLabel} className="flex flex-col gap-5 rounded-3xl border bg-card p-5 lg:sticky lg:top-24">
      <div className="flex flex-col items-center text-center">
        <p className="eyebrow text-muted-foreground">{p.scoreLabel}</p>
        <ScoreDial
          score={score}
          initial={initial}
          ms={initial !== undefined ? 1600 : 900}
          format={(n) => formatScore(n, locale)}
          label={score === null ? p.noScore : `${p.scoreLabel}: ${formatScore(score, locale)} ${p.outOf}`}
          empty={p.noScore}
          className="mt-3"
        />
        {score !== null ? (
          <>
            <p className="mt-1 text-xs text-muted-foreground">{p.outOf}</p>
            <p className="mt-3 text-sm font-semibold">{t(p.basedOn, { n: rep.visible.length, v: rep.verifiedCount })}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold">
              {app.confidence.label} · {app.confidence[rep.confidence]}
            </p>
            {rep.rawAverage !== null ? (
              <p className="mt-2 text-xs text-muted-foreground">{t(p.plainAverage, { avg: formatNumber(rep.rawAverage, locale, 1) })}</p>
            ) : null}
            {rep.hidden.length ? (
              <p className="mt-1 text-xs text-muted-foreground">{t(p.hiddenCount, { n: rep.hidden.length })}</p>
            ) : null}
          </>
        ) : null}
      </div>

      {score !== null ? (
        <>
          <div>
            <h2 className="mb-2 text-sm font-bold">{p.distribution}</h2>
            <ul className="flex flex-col gap-1.5">
              {([5, 4, 3, 2, 1] as Rating[]).map((n) => (
                <li key={n} className="grid grid-cols-[4.75rem_1fr_1.5rem] items-center gap-2 text-xs">
                  <Stars value={n} label={t(app.stars, { n })} size={11} />
                  <span className="h-2 overflow-hidden rounded-full bg-border">
                    <span
                      className="block h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
                      style={{ width: `${(rep.distribution[n] / maxCount) * 100}%` }}
                    />
                  </span>
                  <span className="text-right font-semibold tabular-nums">{rep.distribution[n]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-sm font-bold">{p.sentiment}</h2>
            <ul className="flex flex-wrap gap-1.5">
              {(["positive", "mixed", "negative"] as Sentiment[]).map((s) => (
                <li key={s}>
                  <SentimentChip
                    sentiment={s}
                    label={`${app.sentiment[s]} · ${formatPercent(rep.sentiment[s] / totalSentiment, locale)}`}
                  />
                </li>
              ))}
            </ul>
          </div>

          {rep.topTags.length ? (
            <div>
              <h2 className="mb-2 text-sm font-bold">{p.knownFor}</h2>
              <ul className="flex flex-wrap gap-1.5">
                {rep.topTags.map(({ tag, count }) => (
                  <li key={tag}>
                    <TagChip label={`${app.tags[tag]} · ${count}`} />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {demo ? <WeightsTable demo={demo} rep={rep} /> : null}
        </>
      ) : null}
    </aside>
  )
}

function WeightsTable({ demo, rep }: { demo: DemoState; rep: Reputation }) {
  const { app, locale } = useAppCopy()
  const h = app.profile.how
  const sum = rep.visible.reduce((s, w) => s + w.weight * w.review.rating, 0)
  const fmt = (n: number, d = 2) => formatNumber(n, locale, d)

  return (
    <details className="group rounded-2xl border bg-background">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-2.5 text-sm font-bold [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <CalculatorIcon className="size-4 text-primary" aria-hidden="true" />
          {h.title}
        </span>
        <ChevronDownIcon className="size-4 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t px-4 py-3">
        <p className="text-xs text-muted-foreground">{h.intro}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th scope="col" className="py-1 pr-2 font-semibold">{h.review}</th>
                <th scope="col" className="py-1 pr-2 text-right font-semibold">{h.stars}</th>
                <th scope="col" className="py-1 text-right font-semibold">{h.weight}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rep.visible.map((w) => (
                <tr key={w.review.id}>
                  <td className="py-1.5 pr-2">
                    <span className="block max-w-[10rem] truncate font-semibold">{nameOf(demo, w.review.from)}</span>
                    <span className="block text-muted-foreground">
                      {w.verified ? h.verified : h.unverified}
                      {" · "}
                      {w.standing === "established" ? h.established : h.newWallet}
                    </span>
                  </td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">{w.review.rating}</td>
                  <td className="py-1.5 text-right font-bold tabular-nums">{fmt(w.weight)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <th scope="row" colSpan={2} className="py-1.5 pr-2 font-semibold">{h.total}</th>
                <td className="py-1.5 text-right font-bold tabular-nums">{fmt(rep.totalWeight)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-3 rounded-xl bg-secondary/60 px-3 py-2 font-mono text-[0.6875rem] leading-relaxed break-words">
          {t(h.formula, { sum: fmt(sum), weights: fmt(rep.totalWeight), score: formatNumber(rep.score ?? 0, locale, 2) })}
        </p>
        <Link href={href(locale, "/how-it-works")} className="mt-3 inline-block text-xs font-semibold text-primary-ink underline underline-offset-4">
          {h.more}
        </Link>
      </div>
    </details>
  )
}
