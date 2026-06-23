import type { NextRequest } from "next/server";

import {
  DEFAULT_BIKER_REALTIME_CHANNEL,
  type TBikerPresenceLeaveEvent,
} from "@package-shared/index";

import {
  internalServerError,
  ok,
  unauthorized,
} from "@shared/api";
import { createSupabaseServiceClient } from "@shared/lib/supabase";

type ExpiredPresenceRow = {
  user_id: string;
  expires_at: string;
};

type CleanupStaleBikerPresenceResponseData = {
  cleanedAt: string;
  deletedCount: number;
  userIds: string[];
};

export const dynamic = "force-dynamic";

/*------------------------------ get/post (cleanup stale biker presence) ---------------------------------------*/

export async function GET(request: NextRequest) {
  return handleCleanupRequest(request);
}

export async function POST(request: NextRequest) {
  return handleCleanupRequest(request);
}

async function handleCleanupRequest(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    return internalServerError("CRON_SECRET 환경변수가 설정되어 있지 않습니다.");
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${expectedSecret}`) {
    return unauthorized("internal cron secret이 올바르지 않습니다.");
  }

  const cleanedAt = new Date().toISOString();
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("biker_presence")
    .delete()
    .lte("expires_at", cleanedAt)
    .select("user_id, expires_at");

  if (error) {
    return internalServerError(error.message);
  }

  const deletedRows = (data ?? []) as ExpiredPresenceRow[];

  await Promise.all(
    deletedRows.map((row) => broadcastBikerPresenceLeave(row))
  );

  return ok({
    cleanedAt,
    deletedCount: deletedRows.length,
    userIds: deletedRows.map((row) => row.user_id),
  } satisfies CleanupStaleBikerPresenceResponseData);
}

async function broadcastBikerPresenceLeave(row: ExpiredPresenceRow) {
  const event: TBikerPresenceLeaveEvent = {
    type: "biker:presence-leave",
    userId: row.user_id,
    expiresAt: row.expires_at,
  };

  try {
    await sendBikerRealtimeBroadcast(event.type, event);
  } catch (error) {
    console.error(
      "[internal/mobile/bikers/cleanup-stale] presence-leave broadcast failed",
      {
        userId: row.user_id,
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
