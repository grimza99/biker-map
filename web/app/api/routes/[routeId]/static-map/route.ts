import { createSupabaseApiClient, internalServerError, notFound } from "@shared/api";
import { NextResponse } from "next/server";

type Point = {
  lat: number;
  lng: number;
};

function isValidPoint(value: unknown): value is Point {
  if (!value || typeof value !== "object") {
    return false;
  }

  const point = value as Partial<Point>;
  return Number.isFinite(point.lat) && Number.isFinite(point.lng);
}

function computeBounds(points: Point[]) {
  return points.reduce(
    (bounds, point) => ({
      minLat: Math.min(bounds.minLat, point.lat),
      maxLat: Math.max(bounds.maxLat, point.lat),
      minLng: Math.min(bounds.minLng, point.lng),
      maxLng: Math.max(bounds.maxLng, point.lng),
    }),
    {
      minLat: points[0].lat,
      maxLat: points[0].lat,
      minLng: points[0].lng,
      maxLng: points[0].lng,
    }
  );
}

function computeLevel(points: Point[]) {
  if (points.length <= 1) {
    return 16;
  }

  const bounds = computeBounds(points);
  const latSpan = Math.max(bounds.maxLat - bounds.minLat, 0);
  const lngSpan = Math.max(bounds.maxLng - bounds.minLng, 0);
  const span = Math.max(latSpan, lngSpan);

  if (span <= 0.005) return 16;
  if (span <= 0.01) return 15;
  if (span <= 0.02) return 14;
  if (span <= 0.05) return 13;
  if (span <= 0.1) return 12;
  if (span <= 0.2) return 11;
  if (span <= 0.4) return 10;
  if (span <= 0.8) return 9;
  if (span <= 1.6) return 8;
  return 7;
}

function buildMarkerParams(points: Point[]) {
  const markers = [
    `type:d|size:mid|color:Blue|pos:${points[0].lng} ${points[0].lat}`,
    `type:d|size:mid|color:Red|pos:${points[points.length - 1].lng} ${
      points[points.length - 1].lat
    }`,
  ];

  const innerPoints = points
    .filter((_, index) => index > 0 && index < points.length - 1)
    .filter((_, index, array) => index % Math.ceil(array.length / 6 || 1) === 0)
    .slice(0, 6);

  if (innerPoints.length) {
    markers.push(
      `type:d|size:tiny|color:Gray|pos:${innerPoints
        .map((point) => `${point.lng} ${point.lat}`)
        .join(",")}`
    );
  }

  return markers;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const apiKeyId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const apiKey =
    process.env.NAVER_CLOUD_MAP_API_KEY ??
    process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_KEY;

  if (!apiKeyId || !apiKey) {
    return internalServerError("네이버 Static Map 인증 환경변수가 없습니다.");
  }

  const { routeId } = await params;
  const supabase = createSupabaseApiClient(request);
  const { data: routePath, error } = await supabase
    .from("route_paths")
    .select("path")
    .eq("route_id", routeId)
    .maybeSingle();

  if (error) {
    return internalServerError(error.message);
  }

  const points = (Array.isArray(routePath?.path) ? routePath.path : []).filter(
    isValidPoint
  );

  if (!points.length) {
    return notFound("경로 좌표를 찾을 수 없습니다.");
  }

  const bounds = computeBounds(points);
  const centerLng = (bounds.minLng + bounds.maxLng) / 2;
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;

  const searchParams = new URLSearchParams({
    w: "1200",
    h: "720",
    scale: "2",
    format: "png",
    lang: "ko",
    maptype: "basic",
    center: `${centerLng},${centerLat}`,
    level: String(computeLevel(points)),
  });

  for (const marker of buildMarkerParams(points)) {
    searchParams.append("markers", marker);
  }

  const response = await fetch(
    `https://naveropenapi.apigw.ntruss.com/map-static/v2/raster?${searchParams.toString()}`,
    {
      headers: {
        "x-ncp-apigw-api-key-id": apiKeyId,
        "x-ncp-apigw-api-key": apiKey,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return internalServerError(
      `네이버 Static Map 요청에 실패했습니다. (${response.status}) ${errorText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "image/png",
      "Cache-Control": "no-store",
    },
  });
}
