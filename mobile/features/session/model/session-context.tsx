import { createContext, type PropsWithChildren, useContext, useState } from "react";

type SessionStatus = "anonymous" | "authenticated";

type SessionUser = {
  id: string;
  name: string;
};

type SessionContextValue = {
  status: SessionStatus;
  user: SessionUser | null;
  signIn: () => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<SessionStatus>("anonymous");

  const value: SessionContextValue = {
    status,
    user: status === "authenticated" ? { id: "demo-user", name: "민준" } : null,
    signIn: () => setStatus("authenticated"),
    signOut: () => setStatus("anonymous"),
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSessionState() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionState must be used within SessionProvider");
  }

  return context;
}
