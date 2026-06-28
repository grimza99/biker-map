import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  DEFAULT_BIKERS_NEARBY_LIMIT,
  DEFAULT_BIKERS_NEARBY_RADIUS_METERS,
  MAX_BIKERS_NEARBY_LIMIT,
  MAX_BIKERS_NEARBY_RADIUS_METERS,
  BIKER_LOCATION_SHARING_STATUSES,
  TBikerPresenceItem,
  TBikersNearbyResponseData,
  Tproficiency,
} from "@package-shared/index";

import {
  badRequest,
  getNumberParam,
  internalServerError,
  ok,
} from "@shared/api";
import { requireVerifiedApiSession } from "@shared/api/auth";
import { createSupabaseServiceClient } from "@shared/lib/supabase";

const nearbyBikersQuerySchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusMeters: z
    .number()
    .int()
    .min(1)
    .max(MAX_BIKERS_NEARBY_RADIUS_METERS)
    .default(DEFAULT_BIKERS_NEARBY_RADIUS_METERS),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_BIKERS_NEARBY_LIMIT)
    .default(DEFAULT_BIKERS_NEARBY_LIMIT),
});

type BikerPresenceNearbyRow = {
  user_id: string;
  lat: number;
  lng: number;
  accuracy_meters: number | null;
  heading: number | null;
  speed_kph: number | null;
  expires_at: string;
  updated_at: string;
};

type NearbyProfileRow = {
  id: string;
  name: string | null;
  bike_brand: string | null;
  bike_model: string | null;
  proficiency: Tproficiency | null;
};

type NearbyCandidate = BikerPresenceNearbyRow & {
  distanceMeters: number;
};

const EARTH_RADIUS_METERS = 6371000;

/*------------------------------ get (list active nearby bikers) ---------------------------------------*/

export async function GET(request: NextRequest) {
  const session = await requireVerifiedApiSession(request);
  if (session instanceof Response) {
    return session;
  }

  const parsedQuery = nearbyBikersQuerySchema.safeParse({
    lat: getNumberParam(request.nextUrl.searchParams, "lat"),
    lng: getNumberParam(request.nextUrl.searchParams, "lng"),
    radiusMeters:
      getNumberParam(request.nextUrl.searchParams, "radiusMeters") ??
      DEFAULT_BIKERS_NEARBY_RADIUS_METERS,
    limit:
      getNumberParam(request.nextUrl.searchParams, "limit") ??
      DEFAULT_BIKERS_NEARBY_LIMIT,
  });

  if (!parsedQuery.success) {
    return badRequest("주변 바이커 조회 query가 올바르지 않습니다.");
  }

  const query = parsedQuery.data;
  const now = new Date();
  const nowIso = now.toISOString();
  const bounds = buildBounds(query.lat, query.lng, query.radiusMeters);
  const supabase = createSupabaseServiceClient();

  let candidateRows: BikerPresenceNearbyRow[];
  try {
    candidateRows = await loadNearbyPresenceCandidates(
      supabase,
      session.userId,
      nowIso,
      bounds
    );
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "주변 바이커 위치를 조회할 수 없습니다."
    );
  }

  const candidates = candidateRows
    .map((row) => ({
      ...row,
      distanceMeters: calculateDistanceMeters(
        query.lat,
        query.lng,
        row.lat,
        row.lng
      ),
    }))
    .filter((row) => row.distanceMeters <= query.radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, query.limit);

  let profileMap: Map<string, NearbyProfileRow>;
  try {
    profileMap = await loadNearbyProfileMap(
      supabase,
      candidates.map((candidate) => candidate.user_id)
    );
  } catch (error) {
    return internalServerError(
      error instanceof Error
        ? error.message
        : "주변 바이커 프로필을 조회할 수 없습니다."
    );
  }

  const response = {
    items: candidates.map((candidate) =>
      mapNearbyPresenceItem(candidate, profileMap, session.userId)
    ),
    radiusMeters: query.radiusMeters,
    serverNow: nowIso,
  } satisfies TBikersNearbyResponseData;

  return ok(response);
}

