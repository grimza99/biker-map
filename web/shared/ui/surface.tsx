import type { ReactNode } from "react";

import { cn } from "@shared/lib";

export function Surface({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[20px] border border-[color:var(--border)] bg-[color:var(--panel)] p-5 shadow-[var(--shadow)] backdrop-blur-xl",
        className
      )}>
      {children}
    </section>
  );
}
