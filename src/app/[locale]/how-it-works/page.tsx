import {
  ArrowRightIcon,
  CalculatorIcon,
  EyeOffIcon,
  FlagIcon,
  FolderOpenIcon,
  GavelIcon,
  HandshakeIcon,
  PenLineIcon,
  SignatureIcon,
  StampIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { StepsDiagram } from "@/components/diagrams/steps-diagram"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.how
  return pageMetadata(locale, "/how-it-works", m.title, m.description)
}

const CONTRACT = `interface ITrustRate {
  event ReviewSealed(
    uint256 indexed id,
    address indexed reviewer,
    address indexed subject,
    uint8 rating,          // 1–5
    bytes32 interaction,   // 0x0 when unverified
    string uri             // comment + tags
  );
  event ReplySealed(uint256 indexed reviewId, string uri);
  event Flagged(uint256 indexed reviewId, uint8 reason);
  event ModVote(uint256 indexed reviewId, address moderator, bool hide);
  event Resolved(uint256 indexed reviewId, bool hidden);

  function review(address subject, uint8 rating, bytes32 interaction, string calldata uri) external returns (uint256);
  function reply(uint256 reviewId, string calldata uri) external;
  function flag(uint256 reviewId, uint8 reason) external;
  function vote(uint256 reviewId, bool hide) external; // moderators only
}`

export default async function HowItWorks({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const h = getDictionary(locale).how

  return (
    <>
      <section className="mx-auto w-full max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:pt-20">
        <p className="eyebrow text-primary-ink">{h.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold tracking-display sm:text-5xl">{h.title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{h.intro}</p>
      </section>

      <section aria-labelledby="life" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h2 id="life" className="text-2xl font-bold sm:text-[2rem]">
          {h.life.title}
        </h2>
        <StepsDiagram label={h.life.label} steps={h.life.steps} icons={[HandshakeIcon, PenLineIcon, SignatureIcon, StampIcon, CalculatorIcon]} />
      </section>

      <SectionDivider className="my-8" />

      <section aria-labelledby="weights" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h2 id="weights" className="text-2xl font-bold sm:text-[2rem]">
          {h.weights.title}
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{h.weights.body}</p>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="overflow-x-auto rounded-3xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3 font-semibold">{h.weights.table.factor}</th>
                  <th scope="col" className="px-5 py-3 font-semibold">{h.weights.table.when}</th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">{h.weights.table.value}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {h.weights.table.rows.map((r) => (
                  <tr key={r.when}>
                    <th scope="row" className="px-5 py-3 font-bold">{r.factor}</th>
                    <td className="px-5 py-3">{r.when}</td>
                    <td className="px-5 py-3 text-right font-extrabold whitespace-nowrap tabular-nums">{r.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl border bg-card p-6">
            <h3 className="text-lg font-bold">{h.weights.formulaTitle}</h3>
            <p className="rounded-2xl bg-secondary px-4 py-3 font-mono text-sm break-words">{h.weights.formula}</p>
            <p className="text-sm text-muted-foreground">{h.weights.formulaBody}</p>
            <h3 className="mt-2 text-lg font-bold">{h.weights.exampleTitle}</h3>
            <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
              {h.weights.example.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <p className="text-sm font-semibold">{h.weights.exampleResult}</p>
            <h3 className="mt-2 text-lg font-bold">{h.weights.confidenceTitle}</h3>
            <p className="text-sm text-muted-foreground">{h.weights.confidence}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="moderation" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h2 id="moderation" className="text-2xl font-bold sm:text-[2rem]">
          {h.moderation.title}
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{h.moderation.body}</p>
        <StepsDiagram label={h.moderation.label} steps={h.moderation.steps} icons={[FlagIcon, FolderOpenIcon, GavelIcon, EyeOffIcon]} />
      </section>

      <section aria-labelledby="trail" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h2 id="trail" className="text-2xl font-bold sm:text-[2rem]">
          {h.trail.title}
        </h2>
        <p className="mt-3 max-w-[68ch] text-muted-foreground">{h.trail.body}</p>
      </section>

      <SectionDivider className="my-8" />

      <section aria-labelledby="dev" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <h2 id="dev" className="text-2xl font-bold sm:text-[2rem]">
          {h.dev.title}
        </h2>
        <p className="mt-3 max-w-[68ch] text-muted-foreground">{h.dev.body}</p>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <pre className="overflow-x-auto rounded-3xl border bg-card p-5 text-xs leading-relaxed" tabIndex={0}>
            <code>{CONTRACT}</code>
          </pre>
          <ul className="flex flex-col gap-3">
            {h.dev.notes.map((n) => (
              <li key={n} className="flex gap-3 rounded-2xl border bg-card p-4 text-sm">
                <span aria-hidden="true" className="mt-1 size-2.5 shrink-0 rounded-full border-2 border-primary" />
                {n}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-display">{h.cta.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{h.cta.body}</p>
        <Button asChild size="lg" className="mt-8">
          <Link href={href(locale, "/app")}>
            {h.cta.button}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </>
  )
}
