import { ok, unauthorized } from "@shared/api";
import { getSupabaseAuthSession, toMeResponseData } from "@shared/api/auth";

export async function GET(request: Request) {
  const session = await getSupabaseAuthSession(request);
  if (!session) {
    return unauthorized();
  }
  return ok(toMeResponseData(session));
}
