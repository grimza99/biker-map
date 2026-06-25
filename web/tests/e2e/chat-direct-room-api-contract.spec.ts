import { expect, test } from "@playwright/test";

import {
  API_PATHS,
  type ApiResponse,
  type AuthResponseData,
  type TEnsureDirectChatRoomResponseData,
} from "@package-shared/index";

import {
  createAuthFixtureAccount,
  deleteAuthUser,
  hasLocalSupabaseEnv,
  listDirectChatRoomIdsForUsers,
} from "./support/supabase-local";

test.describe("모바일 direct room API 계약", () => {
  test.skip(
    !hasLocalSupabaseEnv(),
    "Supabase local service role 환경에서만 실행합니다."
  );

  test("동일 두 유저가 동시에 채팅을 시작해도 direct room은 하나만 생성된다", async ({
    request,
  }) => {
    const riderA = createAuthFixtureAccount();
    const riderB = createAuthFixtureAccount();
    let riderAUserId: string | null = null;
    let riderBUserId: string | null = null;

    try {
      const [signupAResponse, signupBResponse] = await Promise.all([
        request.post(API_PATHS.auth.signup, {
          headers: mobileHeaders(),
          data: riderA,
        }),
        request.post(API_PATHS.auth.signup, {
          headers: mobileHeaders(),
          data: riderB,
        }),
      ]);

      expect(signupAResponse.status()).toBe(201);
      expect(signupBResponse.status()).toBe(201);

      const signupABody =
        (await signupAResponse.json()) as ApiResponse<AuthResponseData>;
      const signupBBody =
        (await signupBResponse.json()) as ApiResponse<AuthResponseData>;

      riderAUserId = signupABody.data.session?.userId ?? null;
      riderBUserId = signupBBody.data.session?.userId ?? null;

      expect(riderAUserId).toEqual(expect.any(String));
      expect(riderBUserId).toEqual(expect.any(String));

      const [createFromAResponse, createFromBResponse] = await Promise.all([
        request.post(API_PATHS.bikers.ensureDirectChatRoom, {
          headers: {
            ...mobileHeaders(),
            Authorization: `Bearer ${signupABody.data.accessToken}`,
          },
          data: {
            targetUserId: riderBUserId,
          },
        }),
        request.post(API_PATHS.bikers.ensureDirectChatRoom, {
          headers: {
            ...mobileHeaders(),
            Authorization: `Bearer ${signupBBody.data.accessToken}`,
          },
          data: {
            targetUserId: riderAUserId,
          },
        }),
      ]);

      expect([200, 201]).toContain(createFromAResponse.status());
      expect([200, 201]).toContain(createFromBResponse.status());

      const createFromABody =
        (await createFromAResponse.json()) as ApiResponse<TEnsureDirectChatRoomResponseData>;
      const createFromBBody =
        (await createFromBResponse.json()) as ApiResponse<TEnsureDirectChatRoomResponseData>;

      expect(createFromABody.data.room.kind).toBe("direct");
      expect(createFromBBody.data.room.kind).toBe("direct");
      expect(createFromABody.data.room.id).toBe(createFromBBody.data.room.id);

      const createdFlags = [
        createFromABody.data.created,
        createFromBBody.data.created,
      ].filter(Boolean);
      expect(createdFlags).toHaveLength(1);

      const directRoomIds = await listDirectChatRoomIdsForUsers([
        riderAUserId ?? "",
        riderBUserId ?? "",
      ]);

      expect(directRoomIds).toEqual([createFromABody.data.room.id]);
    } finally {
      await Promise.all([deleteAuthUser(riderAUserId), deleteAuthUser(riderBUserId)]);
    }
  });
});

function mobileHeaders() {
  return {
    "X-Client-Platform": "mobile",
  };
}
