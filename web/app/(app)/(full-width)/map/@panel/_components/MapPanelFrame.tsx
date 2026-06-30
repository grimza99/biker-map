import { X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function MapPanelFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="pointer-events-auto absolute inset-y-0 top-0 right-0 z-100 flex w-[min(26rem,100vw)] bottom-0 flex-col border-l border-border bg-bg/95 shadow-[-18px_0_48px_rgba(5,6,7,0.28)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="m-0 text-lg font-semibold text-text">{title}</h2>
        <Link
          href="/map"
          aria-label="패널 닫기"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-text transition duration-150 ease-out hover:border-border hover:bg-panel-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
    </aside>
  );
}
