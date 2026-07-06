import { z } from "zod";
import { RouteFormValues } from "../types";
import { SCHEMA_ATOM } from "./schema-atom";

const wayPoint = z.object({
  draftId: z.string().min(1),
  address: z.string(),
  lat: z.string(),
  lng: z.string(),
});

export const routeSchema = z.object({
  title: SCHEMA_ATOM.requiredString("경로명을 입력해주세요."),
  summary: SCHEMA_ATOM.requiredString("소개를 입력해주세요."),
  content: SCHEMA_ATOM.requiredString("상세 소개를 입력해주세요."),
  departureRegion: SCHEMA_ATOM.route.region,
  destinationRegion: SCHEMA_ATOM.route.region,
  externalMapUrl: SCHEMA_ATOM.url,
  distanceKm: SCHEMA_ATOM.number,
  estimatedDurationMinutes: SCHEMA_ATOM.integerNumber,
  tags: z.string(),
  sourceType: SCHEMA_ATOM.route.sourceType,
  departureAddress: z.string(),
  destinationAddress: z.string(),
  departureLat: z.string(),
  departureLng: z.string(),
  destinationLat: z.string(),
  destinationLng: z.string(),
  waypoints: z
    .array(wayPoint)
    .max(15, "경유지는 최대 15개까지 등록할 수 있습니다."),
}) satisfies z.ZodType<RouteFormValues>;

export const updateRouteSchema = z
  .object({
    title: SCHEMA_ATOM.optional.string,
    summary: SCHEMA_ATOM.optional.string,
    content: SCHEMA_ATOM.optional.string,
    departureRegion: SCHEMA_ATOM.route.region.optional(),
    destinationRegion: SCHEMA_ATOM.route.region.optional(),
    provider: z.enum(["naver", "etc"]).optional(),
    externalMapUrl: z.string().url().optional(),
    thumbnailUrl: z.string().url().nullable().optional(),
    distanceKm: SCHEMA_ATOM.optional.number,
    estimatedDurationMinutes: z.number().int().optional(),
    tags: z.array(z.string()).optional(),
    sourceType: z.enum(["curated"]).optional(),
    departureLat: SCHEMA_ATOM.optional.number,
    departureLng: SCHEMA_ATOM.optional.number,
    destinationLat: SCHEMA_ATOM.optional.number,
    destinationLng: SCHEMA_ATOM.optional.number,
    waypoints: z
      .array(
        z.object({
          sequence: z.number().int().positive(),
          lat: z.number(),
          lng: z.number(),
        })
      )
      .max(15)
      .optional(),
  })
  .refine(
    (value) =>
      value.title !== undefined ||
      value.summary !== undefined ||
      value.content !== undefined ||
      value.departureRegion !== undefined ||
      value.destinationRegion !== undefined ||
      value.provider !== undefined ||
      value.externalMapUrl !== undefined ||
      value.thumbnailUrl !== undefined ||
      value.distanceKm !== undefined ||
      value.estimatedDurationMinutes !== undefined ||
      value.tags !== undefined ||
      value.sourceType !== undefined ||
      value.departureLat !== undefined ||
      value.departureLng !== undefined ||
      value.destinationLat !== undefined ||
      value.destinationLng !== undefined ||
      value.waypoints !== undefined,
    { message: "수정할 항목이 필요합니다." }
  );
