import { cookies } from "next/headers";
import type { AppSession } from "@package-shared/types/session";

import { createSupabaseServerClient, mapSupabaseSession } from "@shared/lib";

export async function getInitialSession(): Promise<AppSession | null> {
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

  return mapSupabaseSession(session);
}
