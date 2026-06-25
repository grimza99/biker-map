"use client";

import {
  type CreateRouteBody,
  type RouteRegion,
  type RouteSourceType,
  type UpdateRouteBody,
} from "@package-shared/index";
import { z } from "zod";

const routeRegionSchema = z.enum([
  "seoul",
  "busan",
  "daegu",
  "incheon",
  "gwangju",
  "daejeon",
  "ulsan",
  "sejong",
  "jeju",
  "all",
]) satisfies z.ZodType<RouteRegion>;

const routeSourceTypeSchema = z.enum([
  "curated",
  "user",
]) satisfies z.ZodType<RouteSourceType>;

const optionalNumericStringSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || Number.isFinite(Number(value)),
    "숫자만 입력해주세요."
  );

export type RouteFormWaypointValue = {
  draftId: string;
  address: string;
  lat: string;
  lng: string;
};

type NormalizedWaypointsResult =
  | {
      data: Array<{
        sequence: number;
        lat: number;
        lng: number;
      }>;
    }
  | {
      error: string;
    };

export type RouteFormValues = {
  title: string;
  summary: string;
  content: string;
  departureRegion: RouteRegion;
  destinationRegion: RouteRegion;
  externalMapUrl: string;
  distanceKm: string;
  estimatedDurationMinutes: string;
  tags: string;
  sourceType: RouteSourceType;
  departureAddress: string;
  destinationAddress: string;
  departureLat: string;
  departureLng: string;
  destinationLat: string;
  destinationLng: string;
  waypoints: RouteFormWaypointValue[];
};

export const routeFormSchema = z.object({
  title: z.string().trim().min(1, "경로명을 입력해주세요."),
  summary: z.string().trim().min(1, "소개를 입력해주세요."),
  content: z.string().trim().min(1, "상세 소개를 입력해주세요."),
  departureRegion: routeRegionSchema,
  destinationRegion: routeRegionSchema,
  externalMapUrl: z
    .string()
    .trim()
    .url("외부 지도 URL 형식이 올바르지 않습니다."),
  distanceKm: optionalNumericStringSchema,
  estimatedDurationMinutes: optionalNumericStringSchema,
  tags: z.string(),
  sourceType: routeSourceTypeSchema,
  departureAddress: z.string(),
  destinationAddress: z.string(),
  departureLat: z.string(),
  departureLng: z.string(),
  destinationLat: z.string(),
  destinationLng: z.string(),
  waypoints: z
    .array(
      z.object({
        draftId: z.string().min(1),
        address: z.string(),
        lat: z.string(),
        lng: z.string(),
      })
    )
    .max(15, "경유지는 최대 15개까지 등록할 수 있습니다."),
}) satisfies z.ZodType<RouteFormValues>;

export function createRouteFormDefaultValues(): RouteFormValues {
  return {
    title: "",
    summary: "",
    content: "",
    departureRegion: "seoul",
    destinationRegion: "seoul",
    externalMapUrl: "",
    distanceKm: "",
    estimatedDurationMinutes: "",
    tags: "",
    sourceType: "curated",
    departureAddress: "",
    destinationAddress: "",
    departureLat: "",
    departureLng: "",
    destinationLat: "",
    destinationLng: "",
    waypoints: [],
  };
}

