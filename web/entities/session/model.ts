export type AppSession = {
  userId: string;
  displayName: string;
  email?: string;
};

export const SESSION_STORAGE_KEY = "biker-map.session";
