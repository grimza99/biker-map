export type RouteProvider = "naver" | "kakao" | "google" | "etc";
export type RouteSourceType = "curated" | "user";

export type RoutesQuery = {
  search?: string;
  region?: string;
  cursor?: string;
  limit?: number;
};

export type RouteListItem = {
  id: string;
  title: string;
  region: string;
  summary: string;
  provider: RouteProvider;
  externalMapUrl: string;
  thumbnailUrl?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  tags: string[];
  sourceType: RouteSourceType;
};

export type RouteDetail = RouteListItem;

export type RoutesListResponseData = {
  items: RouteListItem[];
};
