"use client";

import { type Tproficiency, type UpdateMeBody } from "@package-shared/index";
import { z } from "zod";

const proficiencySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]) satisfies z.ZodType<Tproficiency>;

const nullableTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => value || null);

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해주세요.")
    .max(40, "이름은 40자 이하로 입력해주세요."),
  avatarUrl: z
    .string()
    .trim()
    .url("프로필 이미지 URL 형식이 올바르지 않습니다.")
    .nullable(),
  bikeBrand: nullableTrimmedStringSchema,
  bikeModel: nullableTrimmedStringSchema,
  proficiency: proficiencySchema.nullable(),
});

export type ProfileFormInput = z.input<typeof profileFormSchema>;
export type ProfileFormValues = z.output<typeof profileFormSchema>;

export function createProfileFormDefaultValues(
  values?: Partial<UpdateMeBody> | null
): ProfileFormInput {
  return {
    name: values?.name ?? "",
    avatarUrl: values?.avatarUrl ?? null,
    bikeBrand: values?.bikeBrand ?? "",
    bikeModel: values?.bikeModel ?? "",
    proficiency: values?.proficiency ?? null,
  };
}
