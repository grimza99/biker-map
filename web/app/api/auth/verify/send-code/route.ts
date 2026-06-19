import {
  badRequest,
  createSupabaseApiClient,
  internalServerError,
  ok,
  parseRequestBody,
  unauthorized,
} from "@shared/api";
import { getSupabaseAuthSession } from "@/shared/api/auth";
import { mapVerification } from "@/shared/api/supabase-mappers";
import { getProfileStatus } from "@/shared/api/supabase-profiles";
import { ISendVerificationCodeBody } from "@package-shared/index";
import z from "zod";

const sendCodeSMSSchema = z.object({
  phone: z.string().min(8),
});
//todo : 현재는 문자를 보내지는 않고 테이블에 하드코딩된 OTP code("0000"), phone, expires_at insert

export async function POST(request: Request) {
  const session = await getSupabaseAuthSession(request);
  if (!session) {
    return unauthorized();
  }

  let payload: ISendVerificationCodeBody;
  try {
    payload = await parseRequestBody(request, sendCodeSMSSchema);
  } catch {
    return badRequest("핸드폰 번호가 올바르지 않습니다.");
  }
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();

  const supabase = createSupabaseApiClient(request);

  let profileStatus = null;
  try {
    profileStatus = await getProfileStatus(session.user.id);
  } catch {
    return unauthorized();
  }

  if (profileStatus?.deletedAt) {
    return unauthorized("탈퇴 처리된 계정입니다.");
  }

  const { data, error } = await supabase
    .from("sms_verifications")
    .insert({
      user_id: session.user.id,
      phone_number: payload.phone,
      otp_code: "0000",
      is_verified: false,
      expires_at: expiresAt,
    })
    .select("id, expires_at, phone_number")
    .single();

  if (error) {
    return internalServerError(error.message);
  }

  return ok(
    mapVerification({ phone: data.phone_number, expiresAt: data.expires_at })
  );
}
