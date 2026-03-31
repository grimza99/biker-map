import type { AppSession } from "@package-shared/types/session";
import type { Session } from "@supabase/supabase-js";

export function mapSupabaseSession(session: Session | null): AppSession | null {
  const user = session?.user;
  if (!user) {
    return null;
  }

  const metadataName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : null;

  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  return {
    userId: user.id,
    name: metadataName || "",
    email: user.email || "",
    avatarUrl,
  };
}
