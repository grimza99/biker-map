import { cn } from "@/shared/lib";
import { ReactNode } from "react";

const chipPalette = [
  "border-accent/25 bg-accent/10 text-accent",
  "border-info/25 bg-info/10 text-info",
  "border-active/25 bg-active/10 text-active",
  "border-warning/25 bg-warning/10 text-warning",
  "border-border bg-panel-soft text-text/88",
];

function getChipPaletteClass(label: string) {
  const hash = Array.from(label).reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0
  );
  return chipPalette[hash % chipPalette.length];
}

export function Chip({
  label,
  className,
  icon,
}: {
  label: string;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]",
        getChipPaletteClass(label),
        className
      )}
    >
      {icon && icon}
      {label}
    </span>
  );
}
