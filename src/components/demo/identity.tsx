"use client"

import Link from "next/link"

import { WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { memberOf } from "@/lib/demo/ops"
import { isAddress, sameAddress } from "@/lib/demo/network"
import type { DemoState } from "@/lib/demo/types"
import { shortAddress } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

/** A human label for an address: the community label, or the short address. */
export function nameOf(state: DemoState, address: string): string {
  return memberOf(state, address)?.name ?? shortAddress(address)
}

export function isYou(state: DemoState, address: string): boolean {
  return sameAddress(state.wallet.address, address)
}

/** Avatar + name + role (or short address), linking to the profile. */
export function Identity({
  state,
  address,
  size = 36,
  showRole = true,
  link = true,
  className,
}: {
  state: DemoState
  address: string
  size?: number
  showRole?: boolean
  link?: boolean
  className?: string
}) {
  const { app, locale } = useAppCopy()
  const member = memberOf(state, address)
  const you = isYou(state, address)
  const name = member?.name ?? shortAddress(address)
  const sub = member ? member.role : app.unlabelled
  const safeAddress = isAddress(address) ? address.trim() : null

  const inner = (
    <>
      <WalletAvatar address={address} size={size} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className={cn("truncate font-bold", !member && "font-mono text-sm")}>{name}</span>
          {you ? (
            <span className="shrink-0 rounded-full bg-secondary px-1.5 py-px text-[0.6875rem] font-bold text-foreground">{app.you}</span>
          ) : null}
        </span>
        {showRole ? <span className="truncate text-xs text-muted-foreground">{sub}</span> : null}
      </span>
    </>
  )

  if (!link || !safeAddress) return <span className={cn("flex min-w-0 items-center gap-2.5", className)}>{inner}</span>
  return (
    <Link
      href={href(locale, `/app/profile/${safeAddress}`)}
      className={cn("group flex min-w-0 items-center gap-2.5 rounded-lg [&_.font-bold]:group-hover:underline [&_.font-bold]:underline-offset-4", className)}
    >
      {inner}
    </Link>
  )
}
