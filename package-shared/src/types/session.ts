export type AppSession = {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  bikeBrand: string | null;
  bikeModel: string | null;
  phone: string;
  isVerified: boolean;
};

export type InitialSessionData = {
  session: AppSession | null;
  accessToken: string | null;
};
