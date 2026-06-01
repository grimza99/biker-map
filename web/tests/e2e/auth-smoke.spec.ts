import { expect, test } from "@playwright/test";

test.describe("인증 기본 동작", () => {
  test("인증 화면을 렌더링후 잘못된 로그인 API payload는 거부한다", async ({
    page,
    request,
  }) => {
    await page.goto("/auth");

    await expect(
      page.getByRole("heading", { name: "바이커맵 로그인" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "로그인" })).toBeDisabled();

    const response = await request.post("/api/auth/login", {
      data: {
        email: "not-an-email",
        password: "123",
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
      })
    );
  });
});
