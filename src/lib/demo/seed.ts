import { seededAddress, seededHash } from "./ids"
import { blockAt, SEED_HEAD } from "./network"
import type {
  DemoState,
  Interaction,
  Locale,
  Member,
  ModerationCase,
  Rating,
  Review,
  TagId,
} from "./types"

/**
 * The seeded community: a student blockchain association (you are its
 * treasurer), its contributors, moderators and local partners. Text is written
 * natively in English and French; the visitor's language picks one.
 */

type L = { en: string; fr: string }

/** The demo wallet. */
export const YOU = "0x5a1C3e9D0b47F2a6c8E1d93B04f6A7c2D95e7e2B"

export const ADDR = {
  you: YOU,
  amara: seededAddress("amara-okafor"),
  lea: seededAddress("lea-tremblay"),
  diego: seededAddress("diego-ramirez"),
  kenji: seededAddress("kenji-watanabe"),
  cafe: seededAddress("cafe-lumen"),
  northbridge: seededAddress("northbridge-labs"),
  priya: seededAddress("priya-nair"),
  tomas: seededAddress("tomas-silva"),
  ines: seededAddress("ines-belkacem"),
  marco: seededAddress("marco-bellini"),
  /** Two-day-old wallets with no record. */
  fresh1: seededAddress("fresh-wallet-1"),
  fresh2: seededAddress("fresh-wallet-2"),
  fresh3: seededAddress("fresh-wallet-3"),
} as const

type Key = keyof typeof ADDR

const MEMBERS: { key: Key; name: string; role: L; since: string; moderator?: boolean; partner?: boolean }[] = [
  { key: "you", name: "Sam Rivera", role: { en: "Treasurer, Campus Blockchain Society", fr: "Trésorier, Campus Blockchain Society" }, since: "2025-09-08", moderator: true },
  { key: "amara", name: "Amara Okafor", role: { en: "Solidity developer", fr: "Développeuse Solidity" }, since: "2025-02-14" },
  { key: "lea", name: "Léa Tremblay", role: { en: "Product designer", fr: "Designer produit" }, since: "2025-05-03" },
  { key: "diego", name: "Diego Ramírez", role: { en: "Security reviewer", fr: "Auditeur sécurité" }, since: "2024-11-20", moderator: true },
  { key: "kenji", name: "Kenji Watanabe", role: { en: "Frontend developer", fr: "Développeur front-end" }, since: "2025-01-09", moderator: true },
  { key: "cafe", name: "Café Lumen", role: { en: "Café and meetup venue", fr: "Café et lieu de rencontres" }, since: "2025-10-01", partner: true },
  { key: "northbridge", name: "Northbridge Labs", role: { en: "Community sponsor", fr: "Commanditaire de la communauté" }, since: "2025-03-27", partner: true },
  { key: "priya", name: "Priya Nair", role: { en: "Monark ambassador", fr: "Ambassadrice Monark" }, since: "2025-04-18", moderator: true },
  { key: "tomas", name: "Tomás Silva", role: { en: "Translator (EN · FR · PT)", fr: "Traducteur (EN · FR · PT)" }, since: "2025-08-30" },
  { key: "ines", name: "Inès Belkacem", role: { en: "Community organiser", fr: "Organisatrice communautaire" }, since: "2024-12-02", moderator: true },
  { key: "marco", name: "Marco Bellini", role: { en: "Freelance developer", fr: "Développeur indépendant" }, since: "2025-06-11" },
]

