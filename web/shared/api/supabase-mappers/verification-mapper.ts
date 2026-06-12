import { ISendVerificationCodeResponseData } from "@biker-map/package-shared";

/**
 *
 * @returns MeResponseData 객체
 */
export function mapVerification({
  phone,
  expiresAt,
}: ISendVerificationCodeResponseData): ISendVerificationCodeResponseData {
  return {
    phone,
    expiresAt,
  };
}
