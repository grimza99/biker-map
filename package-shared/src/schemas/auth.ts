import type { LoginBody, SignUpBody } from "../types/auth";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
}) satisfies z.ZodType<LoginBody>;

export const signUpSchema = z.object({
  email: z.string().trim().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요.")
    .max(40, "이름은 40자 이하로 입력해주세요."),
}) satisfies z.ZodType<SignUpBody>;
