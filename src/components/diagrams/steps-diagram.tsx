import type { LucideIcon } from "lucide-react"

/**
 * Flat orange line-art flow: outlined circles joined by a thin line
 * (the brand divider's vocabulary). Horizontal on wide screens, vertical on phones.
 */
export function StepsDiagram({
  label,
  steps,
  icons,
}: {
  label: string
  steps: { title: string; body: string }[]
  icons: LucideIcon[]
}) {
  return (
    <figure aria-label={label} className="mt-8">
      <ol className="relative grid gap-6 md:grid-flow-col md:auto-cols-fr md:gap-4">
        <span aria-hidden="true" className="absolute top-6 bottom-6 left-6 w-px bg-primary md:hidden" />
        <span
          aria-hidden="true"
          className="absolute top-6 hidden h-px bg-primary md:block"
          style={{ left: `calc(100% / ${steps.length} / 2)`, right: `calc(100% / ${steps.length} / 2)` }}
        />
        {steps.map((s, i) => {
          const Icon = icons[i]!
          return (
            <li key={s.title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
              <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                <Icon className="size-5 text-foreground" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <div className="pt-1 md:pt-0">
                <p className="text-xs font-bold text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </figure>
  )
}
