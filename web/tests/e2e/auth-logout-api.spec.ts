import { expect, test } from "@playwright/test";

test.describe("로그아웃 API 응답 계약", () => {
  test("로그아웃 API는 refresh token 쿠키를 비우고 성공 응답을 반환한다", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/logout");

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        data: {
          loggedOut: true,
        },
      })
    );

    const setCookie = response.headers()["set-cookie"];

    expect(setCookie).toContain("biker-map-refresh-token=");
    expect(setCookie).toContain("Max-Age=0");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
  });
});