function parseCoordinateValue(value: string) {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const parsedValue = Number(trimmedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function buildNormalizedWaypoints(
  values: RouteFormValues["waypoints"]
): NormalizedWaypointsResult {
  const parsedWaypoints = values.map((waypoint, index) => ({
    sequence: index + 1,
    lat: parseCoordinateValue(waypoint.lat),
    lng: parseCoordinateValue(waypoint.lng),
  }));

  if (
    parsedWaypoints.some(
      (waypoint) => waypoint.lat === null || waypoint.lng === null
    )
  ) {
    return {
      error: "경유지 좌표가 모두 확인된 뒤 저장할 수 있습니다.",
    };
  }

  return {
    data: parsedWaypoints.map((waypoint) => ({
      sequence: waypoint.sequence,
      lat: waypoint.lat as number,
      lng: waypoint.lng as number,
    })),
  };
}

export function buildCreateRoutePayload(
  values: RouteFormValues,
  thumbnailUrl?: string
):
  | { success: true; data: CreateRouteBody }
  | { success: false; message: string } {
  const departureLat = parseCoordinateValue(values.departureLat);
  const departureLng = parseCoordinateValue(values.departureLng);
  const destinationLat = parseCoordinateValue(values.destinationLat);
  const destinationLng = parseCoordinateValue(values.destinationLng);

  if (
    departureLat === null ||
    departureLng === null ||
    destinationLat === null ||
    destinationLng === null
  ) {
    return {
      success: false,
      message:
        "출발지와 도착지 주소 검색이 끝난 뒤 좌표가 확인되면 등록할 수 있습니다.",
    };
  }

  const normalizedWaypoints = buildNormalizedWaypoints(values.waypoints);
  if (!("data" in normalizedWaypoints)) {
    return {
      success: false,
      message: normalizedWaypoints.error,
    };
  }
  const normalizedWaypointData = normalizedWaypoints.data;

  return {
    success: true,
    data: {
      title: values.title,
      summary: values.summary.trim(),
      content: values.content,
      departureRegion: values.departureRegion,
      destinationRegion: values.destinationRegion,
      provider: "naver",
      externalMapUrl: values.externalMapUrl,
      distanceKm: values.distanceKm.trim()
        ? Number(values.distanceKm.trim())
        : undefined,
      estimatedDurationMinutes: values.estimatedDurationMinutes.trim()
        ? Number(values.estimatedDurationMinutes.trim())
        : undefined,
      tags: values.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      sourceType: values.sourceType,
      departureLat,
      departureLng,
      destinationLat,
      destinationLng,
      waypoints: normalizedWaypointData,
      ...(thumbnailUrl ? { thumbnailUrl } : {}),
    },
  };
}

export function buildUpdateRoutePayload(
  values: RouteFormValues,
  thumbnailUrl: string | null
):
  | { success: true; data: UpdateRouteBody }
  | { success: false; message: string } {
  const departureLat = parseCoordinateValue(values.departureLat);
  const departureLng = parseCoordinateValue(values.departureLng);
  const destinationLat = parseCoordinateValue(values.destinationLat);
  const destinationLng = parseCoordinateValue(values.destinationLng);

  const hasPrimaryCoordinates =
    departureLat !== null ||
    departureLng !== null ||
    destinationLat !== null ||
    destinationLng !== null;

  if (
    hasPrimaryCoordinates &&
    (departureLat === null ||
      departureLng === null ||
      destinationLat === null ||
      destinationLng === null)
  ) {
    return {
      success: false,
      message: "출발지와 도착지 좌표가 모두 확인된 뒤 저장할 수 있습니다.",
    };
  }

  const normalizedWaypoints =
    values.waypoints.length > 0
      ? buildNormalizedWaypoints(values.waypoints)
      : { data: [] };

  if (!("data" in normalizedWaypoints)) {
    return {
      success: false,
      message: normalizedWaypoints.error,
    };
  }
  const normalizedWaypointData = normalizedWaypoints.data;

  return {
    success: true,
    data: {
      title: values.title,
      summary: values.summary.trim(),
      content: values.content,
      departureRegion: values.departureRegion,
      destinationRegion: values.destinationRegion,
      provider: "naver",
      externalMapUrl: values.externalMapUrl,
      distanceKm: values.distanceKm.trim()
        ? Number(values.distanceKm.trim())
        : undefined,
      estimatedDurationMinutes: values.estimatedDurationMinutes.trim()
        ? Number(values.estimatedDurationMinutes.trim())
        : undefined,
      tags: values.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      sourceType: values.sourceType,
      thumbnailUrl,
      ...(hasPrimaryCoordinates
        ? {
            departureLat: departureLat as number,
            departureLng: departureLng as number,
            destinationLat: destinationLat as number,
            destinationLng: destinationLng as number,
            waypoints: normalizedWaypointData,
          }
        : {}),
    },
  };
}
