import { ArrowRight, FileText, Layers, Users, ShieldCheck, Printer, Clock, MessagesSquare } from "lucide-react";
import { PrototypeFrame } from "@/components/proto/Frame";
import { WorksheetPreview } from "@/components/proto/WorksheetPreview";
import { ProtoNav } from "@/components/proto/ProtoNav";

const Disclaimer = () => (
  <div className="border-y border-border bg-secondary/40 px-4 py-2 text-center text-[11px] text-muted-foreground md:px-6">
    Material creation tool. Not a medical device, not for diagnosis or treatment.
  </div>
);

const SegmentCard = ({ icon: Icon, name, line }: { icon: typeof Users; name: string; line: string }) => (
  <a className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-secondary/40">
    <Icon className="h-5 w-5 text-primary" />
    <div className="text-sm font-semibold">{name}</div>
    <div className="text-xs leading-relaxed text-muted-foreground">{line}</div>
    <div className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-medium text-primary">
      See how it fits <ArrowRight className="h-3 w-3" />
    </div>
  </a>
);

const EvidenceCard = ({ icon: Icon, title, line }: { icon: typeof Printer; title: string; line: string }) => (
  <div className="rounded-lg border border-border bg-card p-4">
    <Icon className="h-5 w-5 text-foreground/70" />
    <div className="mt-2 text-sm font-semibold">{title}</div>
    <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{line}</div>
  </div>
);

const PrototypeHome = () => (
  <PrototypeFrame title="Home — landing" url="/">
    {(viewport) => (
      <div>
        <ProtoNav viewport={viewport} />
        <Disclaimer />

        {/* HERO */}
        <section className="border-b border-border px-4 py-8 md:px-10 md:py-12">
          <div className={viewport === "mobile" ? "space-y-6" : "grid items-start gap-10 md:grid-cols-[1.05fr_1.25fr]"}>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Worksheet generator
              </div>
              <h1 className="mt-2 text-2xl font-semibold leading-tight md:text-4xl">
                Printable cognitive worksheets, assembled in 5 minutes.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                Build adjustable practice sets for attention, memory, language, logic and arithmetic.
                For educators, specialists and parents.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
                  Open worksheet demo <ArrowRight className="h-4 w-4" />
                </a>
                <a className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
                  Browse 170+ generators
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4 text-[11px] text-muted-foreground">
                <span>No sign-up to try</span>
                <span>·</span>
                <span>PDF export</span>
                <span>·</span>
                <span>RU / EN</span>
              </div>
            </div>
            <WorksheetPreview />
          </div>
        </section>

        {/* SEGMENT SWITCHER */}
        <section className="border-b border-border px-4 py-8 md:px-10 md:py-10">
          <div className="mb-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              How it fits your work
            </div>
            <h2 className="mt-1 text-lg font-semibold md:text-2xl">One tool, four workflows</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SegmentCard icon={Users} name="Educators" line="Class-ready sets aligned to a weekly topic." />
            <SegmentCard icon={MessagesSquare} name="Speech & development specialists" line="Per-child session material, reused across sessions." />
            <SegmentCard icon={FileText} name="Parents" line="A printable, age-appropriate sheet for the next 15 minutes." />
            <SegmentCard icon={Layers} name="Learning centers" line="Shared template library and multi-user accounts." />
          </div>
        </section>

        {/* PRODUCT EVIDENCE */}
        <section className="border-b border-border px-4 py-8 md:px-10 md:py-10">
          <div className="mb-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">What you get</div>
            <h2 className="mt-1 text-lg font-semibold md:text-2xl">A tool, end to end</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <EvidenceCard icon={Layers} title="170+ generators" line="Filtered by skill, age and session goal. Search with synonyms." />
            <EvidenceCard icon={Printer} title="Printable sets" line="Drag to reorder, preview page count, export a clean PDF." />
            <EvidenceCard icon={Clock} title="Student cabinet" line="Students complete tasks online. Track time and read comments." />
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Outcome-neutral language. We describe what the tool does, not what the brain does.
          </div>
        </section>

        {/* SECONDARY CTA */}
        <section className="px-4 py-8 text-center md:px-10 md:py-12">
          <h2 className="text-lg font-semibold md:text-2xl">Try it before you decide.</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Open the builder demo. No sign-up. Export a sample PDF in under a minute.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Open worksheet demo <ArrowRight className="h-4 w-4" />
            </a>
            <a className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary">
              See a live session (90 sec)
            </a>
          </div>
        </section>

        <footer className="border-t border-border bg-secondary/40 px-4 py-6 text-[11px] leading-relaxed text-muted-foreground md:px-10">
          <div className="mb-2">
            <b className="text-foreground/80">Disclaimer.</b> BrainTrainings Academy is a tool for creating
            educational and wellness practice materials. It is not a medical device, does not provide diagnosis
            or medical advice, and does not promise specific outcomes.
          </div>
          <div>© BrainTrainings Academy · Terms · Privacy · Disclaimer · RU / EN</div>
        </footer>
      </div>
    )}
  </PrototypeFrame>
);

export { PrototypeHome };
