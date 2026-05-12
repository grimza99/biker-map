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
};

export type AuthResponseData = {
  session: AppSession | null;
  accessToken: string | null;
};

export type LogoutResponseData = {
  loggedOut: true;
};

export type RefreshResponseData = {
  refreshed: boolean;
  accessToken: string | null;
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
