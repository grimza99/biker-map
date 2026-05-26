import type { ReactNode } from "react";

export function MapPanelPlaceholder({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <aside className="pointer-events-auto absolute inset-y-0 right-0 z-40 flex w-[min(24rem,100vw)] flex-col border-l border-border bg-panel shadow-[-18px_0_48px_rgba(5,6,7,0.28)]">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold text-text">{title}</h2>
      </div>
      <div className="flex-1 px-5 py-5 text-sm text-muted">
        {children ?? "Parallel Routes 패널 자리입니다."}
      </div>
    </aside>
  );
}
