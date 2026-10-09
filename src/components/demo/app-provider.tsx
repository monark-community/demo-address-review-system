"use client"

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { initDemo } from "@/lib/demo/store"

import { WalletPrompt } from "./wallet-prompt"

export interface AppCopy {
  locale: Locale
  app: Dictionary["app"]
  disclaimer: string
  demoBadge: string
}

const AppContext = createContext<AppCopy | null>(null)

export function useAppCopy(): AppCopy {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppCopy must be used inside <AppProvider>")
  return ctx
}

/** The translated labels for @monark/ui TxFeedback. */
export function useTxFeedbackLabels() {
  const { tx } = useAppCopy().app
  return {
    signingLabel: tx.signing,
    pendingLabel: tx.pending,
    pendingStatusLabel: tx.pending,
    confirmedLabel: tx.confirmed,
    failedLabel: tx.failed,
    reasons: { rejected: tx.rejected, reverted: tx.reverted },
    retryLabel: tx.retry,
    dismissLabel: tx.dismiss,
  }
}

export function AppProvider({ value, children }: { value: AppCopy; children: ReactNode }) {
  const narrow = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(max-width: 767px)")
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  )
  useEffect(() => {
    initDemo(value.locale)
  }, [value.locale])

  return (
    <AppContext.Provider value={value}>
      {children}
      <WalletPrompt />
      <Toaster
        // Desktop: top-right, over the app bar's demo controls. Page titles are
        // left-aligned and the score panel sits on the left, so a toast never
        // covers the review, score or tally it reports on. Phones: bottom,
        // since flows scroll the reported content to the top or centre.
        position={narrow ? "bottom-center" : "top-right"}
        offset={{ top: 80, right: 24 }}
        mobileOffset={{ bottom: 16, left: 16, right: 16 }}
      />
    </AppContext.Provider>
  )
}
