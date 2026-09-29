import { cn } from "@/lib/utils"

/**
 * The seal: an orange ring (like the brand divider's end caps) around a check.
 * With `animate`, the ring draws itself once, as when a review is sealed.
 */
export function SealStamp({ size = 20, animate = false, className }: { size?: number; animate?: boolean; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={cn("shrink-0", className)}>
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="2"
        pathLength={1}
        className={animate ? "tr-ring" : undefined}
        transform="rotate(-90 12 12)"
      />
      <path d="M7.8 12.3l2.8 2.8 5.6-5.8" fill="none" stroke="var(--primary-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
