import { RefreshResponseData } from "@package-shared/types/auth";
import { Session } from "@supabase/supabase-js";

export function mapRefreshData(
  session: Session | null,
  refreshed: boolean
): RefreshResponseData {
  return {
    refreshed,
    accessToken: session?.access_token ?? null,
  };
}
