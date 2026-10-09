"use client"

import { useMemo } from "react"

import { MonarkMark } from "@/components/ui/site-brand"
import { WalletPrompt as MonarkWalletPrompt } from "@/components/ui/wallet-prompt"
import { estimateFee, NETWORK_NAME } from "@/lib/demo/network"
import { useDemo, usePrompt } from "@/lib/demo/store"

import { useAppCopy } from "./app-provider"

/** The simulated wallet's confirmation sheet. Closing it counts as a rejection. */
export function WalletPrompt() {
  const prompt = usePrompt()
  const demo = useDemo()
  const { app, disclaimer, locale } = useAppCopy()
  const p = app.prompt
  // A fresh fee estimate per request.
  const fee = useMemo(() => (prompt ? estimateFee() : 0), [prompt])
  const feeText = fee ? `${fee.toLocaleString(locale === "fr" ? "fr-CA" : "en-CA", { maximumFractionDigits: 5 })} tETH` : ""
  const movesValue = !!prompt?.summary.movesValue

  return (
    <MonarkWalletPrompt
      open={!!prompt}
      onConfirm={() => prompt?.resolve(true)}
      onReject={() => prompt?.resolve(false)}
      title={prompt?.summary.title ?? p.title}
      description={p.title}
      site={
        <>
          <MonarkMark />
          {p.site}
        </>
      }
      account={demo ? { name: demo.wallet.name, address: demo.wallet.address } : undefined}
      rows={prompt?.summary.rows}
      network={NETWORK_NAME}
      fee={prompt?.summary.noFee ? undefined : feeText}
      disclaimer={movesValue ? disclaimer : p.simulated}
      warning={movesValue}
      confirmLabel={p.confirm}
      rejectLabel={p.reject}
      networkLabel={p.network}
      feeLabel={p.fee}
      closeLabel={app.close}
    />
  )
}
