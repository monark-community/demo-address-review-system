"use client"

import { Loader2Icon, PenLineIcon, WalletIcon, XCircleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { sameAddress } from "@/lib/demo/network"
import { useDemo, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"

/**
 * App chrome under the site header: ONE compact bar with the section nav on
 * the left and the network + demo controls pill (and "Write a review") on the
 * right. No testnet strip: that line lives in the wallet prompt, once per
 * transaction. Gates on wallet connection.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app } = useAppCopy()

  return (
    <div className="flex flex-1 flex-col">
      <AppBar connected={demo?.wallet.status === "connected"} />
      {!storageOk ? (
        <p role="alert" className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm text-warning sm:px-6">
          {app.storageError}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6 lg:py-10">
        {!demo ? <AppLoading label={app.loading} /> : demo.wallet.status !== "connected" ? <ConnectGate /> : children}
      </div>
    </div>
  )
}

function AppBar({ connected }: { connected: boolean }) {
  const demo = useDemo()
  const pathname = usePathname() ?? ""
  const { app, locale } = useAppCopy()
  const me = demo?.wallet.address ?? ""
  const openForYou = demo
    ? demo.cases.filter((c) => c.status === "open" && !c.votes.some((v) => sameAddress(v.moderator, me))).length
    : 0
  const items = [
    { href: href(locale, "/app"), label: app.nav.explore, exact: true },
    { href: href(locale, `/app/profile/${me}`), label: app.nav.me },
    { href: href(locale, "/app/moderation"), label: app.nav.moderation, count: openForYou },
  ]
  const writeHref = href(locale, "/app/write")

  return (
    <div className="border-b bg-secondary/40">
      <div className="mx-auto flex min-h-13 max-w-6xl items-center gap-2 px-4 sm:px-6">
        {connected ? (
          <nav aria-label={app.nav.label} className="min-w-0 flex-1">
            <ul className="-mx-1 flex min-w-0 items-center gap-0.5 overflow-x-auto px-1 py-2 [scrollbar-width:none] sm:gap-1">
              {items.map((item) => {
                const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.href} className="shrink-0">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold transition-colors duration-150 sm:gap-2 sm:px-3.5",
                        active ? "bg-card text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {item.label}
                      {item.count ? (
                        <span
                          className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground"
                          aria-label={t(app.nav.openCases, { n: item.count })}
                        >
                          {item.count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        ) : (
          <div className="flex-1" />
        )}
        <div className="flex shrink-0 items-center gap-2">
          <DemoControls />
          {connected && pathname !== writeHref ? (
            // Phones: hidden, so the three sections fit in one bar; every profile has its own "Write a review".
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href={writeHref}>
                <PenLineIcon aria-hidden="true" />
                <span className="hidden sm:inline">{app.nav.write}</span>
                <span className="sr-only sm:hidden">{app.nav.write}</span>
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function AppLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">{label}</span>
      <div className="h-9 w-56 animate-pulse rounded-full bg-muted" />
      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        <div className="flex flex-col gap-3">
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    </div>
  )
}

function ConnectGate() {
  const demo = useDemo()
  const { app } = useAppCopy()
  const g = app.gate
  const connecting = demo?.wallet.status === "connecting"
  const rejected = demo?.wallet.lastError === "rejected"

  return (
    <section aria-labelledby="gate-title" className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center py-8 text-center">
      <Image src="/brand/monark-mark.svg" alt="" width={56} height={56} unoptimized className="size-14" />
      <h1 id="gate-title" className="mt-6 text-3xl font-extrabold tracking-display">
        {g.title}
      </h1>
      <p className="mt-3 text-muted-foreground">{g.body}</p>
      <Button
        size="lg"
        className="mt-8 w-full sm:w-auto"
        disabled={connecting}
        onClick={() =>
          void connectWallet({
            title: app.summaries.signIn,
            rows: [{ label: app.summaries.signInRow, value: app.summaries.signInValue }],
            movesValue: false,
            noFee: true,
          })
        }
      >
        {connecting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <WalletIcon aria-hidden="true" />}
        {connecting ? app.wallet.connecting : g.connect}
      </Button>
      <div aria-live="polite" className="mt-4 min-h-6">
        {rejected ? (
          <p role="alert" className="flex items-start gap-2 text-left text-sm text-destructive">
            <XCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {g.rejected}
          </p>
        ) : null}
      </div>
    </section>
  )
}
