"use client"

import { Loader2Icon, WalletIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { WalletAvatar } from "@/components/ui/wallet"
import { VerifiedChip } from "@/components/trust/chips"
import { SealStamp } from "@/components/trust/seal-stamp"
import { ScoreDial } from "@/components/trust/score-dial"
import { Star, Stars } from "@/components/trust/stars"
import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { seededAddress } from "@/lib/demo/ids"
import { formatBlock, formatScore } from "@/lib/format"
import { cn } from "@/lib/utils"

type Phase = "idle" | "signing" | "sealing" | "sealed"
const TIMELINE: [Phase, number][] = [
  ["idle", 450],
  ["signing", 1500],
  ["sealing", 1800],
  ["sealed", 4800],
]
const BLOCK = 5_812_344
// Same addresses as the demo's seeded community (lib/demo/seed.ts).
const AMARA = seededAddress("amara-okafor")
const YOU = "0x5a1C3e9D0b47F2a6c8E1d93B04f6A7c2D95e7e2B"

/**
 * The home hero: Amara Okafor's profile as it looks in the demo. A verified
 * review arrives, is signed and sealed, and the score settles by its weight.
 */
export function HeroCard({ copy, locale }: { copy: Dictionary["home"]["card"]; locale: Locale }) {
  const [phase, setPhase] = useState<Phase>("sealed")
  const [still, setStill] = useState(true)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let i = 0
    let timer = 0
    const tick = () => {
      const [p, ms] = TIMELINE[i % TIMELINE.length]!
      setPhase(p)
      setStill(false)
      i++
      timer = window.setTimeout(tick, ms)
    }
    timer = window.setTimeout(tick, 600)
    return () => window.clearTimeout(timer)
  }, [])

  const sealed = phase === "sealed"
  const score = sealed ? 4.3 : 4.2
  const counts = sealed ? { n: 10, v: 8 } : { n: 9, v: 7 }
  const bars = sealed ? [7, 2, 1, 0, 0] : [6, 2, 1, 0, 0]

  return (
    <figure aria-label={copy.label} className="relative mx-auto w-full max-w-md">
      <div className="rounded-[1.75rem] border bg-card p-5 shadow-[0_1px_0_var(--border)] sm:p-6">
        <div className="flex items-center gap-3">
          <WalletAvatar address={AMARA} size={44} />
          <div className="min-w-0">
            <p className="font-extrabold">Amara Okafor</p>
            <p className="text-sm text-muted-foreground">{copy.role}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-4">
          <div>
            <p className="eyebrow text-muted-foreground">{copy.score}</p>
            <ScoreDial
              score={score}
              format={(n) => formatScore(n, locale)}
              label={`${copy.score}: ${formatScore(score, locale)}`}
              empty=""
              size={190}
              ms={1400}
              className="mt-1 ml-0"
            />
          </div>
          <ul aria-hidden="true" className="flex w-28 flex-col gap-1 pb-1">
            {bars.map((c, i) => (
              <li key={i} className="flex items-center gap-1.5">
                <Star filled size={10} />
                <span className="text-[0.625rem] font-bold tabular-nums">{5 - i}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                  <span className="block h-full rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${(c / 7) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-semibold tabular-nums">{t(copy.reviews, counts)}</span>
          <span aria-hidden="true" className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{copy.confidence}</span>
        </p>
      </div>

      {/* The incoming review, overlapping the card's lower edge. */}
      <div
        className={cn(
          "relative z-10 -mt-3 ml-6 rounded-2xl border bg-card p-4 transition-all duration-300 ease-out sm:-mr-6 sm:ml-10",
          phase === "idle" && !still ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
          sealed && "border-primary/60"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <WalletAvatar address={YOU} size={26} />
            <p className="truncate text-sm">
              <span className="font-bold">{copy.incoming}</span> <span className="text-muted-foreground">{copy.from}</span>
            </p>
          </div>
          <Stars value={5} label="5/5" size={13} />
        </div>
        <VerifiedChip label={copy.verified} className="mt-2.5" />
        <p className="mt-2 text-sm leading-relaxed">{copy.comment}</p>
        <p className="mt-3 flex min-h-5 items-center gap-2 border-t pt-2.5 text-xs font-semibold" aria-live="off">
          {phase === "signing" ? (
            <>
              <WalletIcon className="size-4 text-primary" aria-hidden="true" />
              {copy.states.signing}
            </>
          ) : phase === "sealing" ? (
            <>
              <Loader2Icon className="size-4 animate-spin text-primary" aria-hidden="true" />
              {t(copy.states.sealing, { block: formatBlock(BLOCK, locale) })}
            </>
          ) : (
            <>
              <SealStamp key={phase + String(still)} size={16} animate={!still} />
              {t(copy.states.sealed, { block: formatBlock(BLOCK, locale) })}
            </>
          )}
        </p>
      </div>
    </figure>
  )
}
