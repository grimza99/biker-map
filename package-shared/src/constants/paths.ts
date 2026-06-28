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
  community: {
    entry: "/posts" as const,
    createPost: "/posts/new" as const,
  },
  route: {
    list: "/routes",
  },
  me: "/me" as const,
  admin: "/admin" as const,
};
