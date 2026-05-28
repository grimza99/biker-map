import type { AppSession } from "@package-shared/types/session";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id?: string;
    };
    appSession: AppSession | null;
    accessToken: string | null;
    supabaseError: string | null;
  }

  interface User {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string | null;
    role?: string;
    supabaseAccessToken?: string | null;
    supabaseRefreshToken?: string | null;
    supabaseExpiresAt?: number;
    supabaseError?: string | null;
  }
}
