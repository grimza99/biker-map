import type { ReactNode } from "react";

import { cn } from "@shared/lib";
import { Surface } from "./surface";

export function PageWrapper({
  children,
  className,
  innerClassName,
  pageTitle,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  pageTitle?: string;
}) {
  return (
    <Surface className={cn("p-2 md:p-7", className)}>
      {pageTitle && <h1 className="m-0 text-2xl font-semibold">{pageTitle}</h1>}
      <div className={cn("grid gap-6", innerClassName)}>{children}</div>
    </Surface>
  );
}
