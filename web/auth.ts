import type { AppSession } from "@package-shared/types/session";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import {
  getProfileStatus,
  type ProfileStatus,
} from "@shared/api/supabase-profiles";
import { createSupabaseAuthClient } from "@shared/lib/supabase";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SupabaseBridgeUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

const ACCESS_TOKEN_REFRESH_BUFFER_SECONDS = 60;
const isProduction = process.env.NODE_ENV === "production";
const useSecureAuthCookies = isProduction;
const authSecret =
  process.env.AUTH_SECRET ??
  (isProduction ? undefined : "biker-map-local-next-auth-secret");

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  secret: authSecret,
  // Auth.js keeps auth cookies HttpOnly, SameSite=Lax, and Path=/ by default.
  // Keep Secure explicit: enabled in production HTTPS, disabled for local HTTP.
  useSecureCookies: useSecureAuthCookies,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const supabase = createSupabaseAuthClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.signInWithPassword(parsed.data);

        if (error || !session?.user) {
          return null;
        }

        const profileStatusResult = await resolveProfileStatus(session.user.id);
        if (!profileStatusResult.ok) {
          return null;
        }

        const profileStatus = profileStatusResult.profileStatus;
        if (profileStatus?.deletedAt) {
          return null;
        }

        const metadataName =
          typeof session.user.user_metadata?.display_name === "string"
            ? session.user.user_metadata.display_name
            : "";
        const avatarUrl =
          typeof session.user.user_metadata?.avatar_url === "string"
            ? session.user.user_metadata.avatar_url
            : null;

        return {
          id: session.user.id,
          email: session.user.email ?? "",
          name: profileStatus?.name || metadataName,
          image: avatarUrl,
          role: profileStatus?.role || "member",
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at ?? 0,
        } satisfies SupabaseBridgeUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const bridgeUser = user as SupabaseBridgeUser;
        token.userId = bridgeUser.id;
        token.role = bridgeUser.role;
        token.name = bridgeUser.name;
        token.email = bridgeUser.email;
        token.picture = bridgeUser.image;
        token.supabaseAccessToken = bridgeUser.accessToken;
        token.supabaseRefreshToken = bridgeUser.refreshToken;
        token.supabaseExpiresAt = bridgeUser.expiresAt;
        token.supabaseError = undefined;
        return token;
      }

      const updatePayload =
        trigger === "update"
          ? (session as
              | {
                  appSession?: AppSession | null;
                  accessToken?: string | null;
                  forceRefresh?: boolean;
                }
              | undefined)
          : undefined;

      if (trigger === "update") {
        if (updatePayload?.appSession) {
          token.userId = updatePayload.appSession.userId;
          token.role = updatePayload.appSession.role;
          token.name = updatePayload.appSession.name;
          token.email = updatePayload.appSession.email;
          token.picture = updatePayload.appSession.avatarUrl;
        } else if (updatePayload?.appSession === null) {
          token.userId = null;
          token.role = undefined;
          token.name = undefined;
          token.email = undefined;
          token.picture = undefined;
          token.supabaseAccessToken = null;
          token.supabaseRefreshToken = null;
          token.supabaseExpiresAt = 0;
          token.supabaseError = undefined;
          return token;
        }

        if (updatePayload?.accessToken) {
          token.supabaseAccessToken = updatePayload.accessToken;
        } else if (updatePayload?.accessToken === null) {
          token.supabaseAccessToken = null;
        }
      }

      const expiresAt =
        typeof token.supabaseExpiresAt === "number"
          ? token.supabaseExpiresAt
          : 0;

      if (
        !updatePayload?.forceRefresh &&
        token.supabaseAccessToken &&
        expiresAt >
          Math.floor(Date.now() / 1000) + ACCESS_TOKEN_REFRESH_BUFFER_SECONDS
      ) {
        return token;
      }

      return refreshSupabaseToken(token);
    },
    async session({ session, token }) {
      const userId = typeof token.userId === "string" ? token.userId : null;
      const role = typeof token.role === "string" ? token.role : "member";
      const accessToken =
        typeof token.supabaseAccessToken === "string"
          ? token.supabaseAccessToken
          : null;

      session.user = {
        ...session.user,
        id: userId ?? "",
        name: typeof token.name === "string" ? token.name : "",
        email: typeof token.email === "string" ? token.email : "",
        image: typeof token.picture === "string" ? token.picture : null,
      };
      session.appSession = userId
        ? {
            userId,
            name: session.user.name ?? "",
            email: session.user.email ?? "",
            avatarUrl: session.user.image ?? null,
            role,
          }
        : null;
      session.accessToken = accessToken;
      session.supabaseError =
        typeof token.supabaseError === "string" ? token.supabaseError : null;

      return session;
    },
  },
});

async function refreshSupabaseToken(token: Record<string, unknown>) {
  const refreshToken =
    typeof token.supabaseRefreshToken === "string"
      ? token.supabaseRefreshToken
      : null;

  if (!refreshToken) {
    return {
      ...token,
      supabaseAccessToken: null,
      supabaseError: "MissingSupabaseRefreshToken",
    };
  }

  const supabase = createSupabaseAuthClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session?.user) {
    return {
      ...token,
      supabaseAccessToken: null,
      supabaseRefreshToken: null,
      supabaseExpiresAt: 0,
      supabaseError: "RefreshSupabaseAccessTokenError",
    };
  }

  const profileStatusResult = await resolveProfileStatus(data.session.user.id);
  if (!profileStatusResult.ok) {
    return {
      ...token,
      userId: data.session.user.id,
      email: data.session.user.email ?? "",
      picture:
        typeof data.session.user.user_metadata?.avatar_url === "string"
          ? data.session.user.user_metadata.avatar_url
          : null,
      supabaseAccessToken: data.session.access_token,
      supabaseRefreshToken: data.session.refresh_token,
      supabaseExpiresAt: data.session.expires_at ?? 0,
      supabaseError: "ProfileStatusLookupError",
    };
  }

  const profileStatus = profileStatusResult.profileStatus;
  if (profileStatus?.deletedAt) {
    return {
      ...token,
      userId: null,
      supabaseAccessToken: null,
      supabaseRefreshToken: null,
      supabaseExpiresAt: 0,
      supabaseError: "DeletedProfile",
    };
  }

  return {
    ...token,
    userId: data.session.user.id,
    role: profileStatus?.role || "member",
    name:
      profileStatus?.name ||
      (typeof data.session.user.user_metadata?.display_name === "string"
        ? data.session.user.user_metadata.display_name
        : ""),
    email: data.session.user.email ?? "",
    picture:
      typeof data.session.user.user_metadata?.avatar_url === "string"
        ? data.session.user.user_metadata.avatar_url
        : null,
    supabaseAccessToken: data.session.access_token,
    supabaseRefreshToken: data.session.refresh_token,
    supabaseExpiresAt: data.session.expires_at ?? 0,
    supabaseError: undefined,
  };
}

async function resolveProfileStatus(userId: string): Promise<
  | {
      ok: true;
      profileStatus: ProfileStatus | null;
    }
  | {
      ok: false;
    }
> {
  try {
    return {
      ok: true,
      profileStatus: await getProfileStatus(userId),
    };
  } catch {
    return {
      ok: false,
    };
  }
}
