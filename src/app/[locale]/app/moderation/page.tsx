import type { Metadata } from "next"

import { ModerationView } from "@/components/demo/moderation-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/moderation">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.moderation
  return pageMetadata(locale, "/app/moderation", m.title, m.description)
}

export default function ModerationPage() {
  return <ModerationView />
}
