import { ArrowRight, Info, Quote } from "lucide-react";
import { PrototypeFrame } from "@/components/proto/Frame";
import { ProtoNav } from "@/components/proto/ProtoNav";

const FaqItem = ({ q, a }: { q: string; a: string }) => (
  <details className="group border-b border-border py-3">
    <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-foreground">
      {q}
      <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">+</span>
    </summary>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
  </details>
);

const PrototypeSegment = () => (
  <PrototypeFrame title="Segment — Speech & development specialists" url="/for/speech-specialists">
    {(viewport) => (
      <div>
        <ProtoNav viewport={viewport} />

        {/* BREADCRUMB + DISCLAIMER STRIP */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2 text-[11px] text-muted-foreground md:px-10">
          <span>For whom</span>
          <span>/</span>
          <span className="text-foreground">Speech & development specialists</span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <Info className="h-3 w-3" />
            Material creation tool. Not for diagnosis or treatment.
          </span>
        </div>

        {/* HERO */}
        <section className="border-b border-border px-4 py-8 md:px-10 md:py-12">
          <div className={viewport === "mobile" ? "space-y-5" : "grid gap-10 md:grid-cols-[1.1fr_1fr]"}>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                For speech & development specialists
              </div>
              <h1 className="mt-2 text-2xl font-semibold leading-tight md:text-4xl">
                Session material, prepared per child, in minutes.
              </h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
                Assemble a printable or on-screen set for each session. Reuse and adjust across recurring sessions.
                Keep short notes per child. The tool prepares materials — you run the session.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                  Open the session material demo <ArrowRight className="h-4 w-4" />
                </a>
                <a className="text-sm font-medium underline-offset-4 hover:underline">Browse generators by goal</a>
              </div>
            </div>

            {/* SCENARIO */}
            <aside className="rounded-lg border border-border bg-card p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Real scenario
              </div>
              <div className="mt-1 text-sm font-semibold">Tuesday 18:00 · М., 7 y.o.</div>
              <ol className="mt-3 space-y-2 text-sm text-foreground/90">
                <li className="flex gap-2"><span className="font-mono text-xs text-muted-foreground">1.</span> Open M.'s session profile, pick last week's set as a starting point.</li>
                <li className="flex gap-2"><span className="font-mono text-xs text-muted-foreground">2.</span> Swap one attention exercise for a harder variant; keep two memory tasks.</li>
                <li className="flex gap-2"><span className="font-mono text-xs text-muted-foreground">3.</span> Regenerate with one click; preview the new pages.</li>
                <li className="flex gap-2"><span className="font-mono text-xs text-muted-foreground">4.</span> Send to M.'s cabinet; print 2 pages for the in-room session.</li>
                <li className="flex gap-2"><span className="font-mono text-xs text-muted-foreground">5.</span> After the session, add notes; the set is saved to M.'s history.</li>
              </ol>
            </aside>
          </div>
        </section>

        {/* PRODUCT EVIDENCE */}
        <section className="border-b border-border px-4 py-8 md:px-10 md:py-10">
          <div className="mb-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">What you'll use</div>
            <h2 className="mt-1 text-lg font-semibold md:text-2xl">Three screens, in the order you use them</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { t: "Per-child set history", l: "Every set saved under the child, with date and notes. Reuse, fork, adjust." },
              { t: "Adjustable generators", l: "Difficulty, item count, age. Live preview updates as you change controls." },
              { t: "Student cabinet", l: "Send the set online or print it. Track completion time and read comments." },
            ].map((b) => (
              <div key={b.t} className="rounded-lg border border-border bg-card p-4">
                <div className="grid-paper mb-3 aspect-[4/3] rounded-md border border-border" />
                <div className="text-sm font-semibold">{b.t}</div>
                <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{b.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* QUOTE */}
        <section className="border-b border-border px-4 py-8 md:px-10 md:py-10">
          <figure className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-5">
            <Quote className="h-5 w-5 text-muted-foreground" />
            <blockquote className="mt-2 text-base leading-relaxed text-foreground/90">
              “I use it to prepare materials between sessions. Per-child history saves me about an hour a week.
              I like that the wording stays neutral — I'm the one running the session, the tool just gives me the pages.”
            </blockquote>
            <figcaption className="mt-3 text-xs text-muted-foreground">
              — Specialist in private practice, St. Petersburg. Quoted with consent.
            </figcaption>
          </figure>
        </section>

        {/* DISCLAIMER REINFORCEMENT */}
        <section className="border-b border-border bg-secondary/40 px-4 py-6 md:px-10">
          <div className="mx-auto max-w-3xl text-sm leading-relaxed text-foreground/90">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              What this tool is, and is not
            </div>
            <p className="mt-2">
              BrainTrainings Academy generates practice materials for cognitive and language exercises.
              It is <b>not a medical device</b>, does <b>not provide diagnosis</b>, does <b>not give medical
              advice</b>, and does <b>not promise specific outcomes</b>. Clinical decisions remain with the specialist.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-8 md:px-10 md:py-10">
          <div className="mb-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">FAQ</div>
            <h2 className="mt-1 text-lg font-semibold md:text-2xl">Specialist questions</h2>
          </div>
          <div className="mx-auto max-w-2xl">
            <FaqItem q="Can I keep notes per child?" a="Yes. Each child has a profile with session history, the sets used, and free-form notes. Notes are private to your account." />
            <FaqItem q="Where is the data stored?" a="See the data handling page linked from the footer. You can export and delete a child's data at any time." />
            <FaqItem q="Does it replace my session plan?" a="No. The tool prepares material. The session, goals and clinical decisions are yours." />
            <FaqItem q="Can I print without an account?" a="The builder demo lets you export a sample PDF without signing up. Saved sets require an account." />
          </div>
          <div className="mx-auto mt-6 max-w-2xl text-center">
            <a className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              Open the session material demo <ArrowRight className="h-4 w-4" />
            </a>
            <div className="mt-2 text-xs text-muted-foreground">
              or <a className="underline-offset-4 hover:underline">see the worksheet builder</a>
            </div>
          </div>
        </section>

        <footer className="border-t border-border bg-secondary/40 px-4 py-6 text-[11px] leading-relaxed text-muted-foreground md:px-10">
          <b className="text-foreground/80">Disclaimer.</b> Material creation tool only. Not a medical device, not for diagnosis or treatment.
        </footer>
      </div>
    )}
  </PrototypeFrame>
);

export { PrototypeSegment };
