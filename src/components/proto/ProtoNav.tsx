import { Menu } from "lucide-react";

export const ProtoNav = ({ viewport }: { viewport: "desktop" | "mobile" }) => {
  if (viewport === "mobile") {
    return (
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div>
          <div className="text-sm font-semibold leading-none">BrainTrainings</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">Cognitive worksheet tool</div>
        </div>
        <button aria-label="Menu" className="rounded-md border border-border p-1.5">
          <Menu className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-baseline gap-3">
        <div className="text-base font-semibold">BrainTrainings</div>
        <div className="text-xs text-muted-foreground">Worksheet generator for cognitive practice</div>
      </div>
      <nav className="flex items-center gap-1 text-sm">
        {["Product", "For whom", "Pricing"].map((l) => (
          <a key={l} className="rounded-md px-3 py-1.5 text-foreground/80 hover:bg-secondary">{l}</a>
        ))}
        <a className="ml-2 rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-secondary">Sign in</a>
      </nav>
    </div>
  );
};
