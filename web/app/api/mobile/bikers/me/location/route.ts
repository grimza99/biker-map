import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  BIKER_LOCATION_SHARING_STATUSES,
  BIKER_PRESENCE_STALE_TIMEOUT_SECONDS,
  DEFAULT_BIKER_REALTIME_CHANNEL,
  TBikerPresenceItem,
  TBikerPresenceSyncEvent,
  TMyBikerLocationResponseData,
  Tproficiency,
  TUpdateMyBikerLocationBody,
  TUpdateMyBikerLocationResponseData,
} from "@package-shared/index";
import {
  badRequest,
  createSupabaseApiClient,
  internalServerError,
  ok,
  parseRequestBody,
} from "@shared/api";
import { requireVerifiedApiSession } from "@shared/api/auth";
import { createSupabaseServiceClient } from "@shared/lib/supabase";

const updateMyBikerLocationSchema = z.object({
  sharingSessionId: z.string().uuid(),
  sharingSessionVersion: z.number().int().positive(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  accuracyMeters: z.number().min(0).nullable().optional(),
  heading: z.number().min(0).lt(360).nullable().optional(),
  observedAt: z.string().datetime().optional(),
  speedKph: z.number().min(0).nullable().optional(),
}) satisfies z.ZodType<TUpdateMyBikerLocationBody>;

type BikerPresenceRow = {
  user_id: string;
  lat: number;
  lng: number;
  accuracy_meters: number | null;
  heading: number | null;
  speed_kph: number | null;
  expires_at: string;
  updated_at: string;
};

type BikerProfileRow = {
  id: string;
  name: string | null;
  bike_brand: string | null;
  bike_model: string | null;
  proficiency: Tproficiency | null;
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

const MAX_BIKER_OBSERVED_AT_FUTURE_SKEW_MS = 5000;

/*------------------------------ get (my active biker presence) ---------------------------------------*/

export async function GET(request: NextRequest) {
  const session = await requireVerifiedApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const supabase = createSupabaseApiClient(request);
  let profile: BikerProfileRow | null;
  try {
    profile = await loadBikerProfile(supabase, session.userId);
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "바이커 프로필을 조회할 수 없습니다."
    );
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("biker_presence")
    .select(
      "user_id, lat, lng, accuracy_meters, heading, speed_kph, expires_at, updated_at"
    )
    .eq("user_id", session.userId)
    .gt("expires_at", nowIso)
    .maybeSingle<BikerPresenceRow>();

  if (error) {
    return internalServerError(error.message);
  }

  return ok({
    presence: data ? mapPresenceRow(data, profile, true) : null,
  } satisfies TMyBikerLocationResponseData);
}

/*------------------------------ post (upsert my active biker presence) ---------------------------------------*/

export async function POST(request: NextRequest) {
  const session = await requireVerifiedApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  let payload: TUpdateMyBikerLocationBody;
  try {
    payload = await parseRequestBody(request, updateMyBikerLocationSchema);
  } catch {
    return badRequest("위치 공유 payload가 올바르지 않습니다.");
  }

  const observedAt = new Date();
  const now = new Date();

  if (
    now.getTime() - observedAt.getTime() >
    BIKER_PRESENCE_STALE_TIMEOUT_SECONDS * 1000
  ) {
    return badRequest("너무 오래된 위치 정보는 업로드할 수 없습니다.");
  }

  if (
    observedAt.getTime() - now.getTime() >
    MAX_BIKER_OBSERVED_AT_FUTURE_SKEW_MS
  ) {
    return badRequest("미래 시각의 위치 정보는 업로드할 수 없습니다.");
  }

  const supabase = createSupabaseApiClient(request);
  await cleanupExpiredEndedSharingSessions();

  let sharingSession: BikerSharingSessionRow | null;
  try {
    sharingSession = await loadBikerSharingSession(
      supabase,
      session.userId,
      payload.sharingSessionId,
      payload.sharingSessionVersion
    );
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "위치 공유 세션을 조회할 수 없습니다."
    );
  }

  if (!sharingSession) {
    return badRequest("유효한 위치 공유 세션이 없습니다.");
  }

  if (sharingSession.status !== "active" || sharingSession.ended_at) {
    return badRequest(
      "종료된 위치 공유 세션으로는 위치를 업로드할 수 없습니다."
    );
  }

  let profile: BikerProfileRow | null;
  try {
    profile = await loadBikerProfile(supabase, session.userId);
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "바이커 프로필을 조회할 수 없습니다."
    );
  }

  const expiresAt = new Date(
    observedAt.getTime() + BIKER_PRESENCE_STALE_TIMEOUT_SECONDS * 1000
  );

  const { data, error } = await supabase
    .from("biker_presence")
    .upsert(
      {
        user_id: session.userId,
        lat: payload.location.lat,
        lng: payload.location.lng,
        accuracy_meters: payload.accuracyMeters ?? null,
        heading: payload.heading ?? null,
        speed_kph: payload.speedKph ?? null,
        observed_at: observedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      },
      {
        onConflict: "user_id",
      }
    )
    .select(
      "user_id, lat, lng, accuracy_meters, heading, speed_kph, expires_at, updated_at"
    )
    .single<BikerPresenceRow>();

  if (error) {
    return internalServerError(error.message);
  }

  const presence = mapPresenceRow(data, profile, true);
  await broadcastBikerPresenceSync(presence);

  return ok({
    presence,
  } satisfies TUpdateMyBikerLocationResponseData);
}

