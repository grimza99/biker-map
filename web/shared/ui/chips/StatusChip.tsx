import { cn } from "@/shared/lib";
import { ReactNode } from "react";

export function StatusChip({
  statusLabel,
  className,
  icon,
}: {
  statusLabel: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-accent",
        className
      )}
    >
      {icon && icon}
      {statusLabel}
    </span>
  );
}
