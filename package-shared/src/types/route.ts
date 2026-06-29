export type RouteProvider = "naver" | "etc";
export type RouteSourceType = "curated";
export type RouteRegion =
  | "seoul"
  | "busan"
  | "daegu"
  | "incheon"
  | "gwangju"
  | "daejeon"
  | "ulsan"
  | "sejong"
  | "jeju";
export type RouteRegionFilter = RouteRegion | "all";

export type RouteFormWaypointValue = {
  draftId: string;
  address: string;
  lat: string;
  lng: string;
};

export type RouteFormValues = {
  title: string;
  summary: string;
  content: string;
  departureRegion: RouteRegion;
  destinationRegion: RouteRegion;
  externalMapUrl: string;
  distanceKm: string;
  estimatedDurationMinutes: string;
  tags: string;
  sourceType: RouteSourceType;
  departureAddress: string;
  destinationAddress: string;
  departureLat: string;
  departureLng: string;
  destinationLat: string;
  destinationLng: string;
  waypoints: RouteFormWaypointValue[];
};

export type NormalizedWaypointsResult =
  | {
      data: Array<{
        sequence: number;
        lat: number;
        lng: number;
      }>;
    }
  | {
      error: string;
    };

export type RoutesQuery = {
  search?: string;
  departureRegion?: RouteRegionFilter;
  destinationRegion?: RouteRegionFilter;
  maxDistanceKm?: number;
  cursor?: string;
  limit?: number;
};

export type RouteCoordinate = {
  lat: number;
  lng: number;
};

export type RouteMapPathItem = RouteListItem & {
  routeId: string;
  path: RoutePathPoint[];
};

export type RouteMapPathsResponseData = {
  items: RouteMapPathItem[];
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
  favoriteId?: string;
  favorited?: boolean;
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

export type UpdateRouteBody = Partial<Omit<CreateRouteBody, "thumbnailUrl">> & {
  thumbnailUrl?: string | null;
};

export type UpdateRouteResponseData = {
  id: string;
  updatedAt: string;
};

export type DeleteRouteResponseData = {
  id: string;
  deleted: true;
};
