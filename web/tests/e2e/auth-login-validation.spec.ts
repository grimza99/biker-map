import { expect, test } from "@playwright/test";

test.describe("로그인 입력 검증", () => {
  test("잘못된 로그인 입력은 Supabase 계정 없이 인증 페이지에 머무른다", async ({
    page,
  }) => {
    await page.goto("/auth");

    await expect(
      page.getByRole("heading", { name: "바이커맵 로그인" })
    ).toBeVisible();

    const emailInput = page.getByLabel("이메일");
    const passwordInput = page.getByLabel("비밀번호");
    const loginButton = page.getByRole("button", { name: "로그인" });

    await expect(loginButton).toBeDisabled();

    await emailInput.fill("rider@example.com");
    await passwordInput.fill("short");

    await expect(
      page.getByText("비밀번호는 8자 이상이어야 합니다.")
    ).toBeVisible();
    await expect(loginButton).toBeDisabled();

    await emailInput.evaluate((input) => {
      input.closest("form")?.requestSubmit();
    });

    await expect(page).toHaveURL(/\/auth$/);
    await expect(
      page.getByRole("heading", { name: "바이커맵 로그인" })
    ).toBeVisible();
    await expect(
      page.getByText("비밀번호는 8자 이상이어야 합니다.")
    ).toBeVisible();
    await expect(loginButton).toBeDisabled();
  });
});
