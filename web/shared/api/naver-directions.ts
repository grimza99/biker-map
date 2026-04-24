import type {
  RouteCoordinate,
  RoutePathPoint,
} from "@package-shared/types/route";

const NAVER_ROUTE_OPTION = "trafast";

const NAVER_DIRECTIONS_URL =
  "https://maps.apigw.ntruss.com/map-direction-15/v1/driving";

type NaverDirectionsResponse = {
  code?: number;
  message?: string;
  route?: {
    trafast?: Array<NaverRoute>;
    tracomfort?: Array<NaverRoute>;
    traoptimal?: Array<{
      summary?: {
        distance?: number;
        duration?: number;
      };
      path?: Array<[number, number]>;
    }>;
    traavoidtoll?: Array<NaverRoute>;
    traavoidcaronly?: Array<NaverRoute>;
  };
};

type NaverRoute = {
  summary?: {
    distance?: number;
    duration?: number;
  };
  path?: Array<[number, number]>;
};

export type CalculatedRoutePath = {
  path: RoutePathPoint[];
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  rawSummary?: Record<string, unknown>;
  rawResponse: NaverDirectionsResponse;
};

function getNaverDirectionsEnv() {
  const apiKeyId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const apiKey = process.env.NAVER_CLOUD_MAP_API_KEY;

  if (!apiKeyId || !apiKey) {
    throw new Error(
      "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 또는 NAVER_CLOUD_MAP_API_KEY 환경변수가 없습니다."
    );
  }

  return { apiKeyId, apiKey };
}

function formatCoordinate(coordinate: RouteCoordinate) {
  return `${coordinate.lng},${coordinate.lat}`;
}

export async function calculateNaverRoutePath({
  departure,
  destination,
  waypoints,
}: {
  departure: RouteCoordinate;
  destination: RouteCoordinate;
  waypoints: RouteCoordinate[];
}): Promise<CalculatedRoutePath> {
  const { apiKeyId, apiKey } = getNaverDirectionsEnv();
  const url = new URL(NAVER_DIRECTIONS_URL);
  url.searchParams.set("start", formatCoordinate(departure));
  url.searchParams.set("goal", formatCoordinate(destination));
  url.searchParams.set("option", NAVER_ROUTE_OPTION);

  if (waypoints.length) {
    url.searchParams.set("waypoints", waypoints.map(formatCoordinate).join("|"));
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-ncp-apigw-api-key-id": apiKeyId,
      "x-ncp-apigw-api-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("네이버 Directions 15 응답이 올바르지 않습니다.");
  }

  const payload = (await response.json()) as NaverDirectionsResponse;
  if (payload.code !== undefined && payload.code !== 0) {
    throw new Error(
      payload.message
        ? `네이버 Directions 15 경로 계산 실패: ${payload.message}`
        : `네이버 Directions 15 경로 계산 실패(code: ${payload.code})`
    );
  }

  const route = payload.route?.[NAVER_ROUTE_OPTION]?.[0];
  const path = (route?.path ?? []).map(([lng, lat]) => ({ lat, lng }));

  if (!path.length) {
    throw new Error("네이버 Directions 15 경로 좌표를 찾지 못했습니다.");
  }

  const distanceMeters = route?.summary?.distance;
  const durationMilliseconds = route?.summary?.duration;

  return {
    path,
    distanceKm:
      typeof distanceMeters === "number"
        ? Math.round((distanceMeters / 1000) * 10) / 10
        : undefined,
    estimatedDurationMinutes:
      typeof durationMilliseconds === "number"
        ? Math.round(durationMilliseconds / 1000 / 60)
        : undefined,
    rawSummary: route?.summary,
    rawResponse: payload,
  };
}
