import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "TrustRate by Monark"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

const STAR = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const mark = await readFile(join(process.cwd(), "public/brand/monark-mark.svg"), "utf8")
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`
  const score = locale === "fr" ? "4,3" : "4.3"

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFF9F3", color: "#15110E", padding: 72, gap: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markSrc} width={64} height={64} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>TrustRate</span>
              <span style={{ fontSize: 22, color: "#625952", marginTop: 6 }}>{d.common.byMonark}</span>
            </div>
          </div>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{d.meta.ogTagline}</div>
          <div style={{ fontSize: 22, color: "#625952" }}>{d.common.demoBadge}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 400,
            alignSelf: "center",
            background: "#FFFEFC",
            border: "2px solid #E9DFD7",
            borderRadius: 32,
            padding: 36,
            gap: 18,
          }}
        >
          <span style={{ fontSize: 26, fontWeight: 800 }}>Amara Okafor</span>
          <span style={{ fontSize: 20, color: "#625952", marginTop: -12 }}>{d.home.card.role}</span>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <span style={{ fontSize: 96, fontWeight: 800, lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 22, color: "#625952", marginBottom: 12 }}>/ 5</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <svg key={i} width="34" height="34" viewBox="0 0 24 24">
                <path d={STAR} fill={i < 4 ? "#F88D10" : "none"} stroke={i < 4 ? "#F88D10" : "#857F7A"} strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#F88D10" strokeWidth="3" />
              <path d="M11 18.5l4.5 4.5L25 13.5" fill="none" stroke="#B65000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: 20, color: "#15110E", fontWeight: 700 }}>{d.home.card.verified}</span>
          </div>
        </div>
      </div>
    ),
    size
  )
}
