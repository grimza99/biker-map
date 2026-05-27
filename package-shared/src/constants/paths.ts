export const PATHS = {
  map: {
    entry: "/map",
    list: "/map/list",
    detailPlace: (placeId: string) => `/map/places/${placeId}`,
    detailRoute: (routeId: string) => `/map/routes/${routeId}`,
  },
};
