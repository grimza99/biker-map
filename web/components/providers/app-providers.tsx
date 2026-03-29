"use client";

import type { ReactNode } from "react";

import { AppQueryProvider } from "@web/components/providers/query-provider";
import { SessionProvider } from "@web/components/session/session-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppQueryProvider>
      <SessionProvider>{children}</SessionProvider>
    </AppQueryProvider>
  );
}
