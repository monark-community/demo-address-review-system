"use client"

import { useRouter } from "next/navigation"
import { useId, useState, type ReactNode } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { openCase } from "@/lib/demo/ops"
import type { DemoState, FlagReason, Review } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { Disclaimer } from "./disclaimer"
import { nameOf } from "./identity"
import { TxFeedback } from "./tx-feedback"

const REASONS: FlagReason[] = ["spam", "harassment", "off-topic", "conflict"]

export function FlagDialog({ state, review, children }: { state: DemoState; review: Review; children: ReactNode }) {
  const { app, disclaimer, locale } = useAppCopy()
  const f = app.flagForm
  const id = useId()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState<FlagReason>("spam")
  const [note, setNote] = useState("")
  const tx = useTx()

  async function submit() {
    const ok = await tx.run(
      {
        title: t(app.summaries.flag, { name: nameOf(state, review.to) }),
        rows: [
          { label: app.summaries.rows.review, value: nameOf(state, review.from) },
          { label: app.summaries.rows.reason, value: app.reasons[reason] },
        ],
        movesValue: true,
      },
      (hash, block) => {
        openCase({ reviewId: review.id, reason, note, flaggedBy: state.wallet.address }, hash, block)
      }
    )
    if (ok) {
      setOpen(false)
      tx.reset()
      toast.success(f.done, {
        action: { label: f.viewQueue, onClick: () => router.push(href(locale, "/app/moderation")) },
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (tx.busy) return
        setOpen(o)
        if (!o) tx.reset()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent closeLabel={app.close} className="max-w-[calc(100%-2rem)] gap-5 rounded-3xl sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-extrabold">{f.title}</DialogTitle>
          <DialogDescription>{f.body}</DialogDescription>
        </DialogHeader>
        <form
          id={`${id}-flag`}
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-bold">{f.reason}</legend>
            {REASONS.map((r) => (
              <label
                key={r}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2 text-sm transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                  reason === r ? "border-primary bg-secondary/60 font-semibold" : "hover:bg-muted"
                )}
              >
                <input
                  type="radio"
                  name={`${id}-reason`}
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="size-4 accent-[var(--primary)]"
                  disabled={tx.busy}
                />
                {app.reasons[r]}
              </label>
            ))}
          </fieldset>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-note`}>{f.note}</Label>
            <Textarea
              id={`${id}-note`}
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 280))}
              placeholder={f.notePlaceholder}
              className="min-h-20"
              disabled={tx.busy}
            />
          </div>
          <TxFeedback state={tx.state} pendingLabel={f.pending} onDismiss={tx.reset} />
          <Disclaimer text={disclaimer} />
        </form>
        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={tx.busy}>
            {app.replyForm.cancel}
          </Button>
          <Button type="submit" form={`${id}-flag`} disabled={tx.busy}>
            {f.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
