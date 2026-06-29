import { z } from "zod";
import type {
  ISendVerificationCodeBody,
  IVerificationCodeCheckBody,
  LoginBody,
  SignUpBody,
} from "../types/auth";
import { SCHEMA_ATOM } from "./schema-atom";

/**--------------------로그인, 회원가입 ------------------------ */

export const loginSchema = z.object({
  email: SCHEMA_ATOM.email,
  password: SCHEMA_ATOM.loginPassword,
}) satisfies z.ZodType<LoginBody>;

export const signUpSchema = z.object({
  email: SCHEMA_ATOM.email,
  password: SCHEMA_ATOM.password,
  name: SCHEMA_ATOM.name,
}) satisfies z.ZodType<SignUpBody>;

/**--------------------본인 인증 ------------------------ */
export const phoneSchema = z.object({
  phone: SCHEMA_ATOM.phone,
}) satisfies z.ZodType<ISendVerificationCodeBody>;

export const verifyCodeSchema = z.object({
  phone: SCHEMA_ATOM.phone,
  code: SCHEMA_ATOM.code,
}) satisfies z.ZodType<IVerificationCodeCheckBody>;

export type SendVerificationCodeFormValues = z.infer<typeof phoneSchema>;

export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;
