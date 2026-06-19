import { ok } from "@shared/api";

export function GET() {
  return ok({
    mode: "supabase-realtime" as const,
    feature: "notifications" as const,
    channel: "notifications",
    url: undefined
  });
}
