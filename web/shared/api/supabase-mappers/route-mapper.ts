import {
  RouteDetail,
  RouteListItem,
  RoutePathPoint,
  RouteProvider,
  RouteRegion,
  RouteSourceType,
  RouteWaypoint,
} from "@package-shared/types/route";

import {
  getRecordArray,
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

function toOptionalNumber(row: SupabaseRecord, paths: string[]) {
  const value = getRecordNumber(row, paths, Number.NaN);
  return Number.isFinite(value) ? value : undefined;
}

function mapRouteWaypoint(row: unknown): RouteWaypoint | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const record = row as SupabaseRecord;
  const lat = getRecordNumber(record, ["lat"], Number.NaN);
  const lng = getRecordNumber(record, ["lng"], Number.NaN);
  const sequence = getRecordNumber(record, ["sequence"], Number.NaN);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    !Number.isFinite(sequence)
  ) {
    return null;
  }

  return {
    id: getRecordString(record, ["id"], "") || undefined,
    sequence,
    lat,
    lng,
  };
}

function mapPathPoint(row: unknown): RoutePathPoint | null {
  if (!row || typeof row !== "object") {
    return null;
  }

  const record = row as SupabaseRecord;
  const lat = getRecordNumber(record, ["lat"], Number.NaN);
  const lng = getRecordNumber(record, ["lng"], Number.NaN);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
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
    distanceKm: toOptionalNumber(row, ["distance_km", "distanceKm"]),
    estimatedDurationMinutes: toOptionalNumber(row, [
      "estimated_duration_minutes",
      "estimatedDurationMinutes",
    ]),
    tags: getRecordStringArray(row, ["tags"]),
    sourceType: toRouteSourceType(
      getRecordString(row, ["source_type", "sourceType"], "curated")
    ),
    createdById:
      getRecordString(row, ["created_by", "createdById"], "") || undefined,
    departureLat: toOptionalNumber(row, ["departure_lat", "departureLat"]),
    departureLng: toOptionalNumber(row, ["departure_lng", "departureLng"]),
    destinationLat: toOptionalNumber(row, [
      "destination_lat",
      "destinationLat",
    ]),
    destinationLng: toOptionalNumber(row, [
      "destination_lng",
      "destinationLng",
    ]),
    directionsCalculatedAt:
      getRecordString(
        row,
        ["directions_calculated_at", "directionsCalculatedAt"],
        ""
      ) || undefined,
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
    waypoints: getRecordArray(row, ["route_waypoints", "waypoints"])
      .map(mapRouteWaypoint)
      .filter((waypoint): waypoint is RouteWaypoint => Boolean(waypoint))
      .sort((a, b) => a.sequence - b.sequence),
    path: getRecordArray(row, ["route_paths.path", "routePath.path", "path"])
      .map(mapPathPoint)
      .filter((point): point is RoutePathPoint => Boolean(point)),
  };
}
