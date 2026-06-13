import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SeverityBadge } from "@/components/SeverityBadge";
import { areas, findings, type Severity } from "@/data/audit";
import { cn } from "@/lib/utils";

const severities: (Severity | "All")[] = ["All", "Critical", "High", "Medium", "Low"];

const Audit = () => {
  const [sev, setSev] = useState<Severity | "All">("All");
  const [area, setArea] = useState<string>("All");

  const counts = useMemo(() => {
    const c: Record<string, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    findings.forEach((f) => (c[f.severity] += 1));
    return c;
  }, []);

  const filtered = findings.filter(
    (f) => (sev === "All" || f.severity === sev) && (area === "All" || f.area === area),
  );

  return (
    <>
      <PageHeader
        eyebrow="Deliverable 1"
        title="UX audit"
        description={`${findings.length} findings across 8 areas, ranked by severity. Critical items block comprehension or conversion; Low items are polish.`}
      />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["Critical", "High", "Medium", "Low"] as Severity[]).map((s) => (
            <div key={s} className="rounded-lg border border-border bg-card p-4">
              <SeverityBadge level={s} />
              <div className="mt-2 text-2xl font-semibold tabular-nums">{counts[s]}</div>
              <div className="text-xs text-muted-foreground">findings</div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {severities.map((s) => (
            <button
              key={s}
              onClick={() => setSev(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                sev === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-secondary",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setArea("All")}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs transition-colors",
              area === "All"
                ? "border-foreground/40 bg-secondary"
                : "border-border bg-card hover:bg-secondary",
            )}
          >
            All areas
          </button>
          {areas.map((a) => (
            <button
              key={a}
              onClick={() => setArea(a)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs transition-colors",
                area === a
                  ? "border-foreground/40 bg-secondary"
                  : "border-border bg-card hover:bg-secondary",
              )}
            >
              {a}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((f) => (
            <article
              key={f.id}
              className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20"
            >
              <header className="flex flex-wrap items-center gap-3">
                <SeverityBadge level={f.severity} />
                <span className="text-[11px] font-mono text-muted-foreground">{f.id}</span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {f.area}
                </span>
              </header>
              <h3 className="mt-2 text-base font-semibold leading-snug">{f.title}</h3>
              <dl className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Observation
                  </dt>
                  <dd className="mt-1 text-foreground/90">{f.observation}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Impact
                  </dt>
                  <dd className="mt-1 text-foreground/90">{f.impact}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Recommendation
                  </dt>
                  <dd className="mt-1 text-foreground/90">{f.recommendation}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </>
  );
};

export { Audit };
