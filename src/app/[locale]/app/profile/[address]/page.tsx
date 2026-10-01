import type { Metadata } from "next"

import { ProfileView } from "@/components/demo/profile-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/profile/[address]">): Promise<Metadata> {
  const { locale, address } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.profile
  return { ...pageMetadata(locale, `/app/profile/${address}`, m.title, m.description), robots: { index: false, follow: true } }
}

export default async function ProfilePage({ params, searchParams }: PageProps<"/[locale]/app/profile/[address]">) {
  const { address } = await params
  const sp = await searchParams
  const sealed = typeof sp.sealed === "string" ? sp.sealed : undefined
  return <ProfileView key={`${address}:${sealed ?? ""}`} address={decodeURIComponent(address)} sealed={sealed} />
}
