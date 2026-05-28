"use client";

import { API_PATHS } from "@package-shared/constants/api";
import type {
  AppSession,
  InitialSessionData,
} from "@package-shared/types/session";
import {
  SessionProvider as NextAuthSessionProvider,
  signOut as nextAuthSignOut,
  useSession as useNextAuthSession,
} from "next-auth/react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import { setApiAccessToken, setApiSessionRefreshHandler } from "@shared/api/http";

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
  initialSession,
}: {
  children: ReactNode;
  initialSession: InitialSessionData;
}) {
  return (
    <NextAuthSessionProvider refetchOnWindowFocus>
      <SessionBridge initialSession={initialSession}>{children}</SessionBridge>
    </NextAuthSessionProvider>
  );
}

function SessionBridge({
  children,
  initialSession,
}: {
  children: ReactNode;
  initialSession: InitialSessionData;
}) {
  const {
    data: nextAuthSession,
    status: nextAuthStatus,
    update,
  } = useNextAuthSession();

  const session =
    nextAuthStatus === "loading"
      ? initialSession.session
      : nextAuthSession?.appSession ?? null;
  const accessToken =
    nextAuthStatus === "loading"
      ? initialSession.accessToken
      : nextAuthSession?.accessToken ?? null;
  const status: SessionState["status"] =
    nextAuthStatus === "loading"
      ? "loading"
      : session && accessToken
      ? "authenticated"
      : "anonymous";

  useEffect(() => {
    setApiAccessToken(status === "authenticated" ? accessToken : null);
  }, [accessToken, status]);

  useEffect(() => {
    setApiSessionRefreshHandler(async () => {
      const updatedSession = await update({ forceRefresh: true });
      return updatedSession?.accessToken ?? null;
    });

    return () => {
      setApiSessionRefreshHandler(null);
    };
  }, [update]);

  const value = useMemo<SessionState>(
    () => ({
      session: status === "authenticated" ? session : null,
      accessToken: status === "authenticated" ? accessToken : null,
      status,
      setSession(nextSession, nextAccessToken = accessToken) {
        void update({
          appSession: nextSession,
          accessToken: nextAccessToken,
        });
      },
      async refreshSession() {
        const updatedSession = await update({ forceRefresh: true });
        const updatedAppSession = updatedSession?.appSession ?? null;
        const updatedAccessToken = updatedSession?.accessToken ?? null;
        setApiAccessToken(updatedAccessToken);
        return updatedAccessToken ? updatedAppSession : null;
      },
      async signOut() {
        await nextAuthSignOut({ redirect: false });
        await fetch(API_PATHS.auth.logout, {
          method: "POST",
          credentials: "include",
        }).catch(() => undefined);
        setApiAccessToken(null);
      },
    }),
    [accessToken, session, status, update]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionState() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionState must be used inside SessionProvider");
  }

  return context;
}
