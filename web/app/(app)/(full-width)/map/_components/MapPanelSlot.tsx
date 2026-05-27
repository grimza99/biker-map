"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function MapPanelSlot({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/map") {
    return null;
  }

  return children;
}
