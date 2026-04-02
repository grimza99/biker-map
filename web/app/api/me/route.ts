import { getSupabaseAuthSession, mapMe, ok, unauthorized } from "@shared/api";

export async function GET(request: Request) {
  const session = await getSupabaseAuthSession(request);
  if (!session) {
    return unauthorized();
  }
  return ok(mapMe(session));
}
