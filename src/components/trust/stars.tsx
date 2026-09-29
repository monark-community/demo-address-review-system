import { cn } from "@/lib/utils"

const STAR = "M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.53L12 17.49l-5.87 3.08 1.12-6.53L2.5 9.41l6.56-.95L12 2.5z"

/** One star, filled or outlined (decorative; the caller labels it). */
export function Star({ filled, size = 24, className }: { filled: boolean; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn("shrink-0", className)}>
      <path
        d={STAR}
        fill={filled ? "var(--primary)" : "none"}
        stroke={filled ? "var(--primary)" : "var(--input)"}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Flat orange stars, always paired with a text value (the label is for
 * assistive tech; callers show the number next to it).
 */
export function Stars({
  value,
  label,
  size = 16,
  className,
}: {
  value: number
  label: string
  size?: number
  className?: string
}) {
  return (
    <span role="img" aria-label={label} className={cn("inline-flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)))
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
            <path d={STAR} fill="none" stroke="var(--input)" strokeWidth="1.5" strokeLinejoin="round" />
            {fill > 0 ? (
              <path
                d={STAR}
                fill="var(--primary)"
                stroke="var(--primary)"
                strokeWidth="1.5"
                strokeLinejoin="round"
                style={fill < 1 ? { clipPath: `inset(0 ${Math.round((1 - fill) * 100)}% 0 0)` } : undefined}
              />
            ) : null}
          </svg>
        )
      })}
    </span>
  )
}
