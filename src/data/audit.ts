export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface Finding {
  id: string;
  area: string;
  title: string;
  severity: Severity;
  observation: string;
  impact: string;
  recommendation: string;
}

export const areas = [
  "Hierarchy & first screen",
  "CTA & conversion",
  "Navigation",
  "Product comprehension",
  "Trust & positioning",
  "Catalog of 170+ generators",
  "Mobile experience",
  "Localization",
] as const;

export const findings: Finding[] = [
  {
    id: "F-01",
    area: "Hierarchy & first screen",
    title: "Hero does not answer 'what is this in 5 seconds'",
    severity: "Critical",
    observation:
      "First screen leans on abstract phrasing about brain training instead of showing the concrete artefact the tool produces (printable worksheet sets, generators with controls).",
    impact:
      "Specialists scanning quickly cannot tell this from a course, a game app, or a clinic. Bounce on segment-mismatched traffic.",
    recommendation:
      "Lead with a one-line value proposition that names the artefact + audience + control: 'Generator of printable worksheet sets for attention, memory, speech and logic — for specialists and educators.' Pair with a live worksheet preview, not a stock illustration.",
  },
  {
    id: "F-02",
    area: "CTA & conversion",
    title: "Multiple competing CTAs with unclear priority",
    severity: "Critical",
    observation:
      "Sign up, try demo, browse catalog, watch session, and pricing-related buttons appear at similar visual weight on the same screen.",
    impact: "Users do not know which path matches their intent; conversion drops, support load increases.",
    recommendation:
      "One primary CTA per screen: 'Open worksheet demo' on the hero. Secondary as text link: 'Browse 170+ generators'. Tertiary 'Sign in' in the nav only. Defer pricing and live-session demo to later sections.",
  },
  {
    id: "F-03",
    area: "Product comprehension",
    title: "Worksheet artefact is not visible above the fold",
    severity: "Critical",
    observation:
      "Users have to scroll several screens or click through before seeing what a generated worksheet actually looks like.",
    impact:
      "The core 'aha' — printable, adjustable, real — happens too late. Specialists need to see the output to evaluate it for their practice.",
    recommendation:
      "Embed an interactive worksheet preview directly in the hero: difficulty slider, item count, regenerate button, PDF preview thumbnail. Treat the hero as a product fragment, not a banner.",
  },
  {
    id: "F-04",
    area: "Product comprehension",
    title: "Worksheet-set demo and live-session demo are conflated",
    severity: "High",
    observation:
      "Both demos sit under the same 'Demo' label but serve different intents: prepare a printable set vs run an online session with a student.",
    impact: "Users open the wrong one, get confused, and leave without seeing the value of either.",
    recommendation:
      "Split into two named entries with intent-first labels: 'Try the worksheet builder' (asynchronous, printable) and 'See a live online session' (synchronous, screen-shared). Each gets its own URL, page, and 30-second explainer.",
  },
  {
    id: "F-05",
    area: "Catalog of 170+ generators",
    title: "Catalog is overwhelming and lacks intent-based entry points",
    severity: "High",
    observation:
      "170+ generators presented as a long list/grid with thin filters. Domain (attention, memory, etc.) is the only real axis.",
    impact: "Decision fatigue. Specialists cannot quickly find a generator for a specific session goal.",
    recommendation:
      "Add three parallel entry surfaces: (1) by skill domain, (2) by age range, (3) by session goal ('warm-up', '10-minute focus block', 'homework set'). Show 6–9 'most used by speech specialists / by primary-school teachers' on the catalog landing. Persistent left-hand filter rail, search with synonyms, RU/EN.",
  },
  {
    id: "F-06",
    area: "Trust & positioning",
    title: "Trust signals are weak for the professional audience",
    severity: "High",
    observation:
      "Few visible signals that this tool is used by real specialists: no specialist quotes, no count of generated worksheets, no example session plans, no school/center logos with permission.",
    impact: "Specialists treat the site as consumer-grade and disqualify it for professional use.",
    recommendation:
      "Add: anonymized usage stats (worksheets generated this month), 2–3 specialist quotes with role and city, list of partner centers (logos with consent), sample session plan PDF download. Keep all language outcome-neutral.",
  },
  {
    id: "F-07",
    area: "Trust & positioning",
    title: "Disclaimer is hidden or absent on key pages",
    severity: "High",
    observation:
      "The 'not a medical device, no diagnosis, no medical advice' statement is buried in legal pages or missing from segment landings aimed at speech specialists and parents.",
    impact: "Regulatory exposure and erosion of trust if a user assumes therapeutic claims.",
    recommendation:
      "Persistent footer disclaimer in plain language, plus a one-line, neutral-styled note at the top of the speech specialist and parent landings: 'Material creation tool. Not for diagnosis or treatment.' Keep tone calm, not alarming.",
  },
  {
    id: "F-08",
    area: "Trust & positioning",
    title: "Outcome language risks medical claims",
    severity: "High",
    observation:
      "Copy in some sections implies measurable cognitive improvement, which crosses into outcome promises.",
    impact: "Legal and brand risk; alienates evidence-aware specialists.",
    recommendation:
      "Rewrite to describe what the tool does, not what the brain does: 'Generate adjustable worksheets', 'Assemble a printable set', 'Track completion time and notes'. Replace 'improves memory' with 'practice material for memory exercises'.",
  },
  {
    id: "F-09",
    area: "Navigation",
    title: "Top nav mixes audience, feature and commercial entries",
    severity: "High",
    observation:
      "Same menu surfaces 'For educators', 'Generators', 'Pricing', 'Demo', 'Blog' at one level.",
    impact: "No mental model. Users scan the whole menu for every task.",
    recommendation:
      "Two-tier nav: primary = Product, For whom, Pricing, Sign in. 'Product' opens a mega-menu with Generators, Worksheet sets, Live sessions, Student cabinet. 'For whom' opens segments. Keep mobile to a single drawer with these two groups collapsed.",
  },
  {
    id: "F-10",
    area: "Mobile experience",
    title: "Hero text overflows and stacks awkwardly on small viewports",
    severity: "High",
    observation:
      "Long Russian headlines wrap to 4–5 lines and push the CTA below the fold. Worksheet preview shrinks to an unreadable thumbnail.",
    impact: "Mobile users do not see the CTA without scrolling, and the product evidence is unreadable.",
    recommendation:
      "Mobile-first hero: max 2 lines for headline (truncate variant for RU), CTA always above the fold, worksheet preview becomes a horizontally swipeable card stack with one large preview + caption.",
  },
  {
    id: "F-11",
    area: "Mobile experience",
    title: "Catalog filters not usable on mobile",
    severity: "Medium",
    observation: "Filters either collapse into an unlabeled icon or take a full screen.",
    impact: "Discovery breaks on the device most parents use.",
    recommendation:
      "Sticky bottom 'Filter' button opening a bottom sheet with grouped facets, applied chips visible above the result grid. Show result count live while filtering.",
  },
  {
    id: "F-12",
    area: "Localization",
    title: "Mixed RU/EN strings and untranslated UI fragments",
    severity: "Medium",
    observation: "Some buttons, tooltips and error states appear in English on the Russian site.",
    impact: "Looks unfinished; reduces trust for the primary Russian-speaking audience.",
    recommendation:
      "Audit all strings, enforce i18n keys with a fallback policy, default RU. Use Intl for dates (DD.MM.YYYY) and numbers. Add a visible RU/EN switch in the footer, persisted per user.",
  },
  {
    id: "F-13",
    area: "Hierarchy & first screen",
    title: "Section rhythm is flat — no clear narrative",
    severity: "Medium",
    observation: "Sections (features, audiences, pricing, FAQ) feel equally weighted and equally styled.",
    impact: "Scanning is exhausting; the page reads as a list, not a story.",
    recommendation:
      "Three-beat narrative: (1) what it is (hero + live preview), (2) how it fits your work (segment switcher with one scenario per audience), (3) what you get (set assembly + student cabinet + printable PDF). Pricing and FAQ at the end.",
  },
  {
    id: "F-14",
    area: "Product comprehension",
    title: "Student cabinet is invisible to prospects",
    severity: "Medium",
    observation:
      "The fact that students get a cabinet where they complete tasks and leave comments, with time tracking, is not shown on the public site.",
    impact: "A differentiating feature is hidden; the tool looks like a PDF generator only.",
    recommendation:
      "Add a 'Student side' preview block: screenshot of the cabinet, three-line caption, link to a sample completed worksheet view. No real student data.",
  },
  {
    id: "F-15",
    area: "Catalog of 170+ generators",
    title: "Each generator detail page lacks a printable sample",
    severity: "Medium",
    observation: "Generator pages describe the exercise but rarely show a ready-to-print PDF example.",
    impact: "Specialists cannot evaluate the artefact quality before signing up.",
    recommendation:
      "Each generator page: live preview with 2–3 adjustable controls, 'Download a sample PDF' (no auth), and a 'Used in these set templates' cross-link.",
  },
  {
    id: "F-16",
    area: "CTA & conversion",
    title: "Pricing is reached too early or too late depending on path",
    severity: "Medium",
    observation: "Some CTAs jump straight to pricing; others bury it behind two clicks.",
    impact: "Inconsistent funnel; users either feel pushed or lost.",
    recommendation:
      "Standard path: try worksheet demo → see generator catalog → sign in (free tier or trial) → pricing only when limits are hit. Pricing page stays accessible from the footer and main nav, but is never the first CTA.",
  },
  {
    id: "F-17",
    area: "Trust & positioning",
    title: "No clear answer to 'is my student's data safe?'",
    severity: "Medium",
    observation: "Privacy and data residency are not addressed on segment pages for educators and centers.",
    impact: "Procurement-aware buyers (schools, centers) stall.",
    recommendation:
      "Short 'How we handle data' block on educator and center landings: what is stored, where, retention, export, deletion. Link to full policy.",
  },
  {
    id: "F-18",
    area: "Navigation",
    title: "No persistent way back to the catalog from a generator page",
    severity: "Medium",
    observation: "Generator detail pages drop the user out of the browsing context.",
    impact: "Repeat use is friction-heavy; users open new tabs.",
    recommendation:
      "Breadcrumbs (Catalog → Domain → Generator) and a sticky 'Back to filtered catalog' that preserves the previous filter state.",
  },
  {
    id: "F-19",
    area: "Mobile experience",
    title: "Pricing tables are unreadable on mobile",
    severity: "Medium",
    observation: "Side-by-side comparison columns shrink below legible size.",
    impact: "Pricing decision is deferred to desktop, breaking the funnel.",
    recommendation:
      "Mobile pricing: one plan per screen, swipe to compare, key differences pinned, FAQ-style 'what fits me?' selector at the top.",
  },
  {
    id: "F-20",
    area: "Hierarchy & first screen",
    title: "Logo / brand mark does not communicate the category",
    severity: "Low",
    observation: "Wordmark alone, no support text on first view.",
    impact: "Minor on its own; compounds with F-01.",
    recommendation:
      "Pair the wordmark with a small descriptor on the home only: 'Worksheet generator for cognitive practice'. Drop the descriptor on inner pages.",
  },
  {
    id: "F-21",
    area: "CTA & conversion",
    title: "No re-entry CTA after long sections",
    severity: "Low",
    observation: "Long scrolls end at the footer with no contextual CTA.",
    impact: "Engaged scrollers fall off at the bottom.",
    recommendation: "Repeat the primary CTA once, after the segment switcher and once before the footer.",
  },
  {
    id: "F-22",
    area: "Localization",
    title: "Date and number formats not normalized",
    severity: "Low",
    observation: "Mix of formats across blog and product pages.",
    impact: "Looks inattentive; small trust hit.",
    recommendation: "Centralize formatting via Intl helpers; lint for raw date strings.",
  },
  {
    id: "F-23",
    area: "Navigation",
    title: "Footer is under-used",
    severity: "Low",
    observation: "Footer holds only logo and social icons.",
    impact: "Missed chance for SEO, sitemap clarity, and persistent disclaimer.",
    recommendation:
      "Structured footer: Product, For whom, Resources (sample PDFs, session plans), Company, Legal (with disclaimer in full).",
  },
];