const INTERACTIONS: {
  id: string
  kind: Interaction["kind"]
  from: Key
  to: Key
  ref: L
  title: L
  amount: number
  token: Interaction["token"]
  at: string
}[] = [
  // Open for you to review (flow 3).
  { id: "i-231", kind: "bounty", from: "you", to: "amara", ref: { en: "Bounty #231", fr: "Prime n° 231" }, title: { en: "Ticketing contract for the club's winter gala", fr: "Contrat de billetterie pour le gala d'hiver du club" }, amount: 1200, token: "tUSDC", at: "2026-09-12T15:20:00Z" },
  { id: "i-244", kind: "bounty", from: "you", to: "tomas", ref: { en: "Bounty #244", fr: "Prime n° 244" }, title: { en: "French translation of the onboarding guide", fr: "Traduction française du guide d'accueil" }, amount: 300, token: "tUSDC", at: "2026-09-19T10:05:00Z" },
  // Already reviewed.
  { id: "i-m2", kind: "milestone", from: "you", to: "kenji", ref: { en: "Milestone 2 of 3", fr: "Jalon 2 sur 3" }, title: { en: "Club website rebuild", fr: "Refonte du site du club" }, amount: 800, token: "tUSDC", at: "2026-07-02T13:00:00Z" },
  { id: "i-inv88", kind: "invoice", from: "you", to: "cafe", ref: { en: "Invoice #88", fr: "Facture n° 88" }, title: { en: "Catering for the September meetup", fr: "Traiteur pour la rencontre de septembre" }, amount: 640, token: "tUSDC", at: "2026-09-04T20:30:00Z" },
  { id: "i-sp26", kind: "sponsorship", from: "northbridge", to: "you", ref: { en: "Fall sponsorship", fr: "Commandite d'automne" }, title: { en: "Fall 2026 sponsorship of the Campus Blockchain Society", fr: "Commandite d'automne 2026 de la Campus Blockchain Society" }, amount: 5000, token: "tUSDC", at: "2026-08-20T14:00:00Z" },
  { id: "i-m1", kind: "milestone", from: "you", to: "kenji", ref: { en: "Milestone 1 of 3", fr: "Jalon 1 sur 3" }, title: { en: "Club website rebuild", fr: "Refonte du site du club" }, amount: 600, token: "tUSDC", at: "2026-06-10T13:00:00Z" },
  // Amara's record.
  { id: "i-198", kind: "bounty", from: "northbridge", to: "amara", ref: { en: "Bounty #198", fr: "Prime n° 198" }, title: { en: "Audit fixes for the grants contract", fr: "Correctifs d'audit du contrat de subventions" }, amount: 2500, token: "tUSDC", at: "2026-05-22T16:00:00Z" },
  { id: "i-hk", kind: "payout", from: "ines", to: "amara", ref: { en: "Hackathon payout", fr: "Versement du hackathon" }, title: { en: "Mentoring at the spring hackathon", fr: "Mentorat au hackathon du printemps" }, amount: 400, token: "tDAI", at: "2026-04-14T19:00:00Z" },
  { id: "i-176", kind: "bounty", from: "diego", to: "amara", ref: { en: "Bounty #176", fr: "Prime n° 176" }, title: { en: "Second pair of eyes on the voting module", fr: "Relecture croisée du module de vote" }, amount: 0.35, token: "tETH", at: "2026-03-30T11:00:00Z" },
  { id: "i-205", kind: "bounty", from: "lea", to: "amara", ref: { en: "Bounty #205", fr: "Prime n° 205" }, title: { en: "Wallet connection for the design-system demo", fr: "Connexion de portefeuille pour la démo du design system" }, amount: 450, token: "tUSDC", at: "2026-06-18T09:30:00Z" },
  { id: "i-212", kind: "bounty", from: "kenji", to: "amara", ref: { en: "Bounty #212", fr: "Prime n° 212" }, title: { en: "Contract hooks for the club website", fr: "Points d'accroche du contrat pour le site du club" }, amount: 350, token: "tUSDC", at: "2026-07-08T12:00:00Z" },
  { id: "i-189", kind: "bounty", from: "marco", to: "amara", ref: { en: "Bounty #189", fr: "Prime n° 189" }, title: { en: "Escrow contract review", fr: "Relecture du contrat d'entiercement" }, amount: 500, token: "tUSDC", at: "2026-04-28T08:00:00Z" },
  { id: "i-220", kind: "bounty", from: "tomas", to: "amara", ref: { en: "Bounty #220", fr: "Prime n° 220" }, title: { en: "Walkthrough of the ticketing contract for the docs", fr: "Explication du contrat de billetterie pour la doc" }, amount: 120, token: "tUSDC", at: "2026-08-02T17:00:00Z" },
  // Others.
  { id: "i-170", kind: "bounty", from: "priya", to: "lea", ref: { en: "Bounty #170", fr: "Prime n° 170" }, title: { en: "Ambassador kit illustrations", fr: "Illustrations du kit ambassadeur" }, amount: 700, token: "tUSDC", at: "2026-03-12T10:00:00Z" },
  { id: "i-190", kind: "bounty", from: "lea", to: "marco", ref: { en: "Bounty #190", fr: "Prime n° 190" }, title: { en: "Landing page build for the design-system demo", fr: "Intégration de la page d'accueil de la démo du design system" }, amount: 900, token: "tUSDC", at: "2026-05-02T10:00:00Z" },
  { id: "i-195", kind: "bounty", from: "kenji", to: "marco", ref: { en: "Bounty #195", fr: "Prime n° 195" }, title: { en: "Charts for the treasury dashboard", fr: "Graphiques du tableau de bord de trésorerie" }, amount: 450, token: "tUSDC", at: "2026-05-19T10:00:00Z" },
  { id: "i-inv61", kind: "invoice", from: "priya", to: "cafe", ref: { en: "Invoice #61", fr: "Facture n° 61" }, title: { en: "Ambassador evening, 40 guests", fr: "Soirée des ambassadeurs, 40 personnes" }, amount: 520, token: "tUSDC", at: "2026-06-26T22:00:00Z" },
  { id: "i-inv72", kind: "invoice", from: "ines", to: "cafe", ref: { en: "Invoice #72", fr: "Facture n° 72" }, title: { en: "Hackathon breakfasts", fr: "Petits-déjeuners du hackathon" }, amount: 310, token: "tDAI", at: "2026-04-13T08:00:00Z" },
  { id: "i-150", kind: "bounty", from: "ines", to: "diego", ref: { en: "Bounty #150", fr: "Prime n° 150" }, title: { en: "Security workshop for first-year students", fr: "Atelier sécurité pour les étudiants de première année" }, amount: 250, token: "tUSDC", at: "2026-02-20T18:00:00Z" },
  { id: "i-163", kind: "payout", from: "northbridge", to: "priya", ref: { en: "Ambassador payout", fr: "Versement ambassadeur" }, title: { en: "Campus tour, three universities", fr: "Tournée de trois campus" }, amount: 600, token: "tUSDC", at: "2026-03-05T12:00:00Z" },
  { id: "i-181", kind: "bounty", from: "priya", to: "tomas", ref: { en: "Bounty #181", fr: "Prime n° 181" }, title: { en: "Portuguese version of the ambassador kit", fr: "Version portugaise du kit ambassadeur" }, amount: 220, token: "tUSDC", at: "2026-04-09T12:00:00Z" },
  { id: "i-140", kind: "payout", from: "northbridge", to: "ines", ref: { en: "Event grant", fr: "Subvention d'événement" }, title: { en: "Spring hackathon organisation", fr: "Organisation du hackathon du printemps" }, amount: 3000, token: "tUSDC", at: "2026-03-18T12:00:00Z" },
  { id: "i-158", kind: "bounty", from: "diego", to: "kenji", ref: { en: "Bounty #158", fr: "Prime n° 158" }, title: { en: "Audit report viewer", fr: "Visionneuse de rapports d'audit" }, amount: 400, token: "tUSDC", at: "2026-03-01T12:00:00Z" },
]

