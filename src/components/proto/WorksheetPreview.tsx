import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

const seedRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export const WorksheetPreview = () => {
  const [difficulty, setDifficulty] = useState(2);
  const [count, setCount] = useState(8);
  const [seed, setSeed] = useState(1);

  const items = useMemo(() => {
    const rand = seedRandom(seed * 100 + difficulty);
    const max = [9, 19, 49, 99][difficulty - 1] ?? 19;
    return Array.from({ length: count }, () => {
      const a = Math.floor(rand() * max) + 1;
      const b = Math.floor(rand() * max) + 1;
      return { a, b };
    });
  }, [difficulty, count, seed]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-secondary/40 px-4 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Generator
        </div>
        <div className="text-sm font-semibold">Addition · 1–{[9, 19, 49, 99][difficulty - 1]}</div>
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-secondary"
        >
          <RefreshCw className="h-3 w-3" /> Regenerate
        </button>
      </div>

      <div className="grid gap-0 md:grid-cols-[200px_1fr]">
        <div className="space-y-4 border-b border-border bg-secondary/20 p-4 md:border-b-0 md:border-r">
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Difficulty</span>
              <span className="font-mono text-foreground">{difficulty}</span>
            </div>
            <input
              type="range"
              min={1}
              max={4}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Difficulty"
            />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Items</span>
              <span className="font-mono text-foreground">{count}</span>
            </div>
            <input
              type="range"
              min={4}
              max={16}
              step={2}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-primary"
              aria-label="Item count"
            />
          </div>
          <div className="rounded-md border border-dashed border-border p-2 text-[11px] leading-relaxed text-muted-foreground">
            Live preview. Export as PDF in the full builder.
          </div>
        </div>

        <div className="grid-paper p-5">
          <div className="mb-3 flex items-baseline justify-between border-b border-border pb-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-foreground">Worksheet · Math</div>
            <div className="text-[11px] text-muted-foreground">Name: __________ &nbsp; Date: __ . __ . ____</div>
          </div>
          <ol className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm tabular-nums">
            {items.map((it, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="w-5 text-right font-mono text-xs text-muted-foreground">{i + 1}.</span>
                <span className="font-medium">{it.a} + {it.b} =</span>
                <span className="ml-1 inline-block w-10 border-b border-foreground/40" />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};
