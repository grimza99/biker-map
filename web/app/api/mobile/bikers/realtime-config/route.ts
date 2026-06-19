import type { NextRequest } from "next/server";

import {
  DEFAULT_BIKER_REALTIME_CHANNEL,
  DEFAULT_BIKER_REALTIME_FEATURE,
  DEFAULT_BIKER_REALTIME_MODE,
  TBikerRealtimeConfigResponseData,
} from "@package-shared/index";

import { ok } from "@shared/api";
import { requireApiSession } from "@shared/api/auth";

/*------------------------------ get (biker realtime config) ---------------------------------------*/

export async function GET(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  return ok({
    mode: DEFAULT_BIKER_REALTIME_MODE,
    feature: DEFAULT_BIKER_REALTIME_FEATURE,
    channel: DEFAULT_BIKER_REALTIME_CHANNEL,
    url: undefined,
  } satisfies TBikerRealtimeConfigResponseData);
}
