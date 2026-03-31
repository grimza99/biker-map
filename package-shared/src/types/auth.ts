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
