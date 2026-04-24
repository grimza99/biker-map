"use client";

import type { ReactNode } from "react";
import type { AppSession } from "@package-shared/types/session";

import { AppQueryProvider } from "./query-provider";
import { SessionProvider } from "@features/session";
import { ToastProvider } from "@shared/ui";

export function AppProviders({
  children,
  initialSession
}: {
  children: ReactNode;
  initialSession: AppSession | null;
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
