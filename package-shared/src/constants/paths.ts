export const PATHS = {
  map: {
    entry: "/map" as const,
    list: "/map/list",
    detailPlace: (placeId: string) => `/map/places/${placeId}`,
    detailRoute: (routeId: string) => `/map/routes/${routeId}`,
  },
  auth: "/auth" as const,
};
