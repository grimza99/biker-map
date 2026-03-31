"use client";

import type { ReactNode } from "react";
import type { AppSession } from "@package-shared/types/session";

import { AppQueryProvider } from "./query-provider";
import { SessionProvider } from "@features/session";

export function AppProviders({
  children,
  initialSession
}: {
  children: ReactNode;
  initialSession: AppSession | null;
}) {
  return (
    <AppQueryProvider>
      <SessionProvider initialSession={initialSession}>{children}</SessionProvider>
    </AppQueryProvider>
  );
}
