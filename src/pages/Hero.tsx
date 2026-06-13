import { PageHeader } from "@/components/PageHeader";

const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-lg border border-border bg-card p-5">
    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</div>
    <div className="mt-3 text-sm leading-relaxed text-foreground/90">{children}</div>
  </section>
);

const Hero = () => (
  <>
    <PageHeader
      eyebrow="Deliverable 4 & 5"
      title="Hero section and CTA strategy"
      description="Mobile-first, evidence-led. One primary CTA. The hero is a product fragment, not a banner."
    />
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <Block title="Recommended headline (RU primary)">
        <p className="text-lg font-semibold leading-snug text-foreground">
          Генератор рабочих листов для тренировки внимания, памяти, речи и логики.
        </p>
        <p className="mt-2 text-foreground/80">
          Soft subhead: «Собирайте печатные комплекты под занятие за 5 минут. Для педагогов, специалистов и родителей.»
        </p>
        <div className="mt-4 border-t border-border pt-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">EN variant</div>
          <p className="mt-2 text-foreground/90">
            <b>Worksheet generator for attention, memory, language and logic practice.</b>
          </p>
          <p className="mt-1 text-foreground/70">
            Build a printable set for your next session in five minutes. For educators, specialists and parents.
          </p>
        </div>
      </Block>

      <Block title="What the hero must show on first view">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>One-line headline (max 2 lines on mobile).</li>
          <li>One subhead naming the artefact (printable set) and the audience.</li>
          <li>Live worksheet preview with two adjustable controls: difficulty, item count.</li>
          <li>A “Regenerate” button to prove the generator works.</li>
          <li>One primary CTA and one supporting text link.</li>
          <li>A neutral one-liner: “Material creation tool. Not for diagnosis or treatment.”</li>
        </ul>
      </Block>

      <Block title="CTA hierarchy">
        <div className="space-y-3">
          <div className="rounded-md border border-primary bg-primary/5 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">Primary</div>
            <div className="mt-1 font-semibold">Open worksheet demo →</div>
            <div className="text-xs text-muted-foreground">Goes to /demo/worksheet-builder. No sign-up required.</div>
          </div>
          <div className="rounded-md border border-border p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Secondary</div>
            <div className="mt-1 font-semibold">Browse 170+ generators</div>
            <div className="text-xs text-muted-foreground">Text link, neutral weight.</div>
          </div>
          <div className="rounded-md border border-border p-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tertiary</div>
            <div className="mt-1 font-semibold">See a live session (90 sec)</div>
            <div className="text-xs text-muted-foreground">Below the fold, paired with a still from the session UI.</div>
          </div>
          <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
            <b>Removed from hero:</b> Pricing, Sign up, Contact sales. Pricing reached via nav or after demo.
          </div>
        </div>
      </Block>

      <Block title="Mobile rule">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Headline never exceeds 2 lines; long RU variant uses a truncated copy.</li>
          <li>Primary CTA always above the fold on a 360×640 viewport.</li>
          <li>Worksheet preview becomes a swipeable card with one large preview + caption.</li>
          <li>Disclaimer line stays visible, small, not alarming.</li>
        </ul>
      </Block>
    </div>
  </>
);

export { Hero };
