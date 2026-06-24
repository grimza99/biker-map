export const PATHS = {
  map: {
    entry: "/map" as const,
    list: "/map/list",
    detailPlace: (placeId: string) => `/map/places/${placeId}`,
    detailRoute: (routeId: string) => `/map/routes/${routeId}`,
  },
  policy: {
    location: "/policy/location",
    privacy: "/policy/privacy",
    terms: "/policy/terms",
  },
  auth: "/auth" as const,
  coummunity: {
    entry: "/posts" as const,
  },
};
