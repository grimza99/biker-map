import {
  RouteDetail,
  RouteListItem,
  RouteProvider,
  RouteRegion,
  RouteSourceType,
} from "@package-shared/types/route";

import {
  getRecordNumber,
  getRecordString,
  getRecordStringArray,
  SupabaseRecord,
} from "../supabase-record";

const routeProviders = new Set<RouteProvider>(["naver"]);
const routeSourceTypes = new Set<RouteSourceType>(["curated", "user"]);
const routeRegions = new Set<RouteRegion>([
  "seoul",
  "busan",
  "daegu",
  "incheon",
  "gwangju",
  "daejeon",
  "ulsan",
  "sejong",
  "jeju",
]);

function toRouteProvider(value: string) {
  return routeProviders.has(value as RouteProvider)
    ? (value as RouteProvider)
    : "etc";
}

function toRouteSourceType(value: string) {
  return routeSourceTypes.has(value as RouteSourceType)
    ? (value as RouteSourceType)
    : "curated";
}

function toRouteRegion(value: string) {
  return routeRegions.has(value as RouteRegion)
    ? (value as RouteRegion)
    : undefined;
}

export function mapRouteListItem(row: SupabaseRecord): RouteListItem | null {
  const id = getRecordString(row, ["id"]);
  const title = getRecordString(row, ["title"]);
  const summary = getRecordString(row, ["summary"]);
  const provider = toRouteProvider(getRecordString(row, ["provider"]));
  const externalMapUrl = getRecordString(row, [
    "external_map_url",
    "externalMapUrl",
  ]);

  if (!id || !title || !summary || !externalMapUrl) {
    return null;
  }

  return {
    id,
    title,
    departureRegion: toRouteRegion(
      getRecordString(row, ["departure_region", "departureRegion"], "")
    ),
    destinationRegion: toRouteRegion(
      getRecordString(row, ["destination_region", "destinationRegion"], "")
    ),
    summary,
    provider,
    externalMapUrl,
    thumbnailUrl:
      getRecordString(row, ["thumbnail_url", "thumbnailUrl"], "") || undefined,
    distanceKm: (() => {
      const value = getRecordNumber(
        row,
        ["distance_km", "distanceKm"],
        Number.NaN
      );
      return Number.isFinite(value) ? value : undefined;
    })(),
    estimatedDurationMinutes: (() => {
      const value = getRecordNumber(
        row,
        ["estimated_duration_minutes", "estimatedDurationMinutes"],
        Number.NaN
      );
      return Number.isFinite(value) ? value : undefined;
    })(),
    tags: getRecordStringArray(row, ["tags"]),
    sourceType: toRouteSourceType(
      getRecordString(row, ["source_type", "sourceType"], "curated")
    ),
    createdById:
      getRecordString(row, ["created_by", "createdById"], "") || undefined,
  };
}

export function mapRouteDetail(row: SupabaseRecord): RouteDetail | null {
  const item = mapRouteListItem(row);

  if (!item) {
    return null;
  }

  return {
    ...item,
    content: getRecordString(row, ["content"], ""),
  };
}
