import {
  CreateRouteBody,
  NormalizedWaypointsResult,
  RouteFormValues,
  RouteRegion,
  RouteRegionFilter,
  UpdateRouteBody,
} from "../types";

export const routeRegionOptions: Array<{
  label: string;
  value: RouteRegionFilter;
}> = [
  { value: "all", label: "전체" },
  { value: "seoul", label: "서울" },
  { value: "busan", label: "부산" },
  { value: "daegu", label: "대구" },
  { value: "incheon", label: "인천" },
  { value: "gwangju", label: "광주" },
  { value: "daejeon", label: "대전" },
  { value: "ulsan", label: "울산" },
  { value: "sejong", label: "세종" },
  { value: "jeju", label: "제주" },
];

export const distanceOptions = [
  { value: "all", label: "전체" },
  { value: "50", label: "50km 이하" },
  { value: "100", label: "100km 이하" },
  { value: "200", label: "200km 이하" },
  { value: "over200", label: "200km 이상" },
];

export const regionLabel: Record<RouteRegionFilter, string> = {
  all: "전체",
  seoul: "서울",
  busan: "부산",
  daegu: "대구",
  incheon: "인천",
  gwangju: "광주",
  daejeon: "대전",
  ulsan: "울산",
  sejong: "세종",
  jeju: "제주",
};

export const addressRegionMap: Array<{ prefix: string; region: RouteRegion }> =
  [
    { prefix: "서울특별시", region: "seoul" },
    { prefix: "서울", region: "seoul" },
    { prefix: "부산광역시", region: "busan" },
    { prefix: "부산", region: "busan" },
    { prefix: "대구광역시", region: "daegu" },
    { prefix: "대구", region: "daegu" },
    { prefix: "인천광역시", region: "incheon" },
    { prefix: "인천", region: "incheon" },
    { prefix: "광주광역시", region: "gwangju" },
    { prefix: "광주", region: "gwangju" },
    { prefix: "대전광역시", region: "daejeon" },
    { prefix: "대전", region: "daejeon" },
    { prefix: "울산광역시", region: "ulsan" },
    { prefix: "울산", region: "ulsan" },
    { prefix: "세종특별자치시", region: "sejong" },
    { prefix: "세종", region: "sejong" },
    { prefix: "제주특별자치도", region: "jeju" },
    { prefix: "제주", region: "jeju" },
  ];

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
