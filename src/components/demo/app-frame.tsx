"use client"

import { Loader2Icon, PenLineIcon, WalletIcon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { toast } from "sonner"

import { AppLoading } from "@/components/ui/app-loading"
import { AppTabs } from "@/components/ui/app-tabs"
import { Button } from "@/components/ui/button"
import { DemoControls } from "@/components/ui/demo-controls"
import { MonarkMark } from "@/components/ui/site-brand"
import { Skeleton } from "@/components/ui/skeleton"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { NETWORK_NAME, sameAddress } from "@/lib/demo/network"
import { resetDemo, setSettings, useDemo, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"

import { useAppCopy } from "./app-provider"

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
        {!demo ? (
          <AppLoading label={app.loading}>
            <Skeleton className="h-9 w-56 rounded-full" />
            <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
              <Skeleton className="h-72 rounded-2xl" />
              <div className="flex flex-col gap-3">
                <Skeleton className="h-32 rounded-2xl" />
                <Skeleton className="h-32 rounded-2xl" />
              </div>
            </div>
          </AppLoading>
        ) : demo.wallet.status !== "connected" ? <ConnectGate /> : children}
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
  const writeHref = href(locale, "/app/write")
  const c = app.controls
  const actions = (
    <>
      {demo ? (
        <DemoControls
          networkName={NETWORK_NAME}
          slow={demo.settings.slow}
          onSlowChange={(slow) => setSettings({ slow })}
          failNext={demo.settings.failNext}
          onFailNextChange={(failNext) => setSettings({ failNext })}
          onReset={() => {
            resetDemo(locale)
            toast.success(c.resetDone)
          }}
          title={c.title}
          openLabel={c.open}
          slowLabel={c.slow}
          slowHint={c.slowHint}
          failNextLabel={c.failNext}
          failNextHint={c.failNextHint}
          resetLabel={c.reset}
          resetHint={c.resetHint}
          resetConfirmTitle={c.resetConfirm}
          resetConfirmBody={c.resetConfirmBody}
          resetConfirmLabel={c.resetDo}
          cancelLabel={c.cancel}
          closeLabel={app.close}
        />
      ) : null}
      {connected && pathname !== writeHref ? (
        // Phones: hidden, so the three sections fit in one bar; every profile has its own "Write a review".
        <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
          <Link href={writeHref}>
            <PenLineIcon aria-hidden="true" />
            {app.nav.write}
          </Link>
        </Button>
      ) : null}
    </>
  )

  return (
    <AppTabs
      tabs={
        connected
          ? [
              { href: href(locale, "/app"), label: app.nav.explore, exact: true },
              { href: href(locale, `/app/profile/${me}`), label: app.nav.me },
              {
                href: href(locale, "/app/moderation"),
                label: app.nav.moderation,
                count: openForYou,
                countLabel: t(app.nav.openCases, { n: openForYou }),
              },
            ]
          : []
      }
      pathname={pathname}
      LinkComponent={Link}
      label={app.nav.label}
      aria-hidden={connected ? undefined : true}
      actions={actions}
    />
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
      <MonarkMark className="size-14" />
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
