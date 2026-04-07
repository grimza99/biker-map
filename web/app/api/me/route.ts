import { mapMe, ok, unauthorized } from "@shared/api";
import { getSupabaseAuthSession } from "@shared/api/auth";

export async function GET(request: Request) {
  const session = await getSupabaseAuthSession(request);
  if (!session) {
    return unauthorized();
  }
  return ok(mapMe(session));
}
