"use client";

import type { ReactNode } from "react";

import { AppQueryProvider } from "./query-provider";
import { SessionProvider } from "@features/session";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppQueryProvider>
      <SessionProvider>{children}</SessionProvider>
    </AppQueryProvider>
  );
}
