import type { ReactNode } from "react";

import { cn } from "@shared/lib";
import { Surface } from "./surface";

export function PageWrapper({
  children,
  className,
  innerClassName
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <Surface className={cn("p-6 md:p-7", className)}>
      <div className={cn("grid gap-6", innerClassName)}>{children}</div>
    </Surface>
  );
}
