import { ArrowRightIcon, ChevronDownIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HeroCard } from "@/components/home/hero-card"
import { SectionDivider } from "@/components/site/section-divider"
import { UnverifiedChip, VerifiedChip } from "@/components/trust/chips"
import { Button } from "@/components/ui/button"
import { WalletAvatar } from "@/components/ui/wallet"
import { seededAddress } from "@/lib/demo/ids"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { formatPercent } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, "/", null, d.description)
}

const MODERATORS = ["ines-belkacem", "diego-ramirez", "priya-nair"].map(seededAddress)

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const h = getDictionary(locale).home

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden dark:bg-[radial-gradient(ellipse_at_70%_40%,color-mix(in_oklch,var(--card),transparent_40%),transparent_70%)]">
        <Image
          src="/brand/monark-mesh.svg"
          alt=""
          width={569}
          height={571}
          unoptimized
          priority
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-44 w-[34rem] max-w-none opacity-[0.10] select-none sm:-right-24 lg:-top-10 lg:-right-16 lg:w-[46rem] dark:opacity-[0.16]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pt-20 lg:pb-24">
          <div>
            <h1 className="text-[2.25rem] leading-[1.05] font-extrabold tracking-display sm:text-5xl lg:text-[4rem]">{h.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">{h.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={href(locale, "/app")}>
                  {h.ctaPrimary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/how-it-works")}>{h.ctaSecondary}</Link>
              </Button>
            </div>
          </div>
          <HeroCard copy={h.card} locale={locale} />
        </div>
      </section>

      {/* 1. Why the score is hard to fake: three rules, each shown with a fragment of real UI */}
      <section aria-labelledby="rules" className="border-y bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="rules" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {h.rules.title}
          </h2>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <article className="flex flex-col rounded-3xl border bg-card p-6">
              <h3 className="text-xl font-bold">{h.rules.verified.title}</h3>
              <p className="mt-2 text-muted-foreground">{h.rules.verified.body}</p>
              <div aria-hidden="true" className="mt-auto flex flex-col gap-3 pt-6">
                <div className="flex items-center justify-between gap-3">
                  <VerifiedChip label={h.rules.verified.chip} />
                  <span className="text-sm font-extrabold tabular-nums">{formatPercent(1, locale)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <UnverifiedChip label={h.rules.verified.chipNone} />
                  <span className="text-sm font-extrabold text-muted-foreground tabular-nums">{formatPercent(0.4, locale)}</span>
                </div>
              </div>
            </article>
            <article className="flex flex-col rounded-3xl border bg-card p-6">
              <h3 className="text-xl font-bold">{h.rules.standing.title}</h3>
              <p className="mt-2 text-muted-foreground">{h.rules.standing.body}</p>
              <ul className="mt-auto flex flex-col gap-2.5 pt-6">
                {h.rules.standing.bars.map((b) => (
                  <li key={b.label} className="text-xs">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">{b.label}</span>
                      <span className="font-bold tabular-nums">{formatPercent(b.weight, locale)}</span>
                    </div>
                    <span className="mt-1 block h-2 overflow-hidden rounded-full bg-border">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${b.weight * 100}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </article>
            <article className="flex flex-col rounded-3xl border bg-card p-6">
              <h3 className="text-xl font-bold">{h.rules.moderation.title}</h3>
              <p className="mt-2 text-muted-foreground">{h.rules.moderation.body}</p>
              <div className="mt-auto pt-6">
                <div aria-hidden="true" className="flex items-center gap-2">
                  {MODERATORS.map((a) => (
                    <span key={a} className="rounded-full ring-2 ring-primary ring-offset-2 ring-offset-card">
                      <WalletAvatar address={a} size={32} />
                    </span>
                  ))}
                  <span className="size-8 rounded-full border-2 border-dashed border-input" />
                  <span className="size-8 rounded-full border-2 border-dashed border-input" />
                </div>
                <p className="mt-3 text-sm font-semibold">{h.rules.moderation.tally}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 2. Who relies on it */}
      <section aria-labelledby="who" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 id="who" className="max-w-2xl text-3xl font-bold tracking-display sm:text-[2rem]">
          {h.who.title}
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {h.who.items.map((item, i) => {
            const photo = PHOTOS[i]!
            return (
              <li key={item.title} className="flex flex-col overflow-hidden rounded-3xl border bg-card">
                <div className="relative aspect-[4/3]">
                  <Image src={photo.file} alt={item.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                  <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full bg-card/95 px-3 py-1 text-xs font-bold text-foreground">
                    {item.chip}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* 3. FAQ: the only one on the site */}
      <section aria-labelledby="faq" className="border-t bg-card/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="faq" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {h.faq.title}
          </h2>
          <div className="mt-8 divide-y rounded-3xl border bg-card">
            {h.faq.items.map((item) => (
              <details key={item.q} className="group px-5">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDownIcon className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="max-w-[68ch] pb-5 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider className="mt-0" />

      {/* 4. Closing */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 lg:py-24">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-display sm:text-4xl">{h.closing.title}</h2>
        <Button asChild size="lg" className="mt-8">
          <Link href={href(locale, "/app")}>
            {h.closing.cta}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </>
  )
}
