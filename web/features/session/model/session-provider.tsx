"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppSession } from "@package-shared/types/session";

import { createSupabaseBrowserClient } from "@shared/lib";
import { mapSupabaseSession } from "./map-supabase-session";

type SessionState = {
  session: AppSession | null;
  status: "loading" | "anonymous" | "authenticated";
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
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const [session, setSession] = useState<AppSession | null>(initialSession);
  const [status, setStatus] = useState<SessionState["status"]>(
    initialSession ? "authenticated" : "anonymous"
  );

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const mappedSession = mapSupabaseSession(nextSession);
      setSession(mappedSession);
      setStatus(mappedSession ? "authenticated" : "anonymous");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<SessionState>(
    () => ({
      session,
      status,
      async signOut() {
        await supabase.auth.signOut();
        setSession(null);
        setStatus("anonymous");
      }
    }),
    [session, status, supabase]
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
