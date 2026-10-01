import { intlLocale, type Locale } from "@/i18n/config"
import type { TokenSymbol } from "@/lib/demo/types"

export function formatNumber(n: number, locale: Locale, maxFrac = 2): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: maxFrac }).format(n)
}

/** A score to exactly one decimal (4.3 / 4,3). */
export function formatScore(n: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n)
}

export function formatPercent(fraction: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { style: "percent", maximumFractionDigits: 0 }).format(fraction)
}

export function formatToken(amount: number, token: TokenSymbol, locale: Locale): string {
  return `${formatNumber(amount, locale, token === "tETH" ? 4 : 2)} ${token}`
}

export function formatBlock(block: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 }).format(block)
}

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium" }).format(new Date(iso))
}

export function formatMonthYear(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { month: "long", year: "numeric" }).format(new Date(iso))
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}

/** "3 days ago" style relative time, falling back to a date after a month. */
export function formatRelative(iso: string, locale: Locale, now = Date.now()): string {
  const diff = Date.parse(iso) - now
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" })
  const min = 60_000
  const hour = 60 * min
  const day = 24 * hour
  if (abs < min) return rtf.format(0, "minute")
  if (abs < hour) return rtf.format(Math.round(diff / min), "minute")
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour")
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day")
  return formatDate(iso, locale)
}

export function shortHash(hash: string, start = 8, end = 6): string {
  return hash.length > start + end + 1 ? `${hash.slice(0, start)}…${hash.slice(-end)}` : hash
}

export function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}
