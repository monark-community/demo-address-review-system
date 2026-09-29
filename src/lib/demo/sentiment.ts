import type { Sentiment } from "./types"

/**
 * A deliberately small, transparent word-list classifier for English and
 * French review comments. It never changes a score: TrustRate only uses it to
 * label reviews and to warn a writer whose words and stars disagree.
 */

const POSITIVE = [
  // English
  "great", "excellent", "clear", "solid", "useful", "helpful", "beautiful", "friendly", "patient", "precise",
  "thorough", "quick", "quickly", "early", "fair", "favourite", "favorite", "welcome", "enjoyed", "best-run",
  "easiest", "lovely", "natural", "careful", "reliable", "recommend", "professional", "amazing", "perfect",
  "on time", "on schedule", "on budget", "would hire again", "well-organised", "well organized", "smooth", "kind",
  "responsive", "delivered", "love", "happy", "impressed", "fantastic", "good", "readable", "accurate", "warm",
  // French
  "excellent", "excellente", "clair", "claire", "solide", "utile", "utiles", "magnifique", "magnifiques", "agréable",
  "patiente", "patient", "précise", "précis", "rigoureuse", "rigoureux", "rapide", "rapides", "rapidement", "avance",
  "équitable", "équitablement", "préféré", "préférée", "bienvenu", "apprécié", "chaleureuse", "chaleureux", "adorable",
  "naturel", "soigné", "fiable", "recommande", "professionnel", "parfait", "incroyable", "à temps", "à l'heure",
  "dans le budget", "bien organisée", "bien organisé", "fluide", "gentil", "réactif", "réactive", "livré", "bravo",
  "content", "impressionné", "bon", "bons", "bonne", "lisibles", "exacte", "simple", "mieux menée",
]

const NEGATIVE = [
  // English
  "late", "missed", "poor", "bad", "worst", "rude", "overpriced", "hard to reach", "unreliable", "sloppy",
  "never", "ignored", "ghosted", "broken", "buggy", "slow", "disappointing", "disappointed", "unprofessional",
  "without warning", "had to ask", "reminders", "didn't match", "did not match", "scam", "avoid", "terrible",
  "awful", "unresponsive", "dense", "longer than planned", "ran out", "push our launch", "rushed",
  // French
  "retard", "manqué", "manquées", "manqué", "mauvais", "mauvaise", "pire", "impoli", "impolie", "trop cher",
  "difficile à joindre", "pas fiable", "bâclé", "jamais", "ignoré", "cassé", "lent", "lente", "décevant",
  "déçu", "déçue", "sans prévenir", "relancer", "relances", "ne correspondait pas", "arnaque", "évitez",
  "terrible", "affreux", "denses", "de plus que prévu", "a manqué", "repousser",
]

export interface Classification {
  label: Sentiment
  positive: number
  negative: number
}

function count(text: string, words: string[]): number {
  let n = 0
  for (const w of words) {
    const pattern = new RegExp(`(^|[^\\p{L}])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|[^\\p{L}])`, "giu")
    const matches = text.match(pattern)
    if (matches) n += matches.length
  }
  return n
}

export function classify(text: string): Classification {
  const lower = text.toLowerCase()
  const positive = count(lower, [...new Set(POSITIVE)])
  const negative = count(lower, [...new Set(NEGATIVE)])
  let label: Sentiment = "mixed"
  if (positive === 0 && negative === 0) label = "mixed"
  else if (negative === 0 || positive >= negative * 2 + 1) label = "positive"
  else if (positive === 0 || negative >= positive * 2) label = "negative"
  return { label, positive, negative }
}

/** Stars and words disagree: 4–5 stars with negative words, or 1–2 stars with positive ones. */
export function mismatch(rating: number, label: Sentiment): boolean {
  return (rating >= 4 && label === "negative") || (rating <= 2 && label === "positive")
}
