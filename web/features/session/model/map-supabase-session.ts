import type { Session } from "@supabase/supabase-js";
import type { AppSession } from "@package-shared/types/session";

export function mapSupabaseSession(session: Session | null): AppSession | null {
  const user = session?.user;
  if (!user) {
    return null;
  }

  const metadataDisplayName =
    typeof user.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : typeof user.user_metadata?.name === "string"
        ? user.user_metadata.name
        : null;

  const emailDisplayName = user.email?.split("@")[0]?.trim() ?? null;

  return {
    userId: user.id,
    displayName: metadataDisplayName || emailDisplayName || "라이더",
    email: user.email
  };
}
