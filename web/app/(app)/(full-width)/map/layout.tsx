import type { ReactNode } from "react";

import { MapCanvasShell } from "./_components/MapCanvasShell";
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
      <MapCanvasShell />
      {children}
      <MapPanelSlot>{panel}</MapPanelSlot>
    </div>
  );
}
