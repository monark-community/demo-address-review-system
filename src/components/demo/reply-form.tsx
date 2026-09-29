"use client"

import { useId, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { addReply } from "@/lib/demo/ops"
import type { DemoState, Review } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { nameOf } from "./identity"
import { TxFeedback } from "./tx-feedback"

const MIN = 20
const MAX = 400

/** Public reply by the reviewed address, once per review. */
export function ReplyForm({ state, review, onDone, className }: { state: DemoState; review: Review; onDone: () => void; className?: string }) {
  const { app } = useAppCopy()
  const f = app.replyForm
  const id = useId()
  const [text, setText] = useState("")
  const [touched, setTouched] = useState(false)
  const tx = useTx()
  const length = text.trim().length
  const error = length < MIN ? f.tooShort : length > MAX ? f.tooLong : null

  async function submit() {
    setTouched(true)
    if (error) return
    const ok = await tx.run(
      {
        title: t(app.summaries.reply, { name: nameOf(state, review.from) }),
        rows: [{ label: app.summaries.rows.review, value: nameOf(state, review.from) }],
        movesValue: true,
      },
      (hash, block) => {
        addReply(review.id, text, hash, block)
        toast.success(f.done)
      }
    )
    if (ok) onDone()
  }

  return (
    <form
      className={cn("flex flex-col gap-3 rounded-xl border bg-background p-4", className)}
      onSubmit={(e) => {
        e.preventDefault()
        void submit()
      }}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${id}-reply`} className="font-bold">
          {f.title}
        </Label>
        <Textarea
          id={`${id}-reply`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={f.placeholder}
          maxLength={MAX + 50}
          aria-invalid={touched && !!error}
          aria-describedby={`${id}-reply-help`}
          disabled={tx.busy}
          className="min-h-24"
        />
        <div id={`${id}-reply-help`} className="flex justify-between gap-3 text-xs">
          <span className={cn(touched && error ? "text-destructive" : "text-muted-foreground")}>{touched && error ? error : ""}</span>
          <span className="shrink-0 text-muted-foreground tabular-nums">{t(f.count, { n: length })}</span>
        </div>
      </div>
      <TxFeedback state={tx.state} pendingLabel={f.pending} onDismiss={tx.reset} />
      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone} disabled={tx.busy}>
          {f.cancel}
        </Button>
        <Button type="submit" disabled={tx.busy}>
          {f.submit}
        </Button>
      </div>
    </form>
  )
}
