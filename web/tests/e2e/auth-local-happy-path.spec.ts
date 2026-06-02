import { expect, test } from "@playwright/test";

import {
  createAuthFixtureAccount,
  deleteAuthUser,
  findAuthSessionCookieName,
  hasLocalSupabaseEnv,
} from "./support/supabase-local";

test.describe("로컬 Supabase 인증 성공 경로", () => {
  test.skip(
    !hasLocalSupabaseEnv(),
    "Supabase local service role 환경에서만 실행합니다."
  );

  test("회원가입과 로그인은 웹 세션을 만들고 로그아웃 뒤 다시 복구할 수 있다", async ({
    context,
    page,
    request,
  }) => {
    const fixture = createAuthFixtureAccount();
    let createdUserId: string | null = null;

    try {
      await page.goto("/auth");
      await page.getByRole("tab", { name: "회원가입" }).click();
      await page.getByLabel("이름").fill(fixture.name);
      await page.getByLabel("이메일").fill(fixture.email);
      await page.getByLabel("비밀번호").fill(fixture.password);

      await Promise.all([
        page.waitForURL(/\/map\?toast=signup-success$/),
        page.getByRole("button", { name: "회원가입" }).click(),
      ]);

      await expect
        .poll(async () => {
          const session = await fetchAuthSession(context);
          return session.appSession?.email ?? null;
        })
        .toBe(fixture.email);

      const signedUpSession = await fetchAuthSession(context);

      expect(signedUpSession).toEqual(
        expect.objectContaining({
          appSession: expect.objectContaining({
            email: fixture.email,
            name: fixture.name,
          }),
          accessToken: expect.any(String),
          supabaseError: null,
        })
      );

      createdUserId = signedUpSession.appSession.userId;

      expect(JSON.stringify(signedUpSession)).not.toContain("refreshToken");
      expect(JSON.stringify(signedUpSession)).not.toContain(
        "supabaseRefreshToken"
      );

      const signedUpCookies = await context.cookies();
      expect(findAuthSessionCookieName(signedUpCookies)).toBeTruthy();
      expect(
        signedUpCookies.some(
          ({ name }) => name === "biker-map-refresh-token"
        )
      ).toBe(false);

      const accessToken = signedUpSession.accessToken;
      const meResponse = await request.get("/api/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(meResponse.status()).toBe(200);
      await expect(meResponse.json()).resolves.toEqual(
        expect.objectContaining({
          data: {
            authenticated: true,
            session: expect.objectContaining({
              email: fixture.email,
              name: fixture.name,
            }),
          },
        })
      );

      await page.reload();
      await expect(page.getByRole("button", { name: "로그아웃" })).toBeVisible();

      await Promise.all([
        page.waitForURL(/\/auth\?toast=logout-success$/),
        page.getByRole("button", { name: "로그아웃" }).click(),
      ]);

      await expect
        .poll(async () => {
          const cookies = await context.cookies();
          return findAuthSessionCookieName(cookies);
        })
        .toBeNull();

      await expect(page.getByRole("heading", { name: "바이커맵 로그인" })).toBeVisible();

      await page.getByLabel("이메일").fill(fixture.email);
      await page.getByLabel("비밀번호").fill(fixture.password);

      await Promise.all([
        page.waitForURL(/\/map\?toast=login-success$/),
        page.getByRole("button", { name: "로그인" }).click(),
      ]);

      await expect
        .poll(async () => {
          const session = await fetchAuthSession(context);
          return session.appSession?.email ?? null;
        })
        .toBe(fixture.email);

      const loggedInSession = await fetchAuthSession(context);

      expect(loggedInSession).toEqual(
        expect.objectContaining({
          appSession: expect.objectContaining({
            email: fixture.email,
            name: fixture.name,
          }),
          accessToken: expect.any(String),
          supabaseError: null,
        })
      );

      expect(JSON.stringify(loggedInSession)).not.toContain("refreshToken");
      expect(JSON.stringify(loggedInSession)).not.toContain(
        "supabaseRefreshToken"
      );
    } finally {
      await deleteAuthUser(createdUserId);
    }
  });
});

async function fetchAuthSession(context: {
  request: {
    get: (url: string) => Promise<{ json: () => Promise<unknown> }>;
  };
}) {
  const response = await context.request.get("/api/auth/session");
  return (await response.json()) as {
    appSession?: {
      email?: string;
      name?: string;
      userId?: string;
    } | null;
    accessToken?: string | null;
    supabaseError?: string | null;
  };
}
