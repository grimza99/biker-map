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
  search?: string;
  departureRegion?: RouteRegion;
  destinationRegion?: RouteRegion;
  maxDistanceKm?: number;
};

export type RouteCoordinate = {
  lat: number;
  lng: number;
};

export type RouteWaypoint = RouteCoordinate & {
  id?: string;
  sequence: number;
};

export type RoutePathPoint = RouteCoordinate;

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
  createdById?: string;
  departureLat?: number;
  departureLng?: number;
  destinationLat?: number;
  destinationLng?: number;
  directionsCalculatedAt?: string;
};

export type RouteDetail = RouteListItem & {
  content: string;
  waypoints: RouteWaypoint[];
  path: RoutePathPoint[];
};

export type RoutesListResponseData = {
  items: RouteListItem[];
};

export type CreateRouteBody = Omit<
  RouteListItem,
  | "id"
  | "createdById"
  | "directionsCalculatedAt"
  | "departureLat"
  | "departureLng"
  | "destinationLat"
  | "destinationLng"
> & {
  content: string;
  departureLat: number;
  departureLng: number;
  destinationLat: number;
  destinationLng: number;
  waypoints: RouteWaypoint[];
};

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
