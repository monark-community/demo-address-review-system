"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/** Eased tween towards `target`; jumps straight there with reduced motion. */
function useTween(target: number, initial = target, ms = 900) {
  const [value, setValue] = useState(initial)
  const from = useRef(initial)
  const current = useRef(initial)

  useEffect(() => {
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    from.current = current.current
    if (reduce || from.current === target) {
      current.current = target
      const id = requestAnimationFrame(() => setValue(target))
      return () => cancelAnimationFrame(id)
    }
    let raf = 0
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const eased = 1 - Math.pow(1 - t, 3)
      const v = from.current + (target - from.current) * eased
      current.current = v
      setValue(v)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])

  return value
}

/**
 * The score dial: a flat orange semicircle gauge from 1 to 5. When the score
 * changes, the arc and the number settle to the new value.
 */
export function ScoreDial({
  score,
  initial,
  format,
  label,
  empty,
  size = 220,
  ms = 900,
  className,
}: {
  score: number | null
  /** Start from this value and settle to `score` (the "score settles" moment). */
  initial?: number
  format: (n: number) => string
  label: string
  empty: string
  size?: number
  ms?: number
  className?: string
}) {
  const shown = useTween(score ?? 1, initial ?? score ?? 1, ms)
  const fraction = score === null ? 0 : Math.max(0, Math.min(1, (shown - 1) / 4))
  const r = 80
  const arc = `M ${100 - r} 100 A ${r} ${r} 0 0 1 ${100 + r} 100`
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div className={cn("relative mx-auto", className)} style={{ width: size, maxWidth: "100%" }}>
      <svg viewBox="0 0 200 112" className="block w-full" role="img" aria-label={label}>
        <path d={arc} fill="none" stroke="var(--border)" strokeWidth="12" strokeLinecap="round" />
        {score !== null ? (
          <path
            d={arc}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="12"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${fraction} 1`}
          />
        ) : null}
        {ticks.map((t) => {
          const a = Math.PI * (1 - t)
          const x1 = 100 + Math.cos(a) * (r - 14)
          const y1 = 100 - Math.sin(a) * (r - 14)
          const x2 = 100 + Math.cos(a) * (r - 20)
          const y2 = 100 - Math.sin(a) * (r - 20)
          return <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--input)" strokeWidth="1.5" strokeLinecap="round" />
        })}
      </svg>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="text-5xl leading-none font-extrabold tracking-display tabular-nums">
          {score === null ? "–" : format(shown)}
        </span>
        {score === null ? <span className="mt-1 text-xs font-semibold text-muted-foreground">{empty}</span> : null}
      </div>
    </div>
  )
}
