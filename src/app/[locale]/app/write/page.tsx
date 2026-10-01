import type { Metadata } from "next"

import { Composer } from "@/components/demo/composer"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/write">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.write
  return { ...pageMetadata(locale, "/app/write", m.title, m.description), robots: { index: false, follow: true } }
}

export default async function WritePage({ searchParams }: PageProps<"/[locale]/app/write">) {
  const sp = await searchParams
  const to = typeof sp.to === "string" ? sp.to : undefined
  return <Composer key={to ?? ""} initialTo={to} />
}
