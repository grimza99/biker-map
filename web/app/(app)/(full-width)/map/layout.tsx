import type { ReactNode } from "react";

import { MapPanelSlot } from "./_components/MapPanelSlot";

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
      <MapPanelSlot>{panel}</MapPanelSlot>
    </div>
  );
}
