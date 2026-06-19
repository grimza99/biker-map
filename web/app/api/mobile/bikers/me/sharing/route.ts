import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  DEFAULT_BIKER_REALTIME_CHANNEL,
  BIKER_LOCATION_SHARING_STATUSES,
  BIKER_PRESENCE_STALE_TIMEOUT_SECONDS,
  TUpdateMyBikerSharingBody,
  TUpdateMyBikerSharingResponseData,
  TBikerPresenceLeaveEvent,
} from "@package-shared/index";
import {
  badRequest,
  createSupabaseApiClient,
  internalServerError,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import { createSupabaseServiceClient } from "@shared/lib/supabase";

const updateMyBikerSharingSchema = z.object({
  sharingStatus: z.enum(BIKER_LOCATION_SHARING_STATUSES),
  sharingSessionId: z.string().uuid().nullable().optional(),
  sharingSessionVersion: z.number().int().positive().nullable().optional(),
}) satisfies z.ZodType<TUpdateMyBikerSharingBody>;

type BikerPresenceSharingRow = {
  expires_at: string;
};

type BikerSharingSessionRow = {
  session_id: string;
  user_id: string;
  session_version: number;
  status: "active" | "ended";
  started_at: string;
  ended_at: string | null;
  guard_expires_at: string | null;
};

const SHARING_SESSION_GUARD_WINDOW_MS =
  (BIKER_PRESENCE_STALE_TIMEOUT_SECONDS + 10) * 1000;

/*------------------------------ post (update my sharing status) ---------------------------------------*/

export async function POST(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: TUpdateMyBikerSharingBody;
  try {
    payload = await parseRequestBody(request, updateMyBikerSharingSchema);
  } catch {
    return badRequest("위치 공유 상태 payload가 올바르지 않습니다.");
  }

  const supabase = createSupabaseApiClient(request);
  await cleanupExpiredEndedSharingSessions();

  const activeSession = await loadActiveSharingSession(supabase, session.userId);
  if (activeSession instanceof Response) {
    return activeSession;
  }

  if (payload.sharingStatus === "off") {
    if (!payload.sharingSessionId || !payload.sharingSessionVersion) {
      return badRequest("sharing off 요청에는 session id와 version이 필요합니다.");
    }

    const offRequestedAt = new Date();
    const guardExpiresAt = new Date(
      offRequestedAt.getTime() + SHARING_SESSION_GUARD_WINDOW_MS
    );

    const { data: endedRows, error: updateSessionError } = await supabase
      .from("biker_sharing_session")
      .update({
        status: "ended",
        ended_at: offRequestedAt.toISOString(),
        guard_expires_at: guardExpiresAt.toISOString(),
      })
      .eq("session_id", payload.sharingSessionId)
      .eq("user_id", session.userId)
      .eq("session_version", payload.sharingSessionVersion)
      .eq("status", "active")
      .select("session_id");

    if (updateSessionError) {
      return internalServerError(updateSessionError.message);
    }

    if ((endedRows ?? []).length > 0) {
      const { error: deletePresenceError } = await supabase
        .from("biker_presence")
        .delete()
        .eq("user_id", session.userId);

      if (deletePresenceError) {
        return internalServerError(deletePresenceError.message);
      }

      await broadcastBikerPresenceLeave(
        session.userId,
        offRequestedAt.toISOString()
      );
    }

    if (
      activeSession &&
      activeSession.session_id !== payload.sharingSessionId &&
      activeSession.status === "active"
    ) {
      let expiresAt: string | null;
      try {
        expiresAt = await loadCurrentPresenceExpiresAt(supabase, session.userId);
      } catch (error) {
        return internalServerError(
          error instanceof Error
            ? error.message
            : "현재 위치 공유 상태를 조회할 수 없습니다."
        );
      }

      return ok({
        sharingStatus: "foreground",
        sharingSessionId: activeSession.session_id,
        sharingSessionVersion: activeSession.session_version,
        expiresAt,
      } satisfies TUpdateMyBikerSharingResponseData);
    }

    return ok({
      sharingStatus: "off",
      sharingSessionId: null,
      sharingSessionVersion: null,
      expiresAt: null,
    } satisfies TUpdateMyBikerSharingResponseData);
  }

  if (activeSession?.status === "active") {
    let expiresAt: string | null;
    try {
      expiresAt = await loadCurrentPresenceExpiresAt(supabase, session.userId);
    } catch (error) {
      return internalServerError(
        error instanceof Error
          ? error.message
          : "현재 위치 공유 상태를 조회할 수 없습니다."
      );
    }

    return ok({
      sharingStatus: payload.sharingStatus,
      sharingSessionId: activeSession.session_id,
      sharingSessionVersion: activeSession.session_version,
      expiresAt,
    } satisfies TUpdateMyBikerSharingResponseData);
  }

  const createdSession = await createActiveSharingSession(supabase, session.userId);
  if (createdSession instanceof Response) {
    return createdSession;
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("biker_presence")
    .select("expires_at")
    .eq("user_id", session.userId)
    .gt("expires_at", nowIso)
    .maybeSingle<BikerPresenceSharingRow>();

  if (error) {
    return internalServerError(error.message);
  }

  return ok({
    sharingStatus: payload.sharingStatus,
    sharingSessionId: createdSession.session_id,
    sharingSessionVersion: createdSession.session_version,
    expiresAt: data?.expires_at ?? null,
  } satisfies TUpdateMyBikerSharingResponseData);
}

async function broadcastBikerPresenceLeave(userId: string, expiresAt: string) {
  const event: TBikerPresenceLeaveEvent = {
    type: "biker:presence-leave",
    userId,
    expiresAt,
  };

  try {
    await sendBikerRealtimeBroadcast(event.type, event);
  } catch (error) {
    console.error(
      "[mobile/bikers/me/sharing] presence-leave broadcast failed",
      {
        userId,
        error,
      }
    );
  }
}

async function sendBikerRealtimeBroadcast(
  event: TBikerPresenceLeaveEvent["type"],
  payload: TBikerPresenceLeaveEvent
) {
  const supabase = createSupabaseServiceClient();
  const channel = supabase.channel(DEFAULT_BIKER_REALTIME_CHANNEL);

  try {
    const result = await channel.send({
      type: "broadcast",
      event,
      payload,
    });

    if (result !== "ok") {
      throw new Error(`broadcast send failed: ${result}`);
    }
  } finally {
    await supabase.removeChannel(channel);
  }
}

async function createActiveSharingSession(
  supabase: ReturnType<typeof createSupabaseApiClient>,
  userId: string
) {
  const { data, error } = await supabase
    .from("biker_sharing_session")
    .insert({
      user_id: userId,
      status: "active",
      ended_at: null,
      guard_expires_at: null,
    })
    .select(
      "session_id, user_id, session_version, status, started_at, ended_at, guard_expires_at"
    )
    .single<BikerSharingSessionRow>();

  if (!error) {
    return data;
  }

  if (error.code !== "23505") {
    return internalServerError(error.message);
  }

  const { data: activeSession, error: activeSessionError } = await supabase
    .from("biker_sharing_session")
    .select(
      "session_id, user_id, session_version, status, started_at, ended_at, guard_expires_at"
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("session_version", { ascending: false })
    .limit(1)
    .maybeSingle<BikerSharingSessionRow>();

  if (activeSessionError) {
    return internalServerError(activeSessionError.message);
  }

  if (!activeSession) {
    return internalServerError("active sharing session을 생성할 수 없습니다.");
  }

  return activeSession;
}

async function loadActiveSharingSession(
  supabase: ReturnType<typeof createSupabaseApiClient>,
  userId: string
) {
  const { data, error } = await supabase
    .from("biker_sharing_session")
    .select(
      "session_id, user_id, session_version, status, started_at, ended_at, guard_expires_at"
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .order("session_version", { ascending: false })
    .limit(1)
    .maybeSingle<BikerSharingSessionRow>();

  if (error) {
    return internalServerError(error.message);
  }

  return data ?? null;
}

async function loadCurrentPresenceExpiresAt(
  supabase: ReturnType<typeof createSupabaseApiClient>,
  userId: string
) {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("biker_presence")
    .select("expires_at")
    .eq("user_id", userId)
    .gt("expires_at", nowIso)
    .maybeSingle<BikerPresenceSharingRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data?.expires_at ?? null;
}

async function cleanupExpiredEndedSharingSessions() {
  const supabase = createSupabaseServiceClient();
  const nowIso = new Date().toISOString();
  const { error } = await supabase
    .from("biker_sharing_session")
    .delete()
    .eq("status", "ended")
    .lte("guard_expires_at", nowIso);

  if (error) {
    console.error(
      "[mobile/bikers/me/sharing] ended sharing session cleanup failed",
      {
        error,
      }
    );
  }
}
