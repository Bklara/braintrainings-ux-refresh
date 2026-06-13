import { PageHeader } from "@/components/PageHeader";

const segments = [
  {
    name: "Educators (school, kindergarten)",
    job: "Prepare a class-ready set of worksheets aligned to a weekly topic, fast.",
    proof: ["Printable set preview", "Class-size bundle (×25 PDF)", "Editable session plan"],
    cta: "Try the class set builder",
    note: "No outcome claims. Frame as material preparation, not intervention.",
  },
  {
    name: "Speech & development specialists",
    job: "Assemble session-specific material per child, reuse across recurring sessions.",
    proof: ["Per-child set history", "Adjustable difficulty per generator", "Session notes field"],
    cta: "Open the session material demo",
    note: "Persistent disclaimer at top: material creation tool, not for diagnosis or treatment.",
  },
  {
    name: "Parents",
    job: "Get a printable, age-appropriate practice sheet for the next 15 minutes at home.",
    proof: ["By-age entry point", "One-tap regenerate", "PDF that prints on a home printer"],
    cta: "Make a worksheet for my child",
    note: "Plain language. Avoid pressure language. No promises about results.",
  },
  {
    name: "Learning centers",
    job: "Standardize material across staff, control access, manage students at scale.",
    proof: ["Multi-user accounts", "Shared template library", "Data handling summary"],
    cta: "Talk to us about a center plan",
    note: "Add data residency and retention block. Logos with consent only.",
  },
];

const structure = [
  "1. Top strip: breadcrumb + neutral disclaimer line where applicable.",
  "2. Hero: audience-specific headline + one job-to-be-done line + segment-specific CTA.",
  "3. Scenario block: one concrete, named scenario (e.g., 'Tuesday 18:00 session with M., 7 y.o.').",
  "4. Product evidence: 3 screenshots in the order the audience uses them.",
  "5. Trust block: 1–2 specialist or educator quotes, role and city, no claims.",
  "6. Data & safety block (educators & centers) or disclaimer reinforcement (specialists & parents).",
  "7. FAQ (4–6 items) addressing the segment's real objections.",
  "8. Repeat primary CTA + secondary 'See the worksheet demo' link.",
];

const Segments = () => (
  <>
    <PageHeader
      eyebrow="Deliverable 6"
      title="Segment page structure"
      description="One landing per audience. Same skeleton, different scenario, different proof, different CTA wording."
    />
    <div className="mx-auto max-w-5xl px-6 py-8">
      <section className="mb-8 rounded-lg border border-border bg-card p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Shared 8-block skeleton
        </div>
        <ol className="mt-3 space-y-1.5 text-sm text-foreground/90">
          {structure.map((s) => (
            <li key={s} className="font-mono text-xs leading-relaxed">{s}</li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {segments.map((s) => (
          <article key={s.name} className="flex flex-col rounded-lg border border-border bg-card p-5">
            <h3 className="text-base font-semibold">{s.name}</h3>
            <div className="mt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Job to be done</div>
              <p className="mt-1 text-sm text-foreground/90">{s.job}</p>
            </div>
            <div className="mt-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Proof to show</div>
              <ul className="mt-1 space-y-0.5 text-sm text-foreground/90">
                {s.proof.map((p) => <li key={p}>— {p}</li>)}
              </ul>
            </div>
            <div className="mt-4 rounded-md border border-primary/40 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">
              {s.cta} →
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{s.note}</p>
          </article>
        ))}
      </div>
    </div>
  </>
);

export { Segments };
