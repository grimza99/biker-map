import { loginSchema, signUpSchema } from "@package-shared/index";

export const loginFormSchema = loginSchema;

export const signUpFormSchema = signUpSchema;
export type AuthTabValue = "login" | "signup";
