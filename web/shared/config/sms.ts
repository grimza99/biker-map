import "server-only";

import { z } from "zod";

const smsProviderSchema = z.enum(["solapi"]);

export const smsServerEnvSchema = z.object({
  SMS_PROVIDER: smsProviderSchema.default("solapi"),
  SOLAPI_API_KEY: z.string().min(1).optional(),
  SOLAPI_API_SECRET: z.string().min(1).optional(),
  SMS_SENDER_PHONE: z.string().regex(/^\d{8,15}$/).optional(),
  SMS_VERIFICATION_HMAC_SECRET: z.string().min(32).optional(),
});

export type SmsProvider = z.infer<typeof smsProviderSchema>;
export type SmsServerEnv = {
  SMS_PROVIDER: SmsProvider;
  SOLAPI_API_KEY: string;
  SOLAPI_API_SECRET: string;
  SMS_SENDER_PHONE: string;
  SMS_VERIFICATION_HMAC_SECRET: string;
};

export function getSmsServerEnv(
  env: NodeJS.ProcessEnv = process.env
): SmsServerEnv {
  const parsed = smsServerEnvSchema.parse({
    SMS_PROVIDER: env.SMS_PROVIDER,
    SOLAPI_API_KEY: env.SOLAPI_API_KEY,
    SOLAPI_API_SECRET: env.SOLAPI_API_SECRET,
    SMS_SENDER_PHONE: env.SMS_SENDER_PHONE,
    SMS_VERIFICATION_HMAC_SECRET: env.SMS_VERIFICATION_HMAC_SECRET,
  });

  const requiredKeys = [
    "SOLAPI_API_KEY",
    "SOLAPI_API_SECRET",
    "SMS_SENDER_PHONE",
    "SMS_VERIFICATION_HMAC_SECRET",
  ] as const;

  const missingKeys = requiredKeys.filter((key) => !parsed[key]);

  if (missingKeys.length > 0) {
    throw new Error(
      `SMS 서버 환경변수가 설정되어 있지 않습니다: ${missingKeys.join(", ")}`
    );
  }

  return {
    SMS_PROVIDER: parsed.SMS_PROVIDER,
    SOLAPI_API_KEY: parsed.SOLAPI_API_KEY!,
    SOLAPI_API_SECRET: parsed.SOLAPI_API_SECRET!,
    SMS_SENDER_PHONE: parsed.SMS_SENDER_PHONE!,
    SMS_VERIFICATION_HMAC_SECRET: parsed.SMS_VERIFICATION_HMAC_SECRET!,
  };
}