const REVIEWS: {
  id: string
  from: Key
  to: Key
  rating: Rating
  tags: TagId[]
  interaction: string | null
  at: string
  helpful: Key[]
  comment: L
  reply?: { at: string; text: L }
}[] = [
  // --- Amara Okafor -------------------------------------------------------
  {
    id: "r-01", from: "northbridge", to: "amara", rating: 5, tags: ["security", "smart-contracts", "on-time"], interaction: "i-198", at: "2026-05-29T14:10:00Z", helpful: ["diego", "priya", "you", "ines"],
    comment: {
      en: "Fixed every finding from the audit within a week and documented each change in the pull request. The grants contract shipped on schedule and has run without an incident since.",
      fr: "Elle a corrigé chaque point de l'audit en moins d'une semaine et documenté chaque changement dans la demande de fusion. Le contrat de subventions est sorti à temps et tourne sans incident depuis.",
    },
  },
  {
    id: "r-02", from: "ines", to: "amara", rating: 5, tags: ["mentoring", "community"], interaction: "i-hk", at: "2026-04-16T10:00:00Z", helpful: ["priya", "kenji"],
    comment: {
      en: "Mentored three first-time teams through the whole weekend, patiently and without taking over their code. Two of them shipped a working contract by Sunday.",
      fr: "Elle a accompagné trois équipes débutantes tout le week-end, avec patience et sans jamais prendre la main sur leur code. Deux d'entre elles avaient un contrat fonctionnel dimanche.",
    },
  },
  {
    id: "r-03", from: "diego", to: "amara", rating: 4, tags: ["smart-contracts", "communication"], interaction: "i-176", at: "2026-04-03T09:00:00Z", helpful: ["kenji"],
    comment: {
      en: "Solid review of the voting module with useful test cases. It took a few days longer than planned, but she kept me informed the whole time.",
      fr: "Relecture solide du module de vote, avec des cas de test utiles. Ça a pris quelques jours de plus que prévu, mais elle m'a tenu au courant du début à la fin.",
    },
  },
  {
    id: "r-04", from: "lea", to: "amara", rating: 5, tags: ["frontend", "communication"], interaction: "i-205", at: "2026-06-21T16:40:00Z", helpful: ["kenji", "you"],
    comment: {
      en: "Explained every wallet state so I could design for it, then built exactly what the mock-ups showed. Easy and friendly to work with.",
      fr: "Elle m'a expliqué chaque état du portefeuille pour que je puisse les dessiner, puis a construit exactement ce que montraient les maquettes. Simple et agréable de travailler avec elle.",
    },
  },
  {
    id: "r-05", from: "priya", to: "amara", rating: 4, tags: ["events", "mentoring"], interaction: null, at: "2026-05-10T21:00:00Z", helpful: [],
    comment: {
      en: "Gave a great talk on contract upgrades at our meetup. The slides were a little dense for complete beginners, but people were still asking questions an hour later.",
      fr: "Excellente présentation sur la mise à jour des contrats lors de notre rencontre. Les diapos étaient un peu denses pour de vrais débutants, mais on lui posait encore des questions une heure après.",
    },
  },
  {
    id: "r-06", from: "kenji", to: "amara", rating: 5, tags: ["smart-contracts", "on-time"], interaction: "i-212", at: "2026-07-11T11:20:00Z", helpful: ["lea"],
    comment: {
      en: "Clear interface, quick answers and a contract that did exactly what the website needed. Delivered two days early.",
      fr: "Une interface claire, des réponses rapides et un contrat qui faisait exactement ce dont le site avait besoin. Livré avec deux jours d'avance.",
    },
  },
  {
    id: "r-07", from: "marco", to: "amara", rating: 3, tags: ["communication"], interaction: "i-189", at: "2026-05-06T15:00:00Z", helpful: ["diego"],
    comment: {
      en: "The review itself was thorough and caught a real bug. She was hard to reach during her exam period though, and I had to push our launch by a week.",
      fr: "La relecture était rigoureuse et a trouvé un vrai bogue. Elle était par contre difficile à joindre pendant sa période d'examens, et j'ai dû repousser notre lancement d'une semaine.",
    },
  },
  {
    id: "r-08", from: "tomas", to: "amara", rating: 5, tags: ["docs", "mentoring"], interaction: "i-220", at: "2026-08-05T13:00:00Z", helpful: [],
    comment: {
      en: "Walked me through the ticketing contract line by line so the translated docs would be accurate. Patient and precise.",
      fr: "Elle m'a expliqué le contrat de billetterie ligne par ligne pour que la documentation traduite soit exacte. Patiente et précise.",
    },
  },
  {
    id: "r-09", from: "fresh1", to: "amara", rating: 5, tags: ["smart-contracts"], interaction: null, at: "2026-09-27T03:12:00Z", helpful: [],
    comment: {
      en: "Best dev ever!!! Everyone should hire her right now. Also claim the free airdrop at t.me/fr33-drop before it's gone!!!",
      fr: "Meilleure dev de tous les temps !!! Engagez-la tout de suite. Et réclamez l'airdrop gratuit sur t.me/fr33-drop avant qu'il disparaisse !!!",
    },
  },
  // --- You (Sam Rivera) ----------------------------------------------------
  {
    id: "r-10", from: "northbridge", to: "you", rating: 5, tags: ["payments", "communication"], interaction: "i-sp26", at: "2026-09-01T12:00:00Z", helpful: ["priya"],
    comment: {
      en: "Sent a clear report on how every dollar of the sponsorship was spent, with links to each payout. The easiest student club we've sponsored.",
      fr: "Un rapport clair sur l'utilisation de chaque dollar de la commandite, avec un lien vers chaque versement. Le club étudiant le plus simple que nous ayons commandité.",
    },
  },
  {
    id: "r-11", from: "cafe", to: "you", rating: 3, tags: ["payments", "events"], interaction: "i-inv88", at: "2026-09-26T09:30:00Z", helpful: [],
    comment: {
      en: "Lovely crowd and a well-organised evening, but the catering invoice was paid three weeks late and we had to ask twice.",
      fr: "Un public adorable et une soirée bien organisée, mais la facture du traiteur a été payée avec trois semaines de retard et nous avons dû relancer deux fois.",
    },
  },
  {
    id: "r-12", from: "kenji", to: "you", rating: 4, tags: ["payments", "communication"], interaction: "i-m1", at: "2026-06-14T10:00:00Z", helpful: [],
    comment: {
      en: "Clear brief and fair milestone payments. Approvals sometimes waited for the weekly officers' meeting, but nothing was ever late.",
      fr: "Un cahier des charges clair et des jalons payés équitablement. Les approbations attendaient parfois la réunion hebdomadaire du bureau, mais rien n'a jamais pris de retard.",
    },
  },
  // --- Given by you --------------------------------------------------------
  {
    id: "r-13", from: "you", to: "kenji", rating: 5, tags: ["frontend", "on-time"], interaction: "i-m2", at: "2026-07-05T18:00:00Z", helpful: ["lea", "ines"],
    comment: {
      en: "Rebuilt the club website in half the time we planned, and left a README so the next officers can update it themselves.",
      fr: "Il a refait le site du club en deux fois moins de temps que prévu, et laissé un README pour que les prochains membres du bureau puissent le mettre à jour eux-mêmes.",
    },
  },
  {
    id: "r-14", from: "you", to: "cafe", rating: 5, tags: ["events"], interaction: "i-inv88", at: "2026-09-06T11:00:00Z", helpful: ["priya"],
    comment: {
      en: "Hosted 60 people on a Thursday night, stayed open late and adapted the menu for three dietary needs. Our favourite venue.",
      fr: "Ils ont accueilli 60 personnes un jeudi soir, sont restés ouverts tard et ont adapté le menu à trois régimes alimentaires. Notre lieu préféré.",
    },
  },
  // --- Others ----------------------------------------------------------------
  {
    id: "r-15", from: "priya", to: "lea", rating: 5, tags: ["design", "on-time"], interaction: "i-170", at: "2026-03-20T10:00:00Z", helpful: ["ines", "tomas"],
    comment: {
      en: "The illustrations for the ambassador kit are beautiful and arrived a week early, with source files for every format we needed.",
      fr: "Les illustrations du kit ambassadeur sont magnifiques et sont arrivées une semaine en avance, avec les fichiers sources dans tous les formats demandés.",
    },
  },
  {
    id: "r-16", from: "amara", to: "lea", rating: 5, tags: ["design", "communication"], interaction: "i-205", at: "2026-06-22T09:00:00Z", helpful: [],
    comment: {
      en: "Her mock-ups covered every edge case, including the failed and pending states most designers forget.",
      fr: "Ses maquettes couvraient tous les cas limites, y compris les états d'échec et d'attente que la plupart des designers oublient.",
    },
  },
  {
    id: "r-17", from: "lea", to: "marco", rating: 2, tags: ["frontend", "communication"], interaction: "i-190", at: "2026-05-30T17:00:00Z", helpful: ["kenji", "amara"],
    comment: {
      en: "Missed two deadlines without warning, and the page didn't match the mock-ups on mobile. He did fix it in the end, but only after several reminders.",
      fr: "Deux échéances manquées sans prévenir, et la page ne correspondait pas aux maquettes sur mobile. Il a fini par corriger, mais seulement après plusieurs relances.",
    },
    reply: {
      at: "2026-06-01T08:00:00Z",
      text: {
        en: "Fair point on the deadlines, and I'm sorry. I was juggling a second contract; I now only take one bounty at a time.",
        fr: "Remarque juste sur les échéances, et j'en suis désolé. Je jonglais avec un second contrat ; je ne prends désormais qu'une prime à la fois.",
      },
    },
  },
  {
    id: "r-18", from: "kenji", to: "marco", rating: 4, tags: ["frontend", "on-time"], interaction: "i-195", at: "2026-05-25T12:00:00Z", helpful: [],
    comment: {
      en: "Good, readable charts delivered on time. A couple of accessibility fixes were needed, which he handled quickly.",
      fr: "De bons graphiques lisibles, livrés à temps. Quelques corrections d'accessibilité ont été nécessaires, et il s'en est occupé rapidement.",
    },
  },
  {
    id: "r-19", from: "priya", to: "cafe", rating: 5, tags: ["events"], interaction: "i-inv61", at: "2026-06-28T10:00:00Z", helpful: ["ines"],
    comment: {
      en: "Forty ambassadors, one cosy back room and a staff that made everyone feel welcome. We'll be back.",
      fr: "Quarante ambassadeurs, une petite salle chaleureuse et une équipe qui a fait sentir chacun le bienvenu. Nous reviendrons.",
    },
  },
  {
    id: "r-20", from: "ines", to: "cafe", rating: 4, tags: ["events"], interaction: "i-inv72", at: "2026-04-15T10:00:00Z", helpful: [],
    comment: {
      en: "Breakfast for 80 hackers at 7 a.m., on time and warm. Coffee ran out once, but they restocked within twenty minutes.",
      fr: "Le petit-déjeuner de 80 participants à 7 h, à l'heure et bien chaud. Le café a manqué une fois, mais ils ont réapprovisionné en vingt minutes.",
    },
  },
  {
    id: "r-21", from: "fresh2", to: "cafe", rating: 1, tags: ["events"], interaction: null, at: "2026-09-25T23:40:00Z", helpful: [],
    comment: {
      en: "Worst café in the neighbourhood, overpriced and rude. Go to the place across the street instead, much better.",
      fr: "Le pire café du quartier, trop cher et impoli. Allez plutôt en face, c'est bien mieux.",
    },
  },
  {
    id: "r-22", from: "ines", to: "diego", rating: 5, tags: ["security", "mentoring"], interaction: "i-150", at: "2026-02-24T10:00:00Z", helpful: ["amara", "kenji"],
    comment: {
      en: "Ran a hands-on security workshop that first-year students actually enjoyed. Every exercise was a real bug from a real audit.",
      fr: "Un atelier sécurité pratique que les étudiants de première année ont vraiment apprécié. Chaque exercice reprenait un vrai bogue tiré d'un vrai audit.",
    },
  },
  {
    id: "r-23", from: "northbridge", to: "priya", rating: 5, tags: ["community", "events"], interaction: "i-163", at: "2026-03-09T10:00:00Z", helpful: ["ines"],
    comment: {
      en: "Three campuses in two weeks, with a short report after each visit. Our best-run ambassador tour so far.",
      fr: "Trois campus en deux semaines, avec un court compte rendu après chaque visite. Notre tournée d'ambassadeurs la mieux menée à ce jour.",
    },
  },
  {
    id: "r-24", from: "priya", to: "tomas", rating: 5, tags: ["translation", "on-time"], interaction: "i-181", at: "2026-04-12T10:00:00Z", helpful: [],
    comment: {
      en: "Natural, careful Portuguese that kept our tone. Flagged two unclear sentences in the English original too.",
      fr: "Un portugais naturel et soigné, fidèle à notre ton. Il a même relevé deux phrases ambiguës dans la version anglaise.",
    },
  },
  {
    id: "r-25", from: "northbridge", to: "ines", rating: 5, tags: ["events", "payments"], interaction: "i-140", at: "2026-04-20T10:00:00Z", helpful: ["priya", "diego"],
    comment: {
      en: "Organised a 200-person hackathon on budget, and published every expense on-chain before we even asked.",
      fr: "Elle a organisé un hackathon de 200 personnes dans le budget, et publié chaque dépense on-chain avant même qu'on le demande.",
    },
  },
  {
    id: "r-26", from: "diego", to: "kenji", rating: 5, tags: ["frontend", "security"], interaction: "i-158", at: "2026-03-04T10:00:00Z", helpful: [],
    comment: {
      en: "Built the audit report viewer exactly to spec and added keyboard navigation nobody asked for. Would hire again.",
      fr: "Il a construit la visionneuse de rapports d'audit exactement selon le cahier des charges, et ajouté une navigation au clavier que personne n'avait demandée. Je referais appel à lui.",
    },
  },
  {
    id: "r-27", from: "fresh3", to: "kenji", rating: 5, tags: ["frontend"], interaction: null, at: "2026-08-14T02:00:00Z", helpful: [],
    comment: {
      en: "Amazing!!! Follow my channel for daily 100x token calls, link in bio, don't miss out!!!",
      fr: "Incroyable !!! Suivez ma chaîne pour des tokens à 100x chaque jour, lien dans la bio, ne ratez pas ça !!!",
    },
  },
]

