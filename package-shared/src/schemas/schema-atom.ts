import z from "zod";
import { PlaceCategory } from "../types";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d{10,11}$/, "휴대폰 번호 10~11자리를 입력해주세요.");

const optionalPhoneSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || /^\d{10,11}$/.test(value),
    "휴대폰 번호 10~11자리를 입력해주세요."
  )
  .transform((value) => value || undefined);

export const SCHEMA_ATOM = {
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요.")
    .max(40, "이름은 40자 이하로 입력해주세요."),
  email: z.string().trim().email("이메일 형식이 올바르지 않습니다."),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  phone: phoneSchema,
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "인증번호 6자리를 입력해주세요."), //본인인증 코드
  place: {
    category: z.enum([
      "gas",
      "repair",
      "cafe",
      "shop",
      "rest",
    ]) satisfies z.ZodType<PlaceCategory>,
    placeName: z.string().trim().min(1, "장소명을 입력해주세요."),
  },
  optional: {
    trimmedString: z
      .string()
      .trim()
      .transform((value) => value || undefined),
    phone: optionalPhoneSchema,
  },
  coordinate: z
    .string()
    .trim()
    .min(1, "좌표를 입력해주세요.")
    .refine((value) => Number.isFinite(Number(value)), {
      message: "숫자 좌표를 입력해주세요.",
    })
    .transform((value) => Number(value)),
  image: z.string().trim().url("이미지 URL 형식이 올바르지 않습니다."),
  address: z.string().trim().min(1, "주소를 입력해주세요."),
  url: z.string().trim().url("URL 형식이 올바르지 않습니다."),
};
