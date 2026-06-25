"use client";

import {
  type ISendVerificationCodeBody,
  type IVerificationCodeCheckBody,
} from "@package-shared/index";
import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10,11}$/, "휴대폰 번호 10~11자리를 입력해주세요.");

export const sendVerificationCodeFormSchema = z.object({
  phone: phoneSchema,
}) satisfies z.ZodType<ISendVerificationCodeBody>;

export const verifyCodeFormSchema = z.object({
  phone: phoneSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "인증번호 6자리를 입력해주세요."),
}) satisfies z.ZodType<IVerificationCodeCheckBody>;

export type SendVerificationCodeFormValues = z.infer<
  typeof sendVerificationCodeFormSchema
>;
export type VerifyCodeFormValues = z.infer<typeof verifyCodeFormSchema>;
