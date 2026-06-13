import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { ArrowRight } from "lucide-react";

const sections = [
  { to: "/audit", title: "UX audit", desc: "23 findings across 7 areas, ranked by severity." },
  { to: "/roadmap", title: "Action roadmap", desc: "What to ship in 1 week, 1 month, later." },
  { to: "/ia", title: "Information architecture", desc: "Public site sitemap and navigation model." },
  { to: "/hero", title: "Hero & CTA", desc: "First-screen copy, layout and CTA hierarchy." },
  { to: "/segments", title: "Segment pages", desc: "Structure for educators, specialists, parents, centers." },
  { to: "/demo", title: "Demo structure", desc: "Worksheet set demo vs live session demo." },
  { to: "/prototype/home", title: "Prototype — home", desc: "Click-through wireframe of the home landing." },
  { to: "/prototype/segment", title: "Prototype — segment", desc: "Click-through wireframe for speech specialists." },
];

const Overview = () => (
  <>
    <PageHeader
      eyebrow="Deliverable"
      title="BrainTrainings Academy — UX audit & redesign concept"
      description="A working review of braintrainings.academy: audit findings, IA, hero strategy, demo flows, and clickable wireframes. Built as a tool, not a marketing deck."
    />
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Scope
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          Public site only: home, exercises catalog, worksheet demo, live session demo,
          segment landings (educators, speech/development specialists, parents, learning centers),
          pricing and support. Positioning constraint respected throughout:
          <span className="font-medium"> educational/wellness material creation tool — not a medical device,
          no diagnosis, no medical advice, no promised outcomes.</span>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-secondary/40"
          >
            <div>
              <div className="text-sm font-semibold text-foreground">{s.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.desc}</div>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </div>
    </div>
  </>
);

export { Overview };
