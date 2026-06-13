import { PageHeader } from "@/components/PageHeader";

const tree = [
  {
    label: "Home /",
    note: "Hero with live worksheet preview, segment switcher, evidence blocks.",
    children: [],
  },
  {
    label: "Product",
    note: "Mega-menu group. Each item is a real page.",
    children: [
      { label: "/product/generators — Catalog of 170+ generators", note: "Faceted by domain, age, goal." },
      { label: "/product/worksheet-sets — Assemble printable sets", note: "Templates + custom." },
      { label: "/product/live-sessions — Run sessions online", note: "Screen-shared sessions." },
      { label: "/product/student-cabinet — Student side", note: "Completion, time, comments." },
    ],
  },
  {
    label: "For whom",
    note: "Mega-menu group. One landing per audience.",
    children: [
      { label: "/for/educators", note: "Class-set use cases." },
      { label: "/for/speech-specialists", note: "Session material use cases. Includes disclaimer." },
      { label: "/for/parents", note: "Home-practice use cases. Includes disclaimer." },
      { label: "/for/learning-centers", note: "Multi-user, procurement, data handling." },
    ],
  },
  {
    label: "Demos",
    note: "Two distinct entry points, surfaced inline on home and inside Product menu.",
    children: [
      { label: "/demo/worksheet-builder", note: "Async: build, preview, print." },
      { label: "/demo/live-session", note: "Sync: replay of a real session UI, narrated." },
    ],
  },
  {
    label: "Pricing & resources",
    note: "Commercial and supporting content.",
    children: [
      { label: "/pricing", note: "Plans, comparison, 'what fits me?' selector." },
      { label: "/resources/sample-pdfs", note: "Free downloadable worksheet samples." },
      { label: "/resources/session-plans", note: "Editable plans by goal and age." },
      { label: "/resources/blog", note: "Method articles, no outcome claims." },
      { label: "/support", note: "Help center, contact, status." },
    ],
  },
  {
    label: "Account & legal",
    note: "Persistent in nav (auth) and footer (legal).",
    children: [
      { label: "/sign-in, /sign-up", note: "Single primary auth path." },
      { label: "/legal/terms, /legal/privacy, /legal/disclaimer", note: "Full disclaimer page linked from footer." },
    ],
  },
];

const IA = () => (
  <>
    <PageHeader
      eyebrow="Deliverable 3"
      title="Information architecture"
      description="Sitemap of the public site, organized around two mental anchors: Product (what the tool does) and For whom (whose workflow it fits)."
    />
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="space-y-4">
        {tree.map((node) => (
          <section key={node.label} className="rounded-lg border border-border bg-card">
            <header className="border-b border-border px-5 py-3">
              <div className="font-mono text-sm font-semibold text-foreground">{node.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{node.note}</div>
            </header>
            {node.children.length > 0 && (
              <ul className="divide-y divide-border">
                {node.children.map((c) => (
                  <li key={c.label} className="px-5 py-3">
                    <div className="font-mono text-xs text-foreground/90">{c.label}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{c.note}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-border bg-secondary/40 p-5 text-sm leading-relaxed text-foreground/90">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Navigation rule
        </div>
        <p className="mt-2">
          Top bar carries only four entries: <b>Product</b>, <b>For whom</b>, <b>Pricing</b>, <b>Sign in</b>.
          Mega-menus expose the rest. Mobile collapses to a drawer with the same four groups, never a long flat list.
        </p>
      </div>
    </div>
  </>
);

export { IA };
