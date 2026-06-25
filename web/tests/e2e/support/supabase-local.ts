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

export async function listDirectChatRoomIdsForUsers(
  userIds: [string, string]
) {
  const supabase = createLocalSupabaseAdminClient();
  const { data: memberships, error: membershipError } = await supabase
    .from("chat_room_participants")
    .select("room_id, user_id")
    .in("user_id", userIds);

  if (membershipError) {
    throw new Error(`direct room membership 조회 실패: ${membershipError.message}`);
  }

  const candidateRoomIds = Array.from(
    new Set((memberships ?? []).map((membership) => membership.room_id))
  );

  if (!candidateRoomIds.length) {
    return [];
  }

  const { data: roomRows, error: roomError } = await supabase
    .from("chat_rooms")
    .select("id, kind")
    .in("id", candidateRoomIds)
    .eq("kind", "direct");

  if (roomError) {
    throw new Error(`direct room 조회 실패: ${roomError.message}`);
  }

  const directRoomIds = new Set((roomRows ?? []).map((room) => room.id));
  const membershipMap = new Map<string, string[]>();

  for (const membership of memberships ?? []) {
    if (!directRoomIds.has(membership.room_id)) {
      continue;
    }

    const current = membershipMap.get(membership.room_id) ?? [];
    current.push(membership.user_id);
    membershipMap.set(membership.room_id, current);
  }

  const expectedUserIds = [...userIds].sort();
  const { data: allParticipants, error: allParticipantsError } = await supabase
    .from("chat_room_participants")
    .select("room_id, user_id")
    .in("room_id", Array.from(directRoomIds));

  if (allParticipantsError) {
    throw new Error(
      `direct room 전체 participant 조회 실패: ${allParticipantsError.message}`
    );
  }

  const roomParticipantCountMap = new Map<string, number>();
  for (const participant of allParticipants ?? []) {
    roomParticipantCountMap.set(
      participant.room_id,
      (roomParticipantCountMap.get(participant.room_id) ?? 0) + 1
    );
  }

  return Array.from(membershipMap.entries())
    .filter(([roomId, participantIds]) => {
      const sortedParticipantIds = [...participantIds].sort();

      return (
        roomParticipantCountMap.get(roomId) === expectedUserIds.length &&
        sortedParticipantIds.length === expectedUserIds.length &&
        sortedParticipantIds.every(
          (participantId, index) => participantId === expectedUserIds[index]
        )
      );
    })
    .map(([roomId]) => roomId)
    .sort();
}

export async function deleteChatRooms(roomIds: string[]) {
  const dedupedRoomIds = Array.from(new Set(roomIds.filter(Boolean)));
  if (!dedupedRoomIds.length) {
    return;
  }

  const supabase = createLocalSupabaseAdminClient();
  const { error } = await supabase.from("chat_rooms").delete().in("id", dedupedRoomIds);

  if (error) {
    throw new Error(`테스트 chat room 삭제 실패: ${error.message}`);
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
