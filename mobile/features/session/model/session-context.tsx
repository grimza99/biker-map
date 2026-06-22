import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  AppSession,
  AuthResponseData,
  LoginBody,
  MeResponseData,
  LogoutResponseData,
  SignUpBody,
} from "@package-shared/index";
import { API_PATHS } from "@package-shared/index";

import {
  apiFetch,
  clearApiAuthState,
  getApiAuthState,
  persistAuthResponse,
  restoreApiAuthState,
  subscribeApiAuthState,
} from "@/shared";
type SessionStatus = "loading" | "anonymous" | "authenticated";
type SessionContextValue = {
  accessToken: string | null;
  clearSession: () => Promise<void>;
  status: SessionStatus;
  user: AppSession | null;
  login: (body: LoginBody) => Promise<void>;
  signUp: (body: SignUpBody) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [accessToken, setAccessToken] = useState<string | null>(
    getApiAuthState().accessToken
  );
  const [user, setUser] = useState<AppSession | null>(null);

  useEffect(() => {
    let mounted = true;
    const unsubscribe = subscribeApiAuthState((nextState) => {
      if (!mounted) {
        return;
      }

      setAccessToken(nextState.accessToken);
    });

    async function restoreSession() {
      try {
        const authState = await restoreApiAuthState();

        if (!mounted) {
          return;
        }

        if (authState.session && authState.accessToken) {
          try {
            const meResponse = await apiFetch.get<MeResponseData>(
              API_PATHS.me.profile
            );

            if (!mounted) {
              return;
            }

            if (meResponse.data.authenticated && meResponse.data.session) {
              setUser(meResponse.data.session);
              setStatus("authenticated");
              return;
            }
          } catch {
            await clearApiAuthState();
          }
        }
      } catch {
        // noop
      }

      if (mounted) {
        setUser(null);
        setStatus("anonymous");
      }
    }

    void restoreSession();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value: SessionContextValue = {
    accessToken,
    async clearSession() {
      await clearApiAuthState();
      setUser(null);
      setStatus("anonymous");
    },
    status,
    user,
    async login(loginBody) {
      const response = await apiFetch.post<AuthResponseData>(
        API_PATHS.auth.login,
        loginBody
      );

      await applyAuthResponse(response.data, setStatus, setUser);
    },
    async signUp(signUpBody) {
      const response = await apiFetch.post<AuthResponseData>(
        API_PATHS.auth.signup,
        signUpBody
      );

      await applyAuthResponse(response.data, setStatus, setUser);
    },
    async signOut() {
      try {
        await apiFetch.post<LogoutResponseData>(API_PATHS.auth.logout);
      } finally {
        await value.clearSession();
      }
    },
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionState() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSessionState must be used within SessionProvider");
  }

  return context;
}

async function applyAuthResponse(
  data: AuthResponseData,
  setStatus: (status: SessionStatus) => void,
  setUser: (user: AppSession | null) => void
) {
  if (!data.accessToken || !data.refreshToken || !data.session) {
    throw new Error("모바일 인증 응답에 세션 또는 토큰이 누락되었습니다.");
  }

  await persistAuthResponse(data);
  setUser(data.session);
  setStatus("authenticated");
}
