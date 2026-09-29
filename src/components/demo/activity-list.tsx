"use client"

import { EyeOffIcon, FlagIcon, GavelIcon, MessageSquareReplyIcon, PenLineIcon, StarIcon } from "lucide-react"

import { t } from "@/i18n/t"
import type { ActivityEntry, ActivityKind } from "@/lib/demo/ops"
import type { DemoState } from "@/lib/demo/types"
import { formatBlock, formatDateTime, shortHash } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { nameOf } from "./identity"

const ICONS: Record<ActivityKind, typeof StarIcon> = {
  review_received: StarIcon,
  review_given: PenLineIcon,
  reply_posted: MessageSquareReplyIcon,
  reply_received: MessageSquareReplyIcon,
  flagged: FlagIcon,
  mod_vote: GavelIcon,
  case_resolved: EyeOffIcon,
}

/** The address's activity trail: every event with its time, block and hash. */
export function ActivityList({ state, entries }: { state: DemoState; entries: ActivityEntry[] }) {
  const { app, locale } = useAppCopy()
  const a = app.activity

  if (entries.length === 0) {
    return <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">{a.empty}</p>
  }

  return (
    <ol className="relative flex flex-col rounded-2xl border bg-card">
      {entries.map((e) => {
        const Icon = ICONS[e.kind]
        const name = e.other ? nameOf(state, e.other) : ""
        const text = t(a.kinds[e.kind], {
          name,
          n: e.rating ?? "",
          vote: e.vote ? app.moderation.voteNames[e.vote] : "",
          outcome: e.outcome ? a.outcomes[e.outcome] : "",
        })
        return (
          <li key={e.id} className="flex gap-3 border-b px-4 py-3 last:border-b-0">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border bg-background">
              <Icon className="size-4 text-primary" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{text}</p>
              <p className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                <time dateTime={e.at}>{formatDateTime(e.at, locale)}</time>
                <span aria-hidden="true">·</span>
                <span>{t(a.block, { block: formatBlock(e.block, locale) })}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono" title={e.hash}>
                  {shortHash(e.hash)}
                </span>
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
