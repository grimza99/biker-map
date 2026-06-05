import { expect, test } from "@playwright/test";

import {
  MeResponseData,
  ApiResponse,
  ApiError,
  AuthResponseData,
  RefreshResponseData,
  API_PATHS,
} from "@package-shared/index";

import {
  createAuthFixtureAccount,
  deleteAuthUser,
  hasLocalSupabaseEnv,
  markAuthUserProfileDeleted,
} from "./support/supabase-local";

test.describe("모바일 인증 API 계약", () => {
  test.skip(
    !hasLocalSupabaseEnv(),
    "Supabase local service role 환경에서만 실행합니다."
  );

  test("모바일 회원가입, me, refresh, logout은 body token 계약을 유지한다", async ({
    request,
  }) => {
    const fixture = createAuthFixtureAccount();
    let createdUserId: string | null = null;

    try {
      const signupResponse = await request.post(API_PATHS.auth.signup, {
        headers: mobileHeaders(),
        data: fixture,
      });

      expect(signupResponse.status()).toBe(201);
      const signupBody =
        (await signupResponse.json()) as ApiResponse<AuthResponseData>;
      const signupData = signupBody.data;

      expect(signupData).toEqual({
        session: expect.objectContaining({
          email: fixture.email,
          name: fixture.name,
          role: "member",
          userId: expect.any(String),
        }),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      createdUserId = signupData.session?.userId ?? null;
      expect(createdUserId).toBeTruthy();

      const meResponse = await request.get(API_PATHS.me.profile, {
        headers: {
          ...mobileHeaders(),
          Authorization: `Bearer ${signupData.accessToken}`,
        },
      });

      expect(meResponse.status()).toBe(200);
      const meBody = (await meResponse.json()) as ApiResponse<MeResponseData>;

      expect(meBody.data.authenticated).toBe(true);
      expect(meBody.data.session).toEqual(
        expect.objectContaining({
          email: fixture.email,
          name: fixture.name,
          userId: createdUserId,
        })
      );

      const refreshResponse = await request.post(API_PATHS.auth.refresh, {
        headers: {
          ...mobileHeaders(),
          "X-Refresh-Token": signupData.refreshToken ?? "",
        },
      });

      expect(refreshResponse.status()).toBe(200);
      const refreshBody =
        (await refreshResponse.json()) as ApiResponse<RefreshResponseData>;
      const refreshData = refreshBody.data;

      expect(refreshData).toEqual({
        refreshed: true,
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });

      const refreshedMeResponse = await request.get(API_PATHS.me.profile, {
        headers: {
          ...mobileHeaders(),
          Authorization: `Bearer ${refreshData.accessToken}`,
        },
      });

      expect(refreshedMeResponse.status()).toBe(200);
      const refreshedMeBody =
        (await refreshedMeResponse.json()) as ApiResponse<MeResponseData>;

      expect(refreshedMeBody.data.authenticated).toBe(true);
      expect(refreshedMeBody.data.session).toEqual(
        expect.objectContaining({
          email: fixture.email,
          userId: createdUserId,
        })
      );

      const logoutResponse = await request.post(API_PATHS.auth.logout, {
        headers: {
          ...mobileHeaders(),
          Authorization: `Bearer ${refreshData.accessToken}`,
        },
      });

      expect(logoutResponse.status()).toBe(200);
      await expect(logoutResponse.json()).resolves.toEqual({
        data: {
          loggedOut: true,
        },
      });

      const setCookie = logoutResponse.headers()["set-cookie"];
      expect(setCookie).toContain("biker-map-refresh-token=");
      expect(setCookie).toContain("Max-Age=0");
      expect(setCookie).toContain("HttpOnly");
    } finally {
      await deleteAuthUser(createdUserId);
    }
  });

  test("웹 로그인 응답은 refresh token을 body에 노출하지 않고 쿠키로만 전달한다", async ({
    request,
  }) => {
    const fixture = createAuthFixtureAccount();
    let createdUserId: string | null = null;

    try {
      const signupResponse = await request.post(API_PATHS.auth.signup, {
        data: fixture,
      });
      expect(signupResponse.status()).toBe(201);
      const signupBody =
        (await signupResponse.json()) as ApiResponse<AuthResponseData>;

      createdUserId = signupBody.data.session?.userId ?? null;
      expect(signupBody.data.accessToken).toEqual(expect.any(String));
      expect(signupBody.data.refreshToken).toBeNull();
      expect(signupResponse.headers()["set-cookie"]).toContain(
        "biker-map-refresh-token="
      );

      const loginResponse = await request.post(API_PATHS.auth.login, {
        data: {
          email: fixture.email,
          password: fixture.password,
        },
      });

      expect(loginResponse.status()).toBe(200);
      const loginBody =
        (await loginResponse.json()) as ApiResponse<AuthResponseData>;

      expect(loginBody.data).toEqual({
        session: expect.objectContaining({
          email: fixture.email,
          name: fixture.name,
          userId: createdUserId,
        }),
        accessToken: expect.any(String),
        refreshToken: null,
      });
      expect(loginResponse.headers()["set-cookie"]).toContain(
        "biker-map-refresh-token="
      );
      expect(JSON.stringify(loginBody)).not.toContain("refresh_token");
    } finally {
      await deleteAuthUser(createdUserId);
    }
  });

  test("탈퇴 처리된 profile은 login과 refresh를 거부한다", async ({
    request,
  }) => {
    const fixture = createAuthFixtureAccount();
    let createdUserId: string | null = null;

    try {
      const signupResponse = await request.post(API_PATHS.auth.signup, {
        headers: mobileHeaders(),
        data: fixture,
      });
      expect(signupResponse.status()).toBe(201);
      const signupBody =
        (await signupResponse.json()) as ApiResponse<AuthResponseData>;

      createdUserId = signupBody.data.session?.userId ?? null;
      expect(createdUserId).toBeTruthy();
      await markAuthUserProfileDeleted(createdUserId ?? "");

      const loginResponse = await request.post(API_PATHS.auth.login, {
        headers: mobileHeaders(),
        data: {
          email: fixture.email,
          password: fixture.password,
        },
      });

      expect(loginResponse.status()).toBe(403);
      await expect(loginResponse.json()).resolves.toEqual({
        code: "FORBIDDEN",
        message:
          "탈퇴 처리된 계정입니다. 복구가 필요하면 관리자에게 문의해 주세요.",
      } satisfies ApiError);
      expect(loginResponse.headers()["set-cookie"]).toContain(
        "biker-map-refresh-token="
      );
      expect(loginResponse.headers()["set-cookie"]).toContain("Max-Age=0");

      const refreshResponse = await request.post(API_PATHS.auth.refresh, {
        headers: {
          ...mobileHeaders(),
          "X-Refresh-Token": signupBody.data.refreshToken ?? "",
        },
      });

      expect(refreshResponse.status()).toBe(403);
      await expect(refreshResponse.json()).resolves.toEqual({
        code: "FORBIDDEN",
        message: "탈퇴 처리된 계정입니다. 더 이상 세션을 갱신할 수 없습니다.",
      } satisfies ApiError);
      expect(refreshResponse.headers()["set-cookie"]).toContain(
        "biker-map-refresh-token="
      );
      expect(refreshResponse.headers()["set-cookie"]).toContain("Max-Age=0");
    } finally {
      await deleteAuthUser(createdUserId);
    }
  });
});

function mobileHeaders() {
  return {
    "X-Client-Platform": "mobile",
  };
}
