import z from "zod";

export const SCHEMA_ATOM = {
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요.")
    .max(40, "이름은 40자 이하로 입력해주세요."),
  email: z.string().trim().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10,11}$/, "휴대폰 번호 10~11자리를 입력해주세요."),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "인증번호 6자리를 입력해주세요."), //본인인증 코드
};
