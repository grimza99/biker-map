import type { AppSession } from "./session";

export type LoginBody = {
  email: string;
  password: string;
};

export type SignUpBody = {
  email: string;
  password: string;
  name: string;
};

export type UpdateMeBody = {
  name: string;
  avatarUrl: string | null;
  bikeBrand: string | null;
  bikeModel: string | null;
};

export type AuthResponseData = {
  session: AppSession | null;
  accessToken: string | null;
  refreshToken: string | null;
};

export type LogoutResponseData = {
  loggedOut: true;
};

export type RefreshResponseData = {
  refreshed: boolean;
  accessToken: string | null;
  refreshToken: string | null;
};

export type MeResponseData = {
  authenticated: boolean;
  session: AppSession | null;
};

export type UpdateMeResponseData = {
  session: AppSession | null;
};

export type DeleteAccountResponseData = {
  deleted: true;
  deletedAt: string;
  purgeAfter: string;
};

export type ISendVerificationCodeBody = {
  phone: string;
};
export type ISendVerificationCodeResponseData = {
  phone: string;
  expiresAt: string;
};

export type IVerificationCodeCheckBody = {
  phone: string;
  code: string;
};
export type AuthVerifyResponseData = AppSession;
