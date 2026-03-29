"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { SESSION_STORAGE_KEY, type AppSession } from "@entities/session";

type SessionState = {
  session: AppSession | null;
  status: "loading" | "anonymous" | "authenticated";
  signIn: (session: AppSession) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [status, setStatus] = useState<SessionState["status"]>("loading");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        setStatus("anonymous");
        return;
      }

      setSession(JSON.parse(raw) as AppSession);
      setStatus("authenticated");
    } catch {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      setSession(null);
      setStatus("anonymous");
    }
  }, []);

  const value = useMemo<SessionState>(
    () => ({
      session,
      status,
      signIn(nextSession) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
        setStatus("authenticated");
      },
      signOut() {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        setSession(null);
        setStatus("anonymous");
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
