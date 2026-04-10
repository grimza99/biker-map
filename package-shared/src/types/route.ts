export type RouteProvider = "naver" | "etc";
export type RouteSourceType = "curated" | "user";
export type RouteRegion =
  | "seoul"
  | "busan"
  | "daegu"
  | "incheon"
  | "gwangju"
  | "daejeon"
  | "ulsan"
  | "sejong"
  | "jeju"
  | "all";

export type RoutesQuery = {
  departureRegion?: RouteRegion;
  destinationRegion?: RouteRegion;
  maxDistanceKm?: number;
};

export type RouteListItem = {
  id: string;
  title: string;
  departureRegion?: RouteRegion;
  destinationRegion?: RouteRegion;
  summary: string;
  provider: RouteProvider;
  externalMapUrl: string;
  thumbnailUrl?: string;
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  tags: string[];
  sourceType: RouteSourceType;
};

export type RoutesListResponseData = {
  items: RouteListItem[];
};

export interface CreateRouteBody extends Omit<RouteListItem, "id"> {
  // id는 서버에서 생성하므로 클라이언트에서는 제공하지 않음
}

export type CreateRouteResponseData = {
  id: string;
  createdAt: string;
};

export type UpdateRouteBody = Partial<CreateRouteBody>;

export type UpdateRouteResponseData = {
  id: string;
  updatedAt: string;
};

export type DeleteRouteResponseData = {
  id: string;
  deleted: true;
};