const CASES: {
  id: string
  review: string
  reason: ModerationCase["reason"]
  note: L
  flaggedBy: Key
  openedAt: string
  votes: { by: Key; vote: "hide" | "keep"; at: string }[]
  status: ModerationCase["status"]
  resolvedAt?: string
  lean: "hide" | "keep"
}[] = [
  {
    id: "case-12", review: "r-21", reason: "conflict", flaggedBy: "priya", openedAt: "2026-09-26T10:15:00Z", status: "open", lean: "hide",
    note: {
      en: "Brand-new wallet, no visit on record, and it sends people to the competitor across the street.",
      fr: "Portefeuille tout neuf, aucune visite enregistrée, et il envoie les gens chez le concurrent d'en face.",
    },
    votes: [{ by: "ines", vote: "hide", at: "2026-09-26T18:02:00Z" }],
  },
  {
    id: "case-09", review: "r-27", reason: "spam", flaggedBy: "kenji", openedAt: "2026-08-14T09:00:00Z", status: "hidden", resolvedAt: "2026-08-15T11:30:00Z", lean: "hide",
    note: { en: "Token promotion posted as a review.", fr: "Promotion de token déguisée en avis." },
    votes: [
      { by: "diego", vote: "hide", at: "2026-08-14T12:00:00Z" },
      { by: "priya", vote: "hide", at: "2026-08-14T20:40:00Z" },
      { by: "ines", vote: "hide", at: "2026-08-15T11:30:00Z" },
    ],
  },
]

