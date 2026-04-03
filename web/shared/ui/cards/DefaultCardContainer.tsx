import { cn } from "@/shared/lib";
import { ReactNode } from "react";

export function DefaultCardContainer({
  className,
  children,
  footer,
}: {
  className?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 rounded-3xl border border-border bg-panel/84 p-5 shadow-[0_18px_50px_rgba(5,6,7,0.18)] backdrop-blur-xl",
        className
      )}
    >
      {children}
      {footer ? (
        <div className="flex items-center justify-end">{footer}</div>
      ) : null}
    </div>
  );
}
