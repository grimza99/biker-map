import { expect, test } from "@playwright/test";

test.describe("회원가입 입력 검증", () => {
  test("잘못된 회원가입 입력은 Supabase 계정 생성 없이 인증 페이지에 머무른다", async ({
    page,
  }) => {
    await page.goto("/auth");

    await page.getByRole("tab", { name: "회원가입" }).click();

    await expect(
      page.getByRole("heading", { name: "바이커맵 계정 만들기" })
    ).toBeVisible();

    const nameInput = page.getByLabel("이름");
    const emailInput = page.getByLabel("이메일");
    const passwordInput = page.getByLabel("비밀번호");
    const signupButton = page.getByRole("button", { name: "회원가입" });

    await expect(signupButton).toBeDisabled();

    await emailInput.fill("rider@example.com");
    await passwordInput.fill("short");

    await expect(
      page.getByText("비밀번호는 8자 이상이어야 합니다.")
    ).toBeVisible();
    await expect(signupButton).toBeDisabled();

    await passwordInput.fill("password123");

    await expect(
      page.getByText("비밀번호는 8자 이상이어야 합니다.")
    ).toHaveCount(0);
    await expect(signupButton).toBeDisabled();

    await nameInput.fill("라이더");
    await nameInput.clear();

    await expect(page.getByText("이름을 입력해주세요.")).toBeVisible();

    await nameInput.fill("라이더");

    await expect(page.getByText("이름을 입력해주세요.")).toHaveCount(0);
    await expect(signupButton).toBeEnabled();

    await emailInput.fill("wrong-email");

    await expect(
      page.getByText("이메일 형식이 올바르지 않습니다.")
    ).toBeVisible();
    await expect(signupButton).toBeDisabled();

    await emailInput.evaluate((input) => {
      input.closest("form")?.requestSubmit();
    });

    await expect(page).toHaveURL(/\/auth$/);
    await expect(
      page.getByRole("heading", { name: "바이커맵 계정 만들기" })
    ).toBeVisible();
    await expect(
      page.getByText("이메일 형식이 올바르지 않습니다.")
    ).toBeVisible();
    await expect(signupButton).toBeDisabled();
  });
});
