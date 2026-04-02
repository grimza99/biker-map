"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AppSession } from "@package-shared/types/session";

type SessionState = {
  session: AppSession | null;
  status: "loading" | "anonymous" | "authenticated";
  setSession: (session: AppSession | null) => void;
  refreshSession: () => Promise<AppSession | null>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({
  children,
  initialSession
}: {
  children: ReactNode;
  initialSession: AppSession | null;
}) {
  const [session, setSession] = useState<AppSession | null>(initialSession);
  const [status, setStatus] = useState<SessionState["status"]>(
    initialSession ? "authenticated" : "anonymous"
  );

  function updateSession(nextSession: AppSession | null) {
    setSession(nextSession);
    setStatus(nextSession ? "authenticated" : "anonymous");
  }

  const value = useMemo<SessionState>(
    () => ({
      session,
      status,
      setSession(nextSession) {
        updateSession(nextSession);
      },
      async refreshSession() {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!refreshResponse.ok) {
          updateSession(null);
          return null;
        }

        const meResponse = await fetch("/api/me", {
          credentials: "include",
        });

        if (!meResponse.ok) {
          updateSession(null);
          return null;
        }

        const payload = (await meResponse.json()) as {
          data?: { session?: AppSession | null };
        };

        const nextSession = payload.data?.session ?? null;
        updateSession(nextSession);
        return nextSession;
      },
      async signOut() {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });
        updateSession(null);
      }
    }),
    [session, status]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionState() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionState must be used inside SessionProvider");
  }

  return context;
}
