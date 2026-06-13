import { cn } from "@/lib/utils";

type Severity = "Critical" | "High" | "Medium" | "Low";

const styles: Record<Severity, string> = {
  Critical: "bg-[hsl(var(--severity-critical))] text-white",
  High: "bg-[hsl(var(--severity-high))] text-white",
  Medium: "bg-[hsl(var(--severity-medium))] text-foreground",
  Low: "bg-[hsl(var(--severity-low))] text-white",
};

export const SeverityBadge = ({ level }: { level: Severity }) => (
  <span
    className={cn(
      "inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
      styles[level],
    )}
  >
    {level}
  </span>
);
