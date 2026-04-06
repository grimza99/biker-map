"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { API_PATHS } from "@package-shared/constants/api";
import type { ApiResponse } from "@package-shared/types/api";
import type { MeResponseData, RefreshResponseData } from "@package-shared/types/auth";
import type { AppSession } from "@package-shared/types/session";
import { apiFetch, setApiAccessToken } from "@shared/api/http";

type SessionState = {
  session: AppSession | null;
  accessToken: string | null;
  status: "loading" | "anonymous" | "authenticated";
  setSession: (session: AppSession | null, accessToken?: string | null) => void;
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<SessionState["status"]>(
    initialSession ? "authenticated" : "anonymous"
  );

  function updateSession(
    nextSession: AppSession | null,
    nextAccessToken: string | null = accessToken
  ) {
    setSession(nextSession);
    setAccessToken(nextAccessToken);
    setApiAccessToken(nextAccessToken);
    setStatus(nextSession ? "authenticated" : "anonymous");
  }

  const value = useMemo<SessionState>(
    () => ({
      session,
      accessToken,
      status,
      setSession(nextSession, nextAccessToken = accessToken) {
        updateSession(nextSession, nextAccessToken);
      },
      async refreshSession() {
        let refreshPayload: ApiResponse<RefreshResponseData>;
        try {
          refreshPayload = await apiFetch<RefreshResponseData>(
            API_PATHS.auth.refresh,
            {
              method: "POST",
            }
          );
        } catch {
          updateSession(null, null);
          return null;
        }

        const nextAccessToken = refreshPayload.data.accessToken ?? null;
        setApiAccessToken(nextAccessToken);

        let mePayload: ApiResponse<MeResponseData>;
        try {
          mePayload = await apiFetch<MeResponseData>(API_PATHS.auth.me);
        } catch {
          updateSession(null, null);
          return null;
        }

        const nextSession = mePayload.data.session ?? null;
        updateSession(nextSession, nextAccessToken);
        return nextSession;
      },
      async signOut() {
        await fetch(API_PATHS.auth.logout, {
          method: "POST",
          credentials: "include",
        });
        updateSession(null, null);
      }
    }),
    [accessToken, session, status]
  );

  useEffect(() => {
    if (!initialSession || accessToken) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const refreshPayload = await apiFetch<RefreshResponseData>(
          API_PATHS.auth.refresh,
          {
            method: "POST",
          }
        );

        if (cancelled) {
          return;
        }

        const nextAccessToken = refreshPayload.data.accessToken ?? null;
        if (!nextAccessToken) {
          updateSession(null, null);
          return;
        }

        const mePayload = await apiFetch<MeResponseData>(API_PATHS.auth.me);
        if (cancelled) {
          return;
        }

        updateSession(mePayload.data.session ?? null, nextAccessToken);
      } catch {
        if (!cancelled) {
          updateSession(null, null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accessToken, initialSession]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionState() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionState must be used inside SessionProvider");
  }

  return context;
}
