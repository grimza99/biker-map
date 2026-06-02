import { expect, test } from "@playwright/test";

test.describe("내 정보 인증 경계", () => {
  test("비로그인 상태에서 내 정보 API는 401과 안내 메시지를 반환한다", async ({
    request,
  }) => {
    const response = await request.get("/api/me");

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        code: "UNAUTHORIZED",
        message: "로그인이 필요합니다.",
      })
    );
  });
});
