"use client";

import type { ReactNode } from "react";
import type { InitialSessionData } from "@package-shared/types/session";

import { AppQueryProvider } from "./query-provider";
import { SessionProvider } from "@features/session";
import { ToastProvider } from "@shared/ui";

export function AppProviders({
  children,
  initialSession
}: {
  children: ReactNode;
  initialSession: InitialSessionData;
}) {
  return (
    <AppQueryProvider>
      <ToastProvider>
        <SessionProvider initialSession={initialSession}>
          {children}
        </SessionProvider>
      </ToastProvider>
    </AppQueryProvider>
  );
}