async function loadNearbyPresenceCandidates(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  currentUserId: string,
  nowIso: string,
  bounds: ReturnType<typeof buildBounds>
) {
  const responses = await Promise.all(
    bounds.lngRanges.map((range) =>
      supabase
        .from("biker_presence")
        .select(
          "user_id, lat, lng, accuracy_meters, heading, speed_kph, expires_at, updated_at"
        )
        .gt("expires_at", nowIso)
        .neq("user_id", currentUserId)
        .gte("lat", bounds.minLat)
        .lte("lat", bounds.maxLat)
        .gte("lng", range.minLng)
        .lte("lng", range.maxLng)
    )
  );

  const rowsByUserId = new Map<string, BikerPresenceNearbyRow>();

  for (const response of responses) {
    if (response.error) {
      throw new Error(response.error.message);
    }

    for (const row of (response.data ?? []) as BikerPresenceNearbyRow[]) {
      rowsByUserId.set(row.user_id, row);
    }
  }

  return Array.from(rowsByUserId.values());
}

async function loadNearbyProfileMap(
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  userIds: string[]
) {
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (!ids.length) {
    return new Map<string, NearbyProfileRow>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, bike_brand, bike_model, proficiency")
    .in("id", ids);

  if (error) {
    throw new Error(error.message);
  }

  return new Map(
    ((data ?? []) as NearbyProfileRow[]).map((row) => [row.id, row])
  );
}

function mapNearbyPresenceItem(
  row: NearbyCandidate,
  profileMap: Map<string, NearbyProfileRow>,
  currentUserId: string
): TBikerPresenceItem {
  const profile = profileMap.get(row.user_id);

  return {
    userId: row.user_id,
    nickname: profile?.name?.trim() || "알 수 없는 라이더",
    bikeBrand: profile?.bike_brand ?? null,
    bikeModel: profile?.bike_model ?? null,
    proficiency: profile?.proficiency ?? null,
    isMe: row.user_id === currentUserId,
    location: {
      lat: row.lat,
      lng: row.lng,
    },
    accuracyMeters: row.accuracy_meters,
    heading: row.heading,
    sharingStatus: BIKER_LOCATION_SHARING_STATUSES[1],
    speedKph: row.speed_kph,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
  };
}

function buildBounds(lat: number, lng: number, radiusMeters: number) {
  const latDelta = radiansToDegrees(radiusMeters / EARTH_RADIUS_METERS);
  const cosLat = Math.cos(degreesToRadians(lat));
  const lngDelta =
    Math.abs(cosLat) < 1e-6
      ? 180
      : radiansToDegrees(radiusMeters / (EARTH_RADIUS_METERS * cosLat));
  const rawMinLng = lng - lngDelta;
  const rawMaxLng = lng + lngDelta;

  return {
    minLat: Math.max(-90, lat - latDelta),
    maxLat: Math.min(90, lat + latDelta),
    lngRanges:
      rawMinLng < -180
        ? [
            {
              minLng: rawMinLng + 360,
              maxLng: 180,
            },
            {
              minLng: -180,
              maxLng: rawMaxLng,
            },
          ]
        : rawMaxLng > 180
          ? [
              {
                minLng: rawMinLng,
                maxLng: 180,
              },
              {
                minLng: -180,
                maxLng: rawMaxLng - 360,
              },
            ]
          : [
              {
                minLng: rawMinLng,
                maxLng: rawMaxLng,
              },
            ],
  };
}

function calculateDistanceMeters(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) {
  const lat1 = degreesToRadians(fromLat);
  const lat2 = degreesToRadians(toLat);
  const deltaLat = degreesToRadians(toLat - fromLat);
  const deltaLng = degreesToRadians(
    normalizeShortestLongitudeDelta(toLng - fromLng)
  );

  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number) {
  return (value * 180) / Math.PI;
}

function normalizeShortestLongitudeDelta(deltaLng: number) {
  if (deltaLng > 180) {
    return deltaLng - 360;
  }

  if (deltaLng < -180) {
    return deltaLng + 360;
  }

  return deltaLng;
}
