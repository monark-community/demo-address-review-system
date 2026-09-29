"use client"

import { ArrowRightIcon, SearchIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useId, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Stars } from "@/components/trust/stars"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { isAddress } from "@/lib/demo/network"
import { isHidden, reputationOf, roundScore } from "@/lib/demo/score"
import { useDemo } from "@/lib/demo/store"
import type { DemoState } from "@/lib/demo/types"
import { formatScore, shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { Identity } from "./identity"
import { ReviewCard } from "./review-card"

export function ExploreView() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const e = app.explore
  const id = useId()
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<"score" | "reviews">("score")
  const [feed, setFeed] = useState<"all" | "verified">("all")
  const [limit, setLimit] = useState(4)

  const members = useMemo(() => {
    if (!demo) return []
    return demo.members
      .map((m) => ({ member: m, rep: reputationOf(demo, m.address) }))
      .sort((a, b) =>
        sort === "score"
          ? (b.rep.score ?? 0) - (a.rep.score ?? 0) || b.rep.visible.length - a.rep.visible.length
          : b.rep.visible.length - a.rep.visible.length || (b.rep.score ?? 0) - (a.rep.score ?? 0)
      )
  }, [demo, sort])

  if (!demo) return null

  const q = query.trim()
  const lower = q.toLowerCase()
  const looksLikeAddress = lower.startsWith("0x")
  const validAddress = isAddress(q)
  const matches = q && !looksLikeAddress
    ? members.filter(({ member }) => member.name.toLowerCase().includes(lower) || member.role.toLowerCase().includes(lower))
    : []
  const addressMember = validAddress ? members.find(({ member }) => member.address.toLowerCase() === lower) : undefined

  const reviews = demo.reviews
    .filter((r) => !isHidden(demo, r.id))
    .filter((r) => feed === "all" || r.interactionId !== null)
    .sort((a, b) => b.at.localeCompare(a.at))

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{e.title}</h1>

      <section role="search" className="-mt-2 max-w-2xl">
        <label htmlFor={`${id}-q`} className="sr-only">
          {e.searchLabel}
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id={`${id}-q`}
            type="search"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder={e.searchPlaceholder}
            autoComplete="off"
            spellCheck={false}
            aria-describedby={`${id}-results`}
            aria-invalid={looksLikeAddress && q.length > 2 && !validAddress}
            className="h-12 rounded-full pr-12 pl-11 text-base [&::-webkit-search-cancel-button]:hidden"
          />
          {q ? (
            <Button variant="ghost" size="icon-sm" className="absolute top-1/2 right-1.5 -translate-y-1/2" aria-label={e.clear} onClick={() => setQuery("")}>
              <XIcon aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        <div id={`${id}-results`} aria-live="polite" className="mt-2">
          {q && looksLikeAddress && q.length > 2 && !validAddress ? (
            <p role="alert" className="text-sm text-destructive">
              {e.invalid}
            </p>
          ) : null}
          {validAddress ? (
            <Link
              href={href(locale, `/app/profile/${q}`)}
              className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3 transition-colors hover:bg-muted"
            >
              {addressMember ? (
                <Identity state={demo} address={addressMember.member.address} link={false} />
              ) : (
                <span className="text-sm font-semibold">{t(e.openAddress, { address: shortAddress(q) })}</span>
              )}
              <ArrowRightIcon className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          ) : null}
          {q && !looksLikeAddress ? (
            matches.length ? (
              <ul className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">
                {matches.map(({ member, rep }) => (
                  <li key={member.address}>
                    <MemberRow demo={demo} address={member.address} score={rep.score} count={rep.visible.length} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t(e.noMatch, { q })}</p>
            )
          ) : null}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
        <section aria-labelledby={`${id}-members`} className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id={`${id}-members`} className="text-xl font-bold">
              {e.membersTitle}
            </h2>
            <PillToggle
              label={e.sort.label}
              value={sort}
              onChange={setSort}
              options={[
                { value: "score", label: e.sort.score },
                { value: "reviews", label: e.sort.reviews },
              ]}
            />
          </div>
          <ul className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">
            {members.map(({ member, rep }) => (
              <li key={member.address}>
                <MemberRow demo={demo} address={member.address} score={rep.score} count={rep.visible.length} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby={`${id}-feed`} className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id={`${id}-feed`} className="text-xl font-bold">
              {e.feedTitle}
            </h2>
            <PillToggle
              label={e.feed.label}
              value={feed}
              onChange={(v) => {
                setFeed(v)
                setLimit(4)
              }}
              options={[
                { value: "all", label: e.feed.all },
                { value: "verified", label: e.feed.verified },
              ]}
            />
          </div>
          {reviews.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{e.feedEmpty}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {reviews.slice(0, limit).map((r) => (
                <ReviewCard key={r.id} state={demo} review={r} mode="feed" />
              ))}
              {reviews.length > limit ? (
                <Button variant="outline" className="self-center" onClick={() => setLimit((l) => l + 4)}>
                  {e.moreReviews}
                </Button>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function MemberRow({ demo: d, address, score, count }: { demo: DemoState; address: string; score: number | null; count: number }) {
  const { app, locale } = useAppCopy()
  const e = app.explore
  return (
      <Link href={href(locale, `/app/profile/${address}`)} className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted">
        <Identity state={d} address={address} link={false} />
        <span className="flex shrink-0 flex-col items-end gap-0.5">
          {score !== null ? (
            <>
              <span className="flex items-center gap-1.5">
                <Stars value={roundScore(score)} label={t(app.stars, { n: formatScore(roundScore(score), locale) })} size={12} className="hidden sm:inline-flex" />
                <span className="font-extrabold tabular-nums">{formatScore(roundScore(score), locale)}</span>
              </span>
              <span className="text-xs text-muted-foreground">{count === 1 ? e.oneReview : t(e.reviews, { n: count })}</span>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">{e.noReviews}</span>
          )}
        </span>
      </Link>
  )
}

export function PillToggle<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  className?: string
}) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center rounded-full border p-0.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex h-8 items-center rounded-full px-3 text-xs font-bold transition-colors duration-150",
            value === o.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
