import { PageHeader } from "@/components/PageHeader";

const builder = [
  "Intro strip: 'Builder demo. Async. Ends with a printable PDF.' 1 line, no video.",
  "Step 1 — pick a goal: 4 chips (attention, memory, language, logic). One-click selection.",
  "Step 2 — pick generators: pre-filtered list of 6, multi-select, live preview on the right.",
  "Step 3 — adjust controls: difficulty, item count, age — affects preview in real time.",
  "Step 4 — assemble the set: drag to reorder, see page count, PDF preview thumbnail.",
  "Step 5 — export: 'Download sample PDF' (no auth) + 'Save to my library' (auth).",
  "Persistent right rail on desktop: live worksheet preview. Collapses to bottom sheet on mobile.",
];

const live = [
  "Intro strip: 'Live session demo. Synchronous. Watch how a session runs.' 90-second narrated walk-through.",
  "Stage 1 — open a session: specialist view, student name, planned set on the left.",
  "Stage 2 — share a worksheet: student sees the same page, can type or tap answers.",
  "Stage 3 — observe: completion time, idle indicator, free-form notes by the specialist.",
  "Stage 4 — wrap up: save session notes, send the completed worksheet to the student cabinet.",
  "Disclaimer line under the player: 'Material creation and session tool. Not for diagnosis or treatment.'",
  "Exit CTA: 'Open the worksheet builder demo' — bridges the two flows.",
];

const Column = ({ title, badge, items }: { title: string; badge: string; items: string[] }) => (
  <div className="rounded-lg border border-border bg-card">
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{badge}</div>
        <div className="mt-0.5 text-base font-semibold">{title}</div>
      </div>
    </div>
    <ol className="space-y-3 px-5 py-4 text-sm">
      {items.map((s, i) => (
        <li key={s} className="flex gap-3">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-[11px] font-mono text-muted-foreground">
            {i + 1}
          </span>
          <span className="text-foreground/90">{s}</span>
        </li>
      ))}
    </ol>
  </div>
);

const Demo = () => (
  <>
    <PageHeader
      eyebrow="Deliverable 7"
      title="Demo structure"
      description="Two demos, named by intent. Never bundled into a single 'Demo' button."
    />
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="grid gap-4 lg:grid-cols-2">
        <Column title="Worksheet builder" badge="/demo/worksheet-builder · async" items={builder} />
        <Column title="Live session" badge="/demo/live-session · synchronous" items={live} />
      </div>
      <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-5 text-sm leading-relaxed text-foreground/90">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Cross-promotion</div>
        <p className="mt-2">
          Each demo ends with one outbound link to the other, framed as the next likely question
          (“Now see how this is used live” / “Now build a set yourself”). Never auto-redirect.
        </p>
      </div>
    </div>
  </>
);

export { Demo };
