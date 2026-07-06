import { z } from "zod";
import { proficiencySelectOptions } from "../model";
import { AppSession, Tproficiency, UpdateMeBody } from "../types";

const proficiencyValues = proficiencySelectOptions
  .map((option) => option.value)
  .filter(Boolean) as [Tproficiency, ...Tproficiency[]];

export type ProfileFormInput = {
  name: string;
  avatarUrl: string | null;
  bikeBrand: string;
  bikeModel: string;
  proficiency: Tproficiency | "";
};

export type ProfileFormValues = UpdateMeBody;

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "이름을 입력해 주세요.")
    .max(40, "이름은 40자 이하로 입력해 주세요."),
  avatarUrl: z.string().url().nullable(),
  bikeBrand: z
    .string()
    .trim()
    .max(40, "브랜드는 40자 이하로 입력해 주세요.")
    .transform((value) => value || null),
  bikeModel: z
    .string()
    .trim()
    .max(40, "모델명은 40자 이하로 입력해 주세요.")
    .transform((value) => value || null),
  proficiency: z
    .union([z.literal(""), z.enum(proficiencyValues)])
    .transform((value) => (value === "" ? null : value)),
}) satisfies z.ZodType<ProfileFormValues, z.ZodTypeDef, ProfileFormInput>;

export function createProfileFormDefaultValues(
  session: AppSession | null | undefined
): ProfileFormInput {
  return {
    name: session?.name ?? "",
    avatarUrl: session?.avatarUrl ?? null,
    bikeBrand: session?.bikeBrand ?? "",
    bikeModel: session?.bikeModel ?? "",
    proficiency: session?.proficiency ?? "",
  };
}

export const updateMeSchema = z.object({
  name: z.string().trim().min(1).max(40),
  avatarUrl: z.string().url().nullable(),
  bikeBrand: z.string().nullable(),
  bikeModel: z.string().nullable(),
  proficiency: z.enum(["beginner", "intermediate", "advanced"]).nullable(),
});

export type TUpdateProfileSchema = z.infer<typeof updateMeSchema>;
