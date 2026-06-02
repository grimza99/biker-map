import { expect, test } from "@playwright/test";

test.describe("회원가입 API 입력 검증", () => {
  test("잘못된 회원가입 API payload는 400과 검증 에러를 반환한다", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/signup", {
      data: {
        email: "not-an-email",
        password: "123",
        name: "",
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        message: "회원가입 정보가 올바르지 않습니다.",
      })
    );
  });
});
