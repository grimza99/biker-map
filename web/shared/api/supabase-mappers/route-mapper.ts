import {
  RouteDetail,
  RouteListItem,
  RouteProvider,
  RouteSourceType,
} from "@package-shared/types/route";

import {
  getRecordNumber,
  getRecordString,
  getRecordStringArray,
  SupabaseRecord,
} from "../supabase-record";

const routeProviders = new Set<RouteProvider>([
  "naver",
  "kakao",
  "google",
  "etc",
]);
const routeSourceTypes = new Set<RouteSourceType>(["curated", "user"]);

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

export function mapRouteListItem(row: SupabaseRecord): RouteListItem | null {
  const id = getRecordString(row, ["id"]);
  const title = getRecordString(row, ["title"]);
  const region = getRecordString(row, ["region"]);
  const summary = getRecordString(row, ["summary"]);
  const provider = toRouteProvider(getRecordString(row, ["provider"], "etc"));
  const externalMapUrl = getRecordString(row, [
    "external_map_url",
    "externalMapUrl",
  ]);

  if (!id || !title || !region || !summary || !externalMapUrl) {
    return null;
  }

  return {
    id,
    title,
    region,
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
  };
}

export function mapRouteDetail(row: SupabaseRecord): RouteDetail | null {
  return mapRouteListItem(row);
}