export function createSeed(locale: Locale): DemoState {
  const pick = (l: L) => l[locale]
  const members: Member[] = MEMBERS.map((m) => ({
    address: ADDR[m.key],
    name: m.name,
    role: pick(m.role),
    since: m.since,
    moderator: m.moderator,
    partner: m.partner,
  }))
  const interactions: Interaction[] = INTERACTIONS.map((i) => ({
    id: i.id,
    kind: i.kind,
    from: ADDR[i.from],
    to: ADDR[i.to],
    ref: pick(i.ref),
    title: pick(i.title),
    amount: i.amount,
    token: i.token,
    at: i.at,
    hash: seededHash(`int:${i.id}`),
  }))
  const reviews: Review[] = REVIEWS.map((r) => ({
    id: r.id,
    from: ADDR[r.from],
    to: ADDR[r.to],
    rating: r.rating,
    comment: pick(r.comment),
    tags: r.tags,
    interactionId: r.interaction,
    at: r.at,
    hash: seededHash(`rev:${r.id}`),
    block: blockAt(r.at),
    helpful: r.helpful.map((k) => ADDR[k]),
    reply: r.reply
      ? { text: pick(r.reply.text), at: r.reply.at, hash: seededHash(`reply:${r.id}`), block: blockAt(r.reply.at) }
      : null,
  }))
  const cases: ModerationCase[] = CASES.map((c) => ({
    id: c.id,
    reviewId: c.review,
    reason: c.reason,
    note: pick(c.note),
    flaggedBy: ADDR[c.flaggedBy],
    openedAt: c.openedAt,
    hash: seededHash(`flag:${c.id}`),
    block: blockAt(c.openedAt),
    votes: c.votes.map((v, n) => ({
      moderator: ADDR[v.by],
      vote: v.vote,
      at: v.at,
      hash: seededHash(`vote:${c.id}:${n}`),
    })),
    status: c.status,
    resolvedAt: c.resolvedAt,
    resolvedBlock: c.resolvedAt ? blockAt(c.resolvedAt) : undefined,
    lean: c.lean,
  }))

  return {
    version: 1,
    seededLocale: locale,
    head: SEED_HEAD,
    wallet: { status: "disconnected", address: YOU, name: "Sam Rivera", lastError: null },
    members,
    interactions,
    reviews,
    cases,
    settings: { slow: false, failNext: false },
  }
}

/** Seeded ids the demo's guided flows rely on. */
export const DEMO_IDS = {
  spamOnAmara: "r-09",
  cafeOnYou: "r-11",
  openBountyForAmara: "i-231",
}
