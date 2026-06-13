import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Smartphone, Monitor } from "lucide-react";

interface Props {
  title: string;
  url: string;
  children: (viewport: "desktop" | "mobile") => ReactNode;
}

export const PrototypeFrame = ({ title, url, children }: Props) => {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Prototype
          </div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="mt-0.5 font-mono text-xs text-muted-foreground">{url}</div>
        </div>
        <div className="inline-flex rounded-md border border-border bg-card p-0.5">
          <button
            onClick={() => setViewport("desktop")}
            className={cn(
              "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
              viewport === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            <Monitor className="h-3.5 w-3.5" /> Desktop
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={cn(
              "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors",
              viewport === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
            )}
          >
            <Smartphone className="h-3.5 w-3.5" /> Mobile
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mx-auto overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all",
          viewport === "mobile" ? "max-w-[380px]" : "max-w-6xl",
        )}
      >
        <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-3 py-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-foreground/20" />
          </div>
          <div className="ml-2 flex-1 truncate rounded bg-background px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
            braintrainings.academy{url}
          </div>
        </div>
        <div className="bg-background">{children(viewport)}</div>
      </div>
    </div>
  );
};
