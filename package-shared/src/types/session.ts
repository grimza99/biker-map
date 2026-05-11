export type AppSession = {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
};

export type InitialSessionData = {
  session: AppSession | null;
  accessToken: string | null;
};
