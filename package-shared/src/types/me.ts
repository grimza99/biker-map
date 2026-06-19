import { AppSession } from "./session";

/** --------------------------------proficiency --------------------------------*/
export type Tproficiency = "beginner" | "intermediate" | "advanced";

/** --------------------------------update me --------------------------------*/
export type UpdateMeBody = {
  name: string;
  avatarUrl: string | null;
  bikeBrand: string | null;
  bikeModel: string | null;
  proficiency: Tproficiency | null;
};
export type MeResponseData = {
  authenticated: boolean;
  session: AppSession | null;
};

export type UpdateMeResponseData = {
  session: AppSession | null;
};
