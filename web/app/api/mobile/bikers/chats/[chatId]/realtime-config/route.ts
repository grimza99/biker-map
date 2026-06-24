import type { NextRequest } from "next/server";

import type { TChatRealtimeConfigResponseData } from "@package-shared/index";
import {
  createSupabaseApiClient,
  internalServerError,
  notFound,
  ok,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { buildChatRealtimeConfig, loadChatRoomOrNull } from "@shared/api/chat";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);

  try {
    const loaded = await loadChatRoomOrNull(supabase, chatId);
    if (!loaded || !loaded.participantUserIds.includes(session.userId)) {
      return notFound("채팅방을 찾을 수 없습니다.");
    }

    return ok(buildChatRealtimeConfig(chatId) satisfies TChatRealtimeConfigResponseData);
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "채팅 realtime 설정을 조회할 수 없습니다."
    );
  }
}
