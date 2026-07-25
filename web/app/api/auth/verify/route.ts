import {
  IVerificationCodeCheckBody,
  verifyCodeSchema,
} from "@package-shared/index";

import {
  badRequest,
  internalServerError,
  ok,
  parseRequestBody,
} from "@/shared";
import { requireActiveApiSession } from "@/shared/api/auth";
import { isVerificationCodeMatched } from "@/shared/lib/sms";
import { createSupabaseServiceClient } from "@/shared/lib/supabase";

/**----------------------------- verification code check ------------------------ */
export async function POST(request: Request) {
  const activeSession = await requireActiveApiSession(request);
  if (activeSession instanceof Response) {
    return activeSession;
  }

  const session = activeSession.authSession;

  let payload: IVerificationCodeCheckBody;
  try {
    payload = await parseRequestBody(request, verifyCodeSchema);
  } catch {
    return badRequest("인증코드가 일치하는지 확인하세요");
  }

  const { phone } = payload;

  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("sms_verifications")
    .select("id, otp_code, expires_at, phone_number, created_at")
    .eq("user_id", session.user.id)
    .eq("phone_number", phone)
    .eq("is_verified", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return internalServerError(error.message);
  }

  if (!data) {
    return badRequest("먼저 인증번호를 요청해 주세요.");
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    return badRequest("인증코드가 만료되었습니다");
  }

  let isMatched = false;
  try {
    isMatched = isVerificationCodeMatched({
      userId: session.user.id,
      phone: phone,
      code: payload.code,
      hashedCode: data.otp_code,
    });
  } catch (error) {
    console.error("SMS verification hash check failed", error);
    return internalServerError(
      "SMS 인증 설정이 올바르지 않습니다. 관리자에게 문의해 주세요."
    );
  }

  if (!isMatched) {
    return badRequest("인증코드가 일치하는지 확인하세요");
  }

  const { data: verifiedData, error: verifiedError } = await supabase
    .from("sms_verifications")
    .update({ is_verified: true, verified_at: new Date().toISOString() })
    .eq("id", data.id)
    .eq("phone_number", phone)
    .select("is_verified")
    .single();

  if (verifiedError) {
    return internalServerError(verifiedError.message);
  }

  return ok({
    authenticated: true,
    session: {
      ...activeSession.appSession,
      phone: data?.phone_number || "",
      isVerified: verifiedData?.is_verified || false,
    },
  });
}
