import { mapSupabaseSession } from "@shared/lib/supabase";
import { MeResponseData } from "@package-shared/types/auth";
import { Session } from "@supabase/supabase-js";

/**
 *
 * @param session - Supabase 인증 세션 객체를 애플리케이션의 AppSession 형태로 매핑하여 반환합니다. 세션 객체가 null인 경우, authenticated 필드는 false로 설정되고 session 필드는 null이 됩니다.
 * @returns MeResponseData 객체
 */
export function mapMe(session: Session | null): MeResponseData {
  return {
    authenticated: Boolean(session?.user),
    session: mapSupabaseSession(session ?? null),
  };
}
