import type { ReactNode } from "react";

export default function MapLayout({
  children,
  panel,
}: Readonly<{
  children: ReactNode;
  panel: ReactNode;
}>) {
  return (
    <div className="relative h-full w-full">
      {children}
      {panel}
    </div>
  );
}
