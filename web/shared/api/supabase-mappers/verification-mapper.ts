import { ISendVerificationCodeResponseData } from "@biker-map/package-shared";

export function mapVerification({
  phone,
  expiresAt,
}: ISendVerificationCodeResponseData): ISendVerificationCodeResponseData {
  return {
    phone,
    expiresAt,
  };
}
