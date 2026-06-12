import { createClient } from "@supabase/supabase-js";

const LOCAL_SUPABASE_API_URL = "http://127.0.0.1:54321";

export function hasLocalSupabaseEnv() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL === LOCAL_SUPABASE_API_URL &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export function createLocalSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase local service role 환경변수가 필요합니다.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createAuthFixtureAccount() {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    email: `e2e_auth_${nonce}@example.com`,
    password: `Password123!${nonce.slice(-4)}`,
    name: `E2E 라이더 ${nonce.slice(-4)}`,
  };
}

export async function deleteAuthUser(userId: string | null) {
  if (!userId) {
    return;
  }

  const supabase = createLocalSupabaseAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId, true);

  if (error) {
    throw new Error(`테스트 사용자 삭제 실패: ${error.message}`);
  }
}

export async function markAuthUserProfileDeleted(userId: string) {
  const supabase = createLocalSupabaseAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    throw new Error(`테스트 사용자 탈퇴 상태 변경 실패: ${error.message}`);
  }
}

export function findAuthSessionCookieName(
  cookies: Array<{ name: string; value?: string }>
) {
  return (
    cookies.some(
      (cookie) =>
      [
        "authjs.session-token",
        "__Secure-authjs.session-token",
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
      ].includes(cookie.name) && Boolean(cookie.value)
    ) ?? null
  );
}
