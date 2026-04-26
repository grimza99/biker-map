import { cookies } from "next/headers";
import type { InitialSessionData } from "@package-shared/types/session";

import { createSupabaseServerClient, mapSupabaseSession } from "@shared/lib/supabase";

export async function getInitialSession(): Promise<InitialSessionData> {
  const cookieStore = await cookies();

  const supabase = createSupabaseServerClient({
    getAll() {
      return cookieStore.getAll();
    },
    setAll() {
      // Server Components should not mutate cookies directly.
    }
  });

  const {
    data: { session }
  } = await supabase.auth.getSession();

  return {
    session: mapSupabaseSession(session),
    accessToken: session?.access_token ?? null,
  };
}
