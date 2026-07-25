import { ISendVerificationCodeBody, phoneSchema } from "@package-shared/index";

import {
  badRequest,
  internalServerError,
  mapVerification,
  ok,
  parseRequestBody,
} from "@/shared";
import { requireActiveApiSession } from "@/shared/api/auth";
import { createSupabaseServiceClient } from "@/shared/lib/supabase";
import {
  createVerificationCode,
  hashVerificationCode,
  sendVerificationSms,
} from "@/shared/lib/sms";

export async function POST(request: Request) {
  const activeSession = await requireActiveApiSession(request);
  if (activeSession instanceof Response) {
    return activeSession;
  }

  const session = activeSession.authSession;

  let payload: ISendVerificationCodeBody;
  try {
    payload = await parseRequestBody(request, phoneSchema);
  } catch {
    return badRequest("핸드폰 번호가 올바르지 않습니다.");
  }

  const expiresAt = new Date(Date.now() + 3 * 60 * 1000).toISOString();

  const supabase = createSupabaseServiceClient();

  const { data: latestVerification, error: latestVerificationError } =
    await supabase
      .from("sms_verifications")
      .select("created_at")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (latestVerificationError) {
    return internalServerError(latestVerificationError.message);
  }

  if (
    latestVerification?.created_at &&
    Date.now() - new Date(latestVerification.created_at).getTime() < 10 * 1000
  ) {
    return badRequest("인증번호는 10초 후 다시 요청할 수 있습니다.");
  }

  const verificationCode = createVerificationCode();
  let hashedCode = "";
  try {
    hashedCode = hashVerificationCode({
      userId: session.user.id,
      phone: payload.phone,
      code: verificationCode,
    });
  } catch (error) {
    console.error("SMS verification hash setup failed", error);
    return internalServerError(
      "SMS 발송 설정이 완료되지 않았습니다. 관리자에게 문의해 주세요."
    );
  }

  const { data, error } = await supabase
    .from("sms_verifications")
    .insert({
      user_id: session.user.id,
      phone_number: payload.phone,
      otp_code: hashedCode,
      provider: "solapi",
      provider_request_id: null,
      sent_at: null,
      verified_at: null,
      is_verified: false,
      expires_at: expiresAt,
    })
    .select("id, expires_at, phone_number")
    .single();

  if (error) {
    return internalServerError(error.message);
  }

  try {
    const sendResult = await sendVerificationSms({
      phone: payload.phone,
      code: verificationCode,
    });

    const { error: updateError } = await supabase
      .from("sms_verifications")
      .update({
        provider: sendResult.provider,
        provider_request_id: sendResult.requestId,
        sent_at: sendResult.sentAt,
      })
      .eq("id", data.id)
      .eq("user_id", session.user.id);

    if (updateError) {
      console.error("SMS verification metadata update failed", updateError);
    }
  } catch (error) {
    console.error("SMS verification send failed", error);
    return internalServerError(
      "인증번호 문자를 발송하지 못했습니다. 잠시 후 다시 시도해 주세요."
    );
  }

  return ok(
    mapVerification({ phone: data.phone_number, expiresAt: data.expires_at })
  );
}
