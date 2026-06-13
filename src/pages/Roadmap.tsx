import { PageHeader } from "@/components/PageHeader";

const week = [
  { id: "F-07", task: "Add plain-language disclaimer to footer and to speech/parent landings." },
  { id: "F-08", task: "Rewrite outcome-claim copy across home and segment pages." },
  { id: "F-02", task: "Reduce hero to one primary CTA: 'Open worksheet demo'. Demote others." },
  { id: "F-20", task: "Add 'Worksheet generator for cognitive practice' descriptor next to logo on home." },
  { id: "F-12", task: "Sweep RU/EN strings; fix untranslated UI fragments on top 10 pages." },
  { id: "F-21", task: "Add repeat CTA after segment switcher and before footer." },
];

const month = [
  { id: "F-01 / F-03", task: "Rebuild hero around a live worksheet preview with adjustable controls." },
  { id: "F-04", task: "Split demos: 'Try the worksheet builder' and 'See a live online session', separate URLs." },
  { id: "F-09", task: "Restructure top nav into Product / For whom / Pricing / Sign in with mega-menus." },
  { id: "F-13", task: "Implement three-beat narrative on home: what / how it fits / what you get." },
  { id: "F-14", task: "Add 'Student side' preview block with cabinet screenshot and sample completed worksheet." },
  { id: "F-10 / F-19", task: "Mobile-first pass on hero and pricing: 2-line headlines, swipeable cards, sticky CTA." },
  { id: "F-06", task: "Publish first specialist quotes, partner centers and a downloadable sample session plan." },
];

const later = [
  { id: "F-05", task: "Add intent-based entry points to catalog: by domain, by age, by session goal." },
  { id: "F-15", task: "Each generator page: live preview + sample PDF + cross-links to set templates." },
  { id: "F-11", task: "Mobile catalog filters as bottom sheet with live result count." },
  { id: "F-17", task: "'How we handle data' block on educator and center landings." },
  { id: "F-18", task: "Breadcrumbs and state-preserving 'back to catalog' on generator pages." },
  { id: "F-23", task: "Structured footer with full disclaimer and sitemap." },
  { id: "F-22", task: "Centralize Intl formatting; add lint rule against raw date strings." },
];

const Column = ({ title, eta, items }: { title: string; eta: string; items: { id: string; task: string }[] }) => (
  <div className="rounded-lg border border-border bg-card">
    <div className="border-b border-border px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eta}</div>
      <div className="mt-0.5 text-base font-semibold">{title}</div>
    </div>
    <ol className="divide-y divide-border">
      {items.map((it, i) => (
        <li key={it.id + i} className="flex gap-3 px-4 py-3 text-sm">
          <span className="mt-0.5 w-5 shrink-0 text-right font-mono text-xs text-muted-foreground">{i + 1}</span>
          <div className="min-w-0">
            <div className="text-foreground/90">{it.task}</div>
            <div className="mt-1 text-[11px] font-mono text-muted-foreground">{it.id}</div>
          </div>
        </li>
      ))}
    </ol>
  </div>
);

const Roadmap = () => (
  <>
    <PageHeader
      eyebrow="Deliverable 2"
      title="Action roadmap"
      description="Prioritized by impact on comprehension, trust and conversion. References point to audit finding IDs."
    />
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <Column title="Stop-the-bleed copy & CTA" eta="Next 7 days" items={week} />
        <Column title="Structural rework" eta="Next 30 days" items={month} />
        <Column title="Discovery & scale" eta="Quarter and beyond" items={later} />
      </div>
    </div>
  </>
);

export { Roadmap };
