import type { PlaceGeocodeResponseData } from "@package-shared/index";
import {
  badRequest,
  createSupabaseApiClient,
  forbidden,
  getStringParam,
  internalServerError,
  notFound,
  ok,
} from "@shared/api";
import { requireApiSession } from "@shared/api/auth";
import type { NextRequest } from "next/server";

const NAVER_GEOCODE_URL =
  "https://maps.apigw.ntruss.com/map-geocode/v2/geocode";

function getNaverGeocodeEnv() {
  const apiKeyId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  const apiKey = process.env.NAVER_CLOUD_MAP_API_KEY;

  if (!apiKeyId || !apiKey) {
    throw new Error(
      "NAVER_CLOUD_MAP_API_KEY_ID 또는 NAVER_CLOUD_MAP_API_KEY 환경변수가 없습니다."
    );
  }

  return { apiKeyId, apiKey };
}

export async function GET(request: NextRequest) {
  const session = await requireApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const query = getStringParam(request.nextUrl.searchParams, "query");
  if (!query) {
    return badRequest("주소가 필요합니다.");
  }

  const supabase = createSupabaseApiClient(request);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.userId)
    .maybeSingle();

  if (profileError) {
    return internalServerError(profileError.message);
  }

  if (profile?.role !== "admin") {
    return forbidden("좌표 검색은 운영자만 가능합니다.");
  }

  let apiKeyId: string;
  let apiKey: string;
  try {
    ({ apiKeyId, apiKey } = getNaverGeocodeEnv());
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "지오코딩 환경변수를 읽지 못했습니다."
    );
  }

  const url = new URL(NAVER_GEOCODE_URL);
  url.searchParams.set("query", query);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-ncp-apigw-api-key-id": apiKeyId,
      "x-ncp-apigw-api-key": apiKey,
    },
    cache: "no-store",
  }).catch((error) => console.error("네이버 지오코딩 요청 중 오류:", error));

  if (!response) {
    return internalServerError("네이버 지오코딩 요청에 실패했습니다.");
  }

  if (!response.ok) {
    return internalServerError("네이버 지오코딩 응답이 올바르지 않습니다.");
  }

  const payload = (await response.json().catch(() => null)) as {
    addresses?: Array<{
      roadAddress?: string;
      jibunAddress?: string;
      x?: string;
      y?: string;
    }>;
  } | null;

  const first = payload?.addresses?.[0];
  if (!first?.x || !first?.y) {
    return notFound("주소에 해당하는 좌표를 찾지 못했습니다.");
  }

  const data: PlaceGeocodeResponseData = {
    address: first.roadAddress || first.jibunAddress || query,
    lng: Number(first.x),
    lat: Number(first.y),
  };

  return ok(data);
}
