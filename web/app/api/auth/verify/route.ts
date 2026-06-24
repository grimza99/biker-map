import {
  badRequest,
  createSupabaseApiClient,
  internalServerError,
  mapMe,
  ok,
  parseRequestBody,
  unauthorized,
} from "@/shared";
import { getSupabaseAuthSession } from "@/shared/api/auth";
import { getProfileStatus } from "@/shared/api/supabase-profiles";
import { isVerificationCodeMatched } from "@/shared/lib";
import { IVerificationCodeCheckBody } from "@package-shared/index";
import z from "zod";

const checkCodeSchema = z.object({
  phone: z.string().regex(/^01\d{8,9}$/),
  code: z.string().regex(/^\d{6}$/),
});
/**----------------------------- verification code check ------------------------ */
export async function POST(request: Request) {
  const session = await getSupabaseAuthSession(request);
  if (!session) {
    return unauthorized();
  }
  let payload: IVerificationCodeCheckBody;
  try {
    payload = await parseRequestBody(request, checkCodeSchema);
  } catch {
    return badRequest("인증코드가 일치하는지 확인하세요");
  }

  const { phone } = payload;

  const supabase = createSupabaseApiClient(request);

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

  let profileStatus = null;
  try {
    profileStatus = await getProfileStatus(session.user.id);
  } catch {
    return unauthorized();
  }

  if (profileStatus?.deletedAt) {
    return unauthorized("탈퇴 처리된 계정입니다.");
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

  return ok(
    mapMe(
      session,
      profileStatus?.role || "member",
      profileStatus?.bikeBrand || null,
      profileStatus?.bikeModel || null,
      data?.phone_number || "",
      verifiedData?.is_verified || false,
      profileStatus?.proficiency || null
    )
  );
}