function mapPresenceRow(
  row: BikerPresenceRow,
  profile: BikerProfileRow | null,
  isMe: boolean
): TBikerPresenceItem {
  return {
    userId: row.user_id,
    nickname: profile?.name?.trim() || "알 수 없는 라이더",
    bikeBrand: profile?.bike_brand ?? null,
    bikeModel: profile?.bike_model ?? null,
    proficiency: profile?.proficiency ?? null,
    isMe,
    location: {
      lat: row.lat,
      lng: row.lng,
    },
    accuracyMeters: row.accuracy_meters,
    heading: row.heading,
    sharingStatus: BIKER_LOCATION_SHARING_STATUSES[1],
    speedKph: row.speed_kph,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
  };
}

async function loadBikerProfile(
  supabase: ReturnType<typeof createSupabaseApiClient>,
  userId: string
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, bike_brand, bike_model ,proficiency")
    .eq("id", userId)
    .maybeSingle<BikerProfileRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

async function loadBikerSharingSession(
  supabase: ReturnType<typeof createSupabaseApiClient>,
  userId: string,
  sharingSessionId: string,
  sharingSessionVersion: number
) {
  const { data, error } = await supabase
    .from("biker_sharing_session")
    .select(
      "session_id, user_id, session_version, status, started_at, ended_at, guard_expires_at"
    )
    .eq("user_id", userId)
    .eq("session_id", sharingSessionId)
    .eq("session_version", sharingSessionVersion)
    .maybeSingle<BikerSharingSessionRow>();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
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
      "[mobile/bikers/me/location] ended sharing session cleanup failed",
      {
        error,
      }
    );
  }
}

async function broadcastBikerPresenceSync(presence: TBikerPresenceItem) {
  const event: TBikerPresenceSyncEvent = {
    type: "biker:presence-sync",
    presence,
  };

  try {
    await sendBikerRealtimeBroadcast(event.type, event);
  } catch (error) {
    console.error(
      "[mobile/bikers/me/location] presence-sync broadcast failed",
      {
        userId: presence.userId,
        error,
      }
    );
  }
}

async function sendBikerRealtimeBroadcast(
  event: TBikerPresenceSyncEvent["type"],
  payload: TBikerPresenceSyncEvent
) {
  const supabase = createSupabaseServiceClient();
  const channel = supabase.channel(DEFAULT_BIKER_REALTIME_CHANNEL);

  try {
    await channel.httpSend(event, payload);
  } finally {
    await supabase.removeChannel(channel);
  }
}
