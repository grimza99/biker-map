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
import { IVerificationCodeCheckBody } from "@package-shared/index";
import z from "zod";

const checkCodeSchema = z.object({
  phone: z.string().min(8),
  code: z.string().min(1),
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
  const supabase = createSupabaseApiClient(request);

  const { data, error } = await supabase
    .from("sms_verifications")
    .select("id, otp_code, expires_at,phone_number,created_at")
    .eq("user_id", session.user.id)
    .eq("phone_number", payload.phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return internalServerError(error.message);
  }

  if (data?.otp_code !== payload.code) {
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
    .update({ is_verified: true })
    .eq("id", data.id)
    .eq("phone_number", payload.phone)
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
      verifiedData?.is_verified || false
    )
  );
}
