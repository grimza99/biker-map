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
