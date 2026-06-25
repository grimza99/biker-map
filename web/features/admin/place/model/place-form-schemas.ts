"use client";

import {
  type CreatePlaceBody,
  type PlaceCategory,
  type UpdatePlaceBody,
} from "@package-shared/index";
import { z } from "zod";

const placeCategorySchema = z.enum([
  "gas",
  "repair",
  "cafe",
  "shop",
  "rest",
]) satisfies z.ZodType<PlaceCategory>;

const optionalTrimmedStringSchema = z
  .string()
  .trim()
  .transform((value) => value || undefined);

const coordinateSchema = z
  .string()
  .trim()
  .min(1, "좌표를 입력해주세요.")
  .refine((value) => Number.isFinite(Number(value)), {
    message: "숫자 좌표를 입력해주세요.",
  })
  .transform((value) => Number(value));

const imageUrlSchema = z.string().trim().url("이미지 URL 형식이 올바르지 않습니다.");

export const placeFormSchema = z.object({
  name: z.string().trim().min(1, "장소명을 입력해주세요."),
  category: placeCategorySchema,
  address: z.string().trim().min(1, "주소를 입력해주세요."),
  phone: optionalTrimmedStringSchema,
  description: optionalTrimmedStringSchema,
  lat: coordinateSchema,
  lng: coordinateSchema,
  naverPlaceUrl: z
    .string()
    .trim()
    .url("네이버 플레이스 URL 형식이 올바르지 않습니다."),
  images: z
    .array(imageUrlSchema)
    .default([])
    .transform((images) => images.filter(Boolean)),
});

export type PlaceFormInput = z.input<typeof placeFormSchema>;
export type PlaceFormValues = z.output<typeof placeFormSchema>;

export function createPlaceFormDefaultValues(
  initialData?: Partial<CreatePlaceBody & UpdatePlaceBody> | null
): PlaceFormInput {
  return {
    name: initialData?.name ?? "",
    category: initialData?.category ?? "gas",
    address: initialData?.address ?? "",
    phone: initialData?.phone ?? "",
    description: initialData?.description ?? "",
    lat:
      initialData?.lat !== undefined && initialData?.lat !== null
        ? String(initialData.lat)
        : "",
    lng:
      initialData?.lng !== undefined && initialData?.lng !== null
        ? String(initialData.lng)
        : "",
    naverPlaceUrl: initialData?.naverPlaceUrl ?? "",
    images: initialData?.images ?? [],
  };
}
