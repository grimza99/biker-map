type RouteUrlPoint = {
  lat: number;
  lng: number;
  name?: string;
};

type BuildNaverRouteUrlParams = {
  appname: string;
  departure: RouteUrlPoint;
  destination: RouteUrlPoint;
  waypoints?: RouteUrlPoint[];
};

function sanitizePointName(name?: string) {
  return name?.trim().slice(0, 40);
}

export function buildNaverRouteUrl({
  appname,
  departure,
  destination,
  waypoints = [],
}: BuildNaverRouteUrlParams) {
  const searchParams = new URLSearchParams();

  searchParams.set("slat", String(departure.lat));
  searchParams.set("slng", String(departure.lng));

  const departureName = sanitizePointName(departure.name);
  if (departureName) {
    searchParams.set("sname", departureName);
  }

  searchParams.set("dlat", String(destination.lat));
  searchParams.set("dlng", String(destination.lng));

  const destinationName = sanitizePointName(destination.name);
  if (destinationName) {
    searchParams.set("dname", destinationName);
  }

  waypoints.slice(0, 5).forEach((waypoint, index) => {
    const waypointIndex = index + 1;
    searchParams.set(`v${waypointIndex}lat`, String(waypoint.lat));
    searchParams.set(`v${waypointIndex}lng`, String(waypoint.lng));

    const waypointName = sanitizePointName(waypoint.name);
    if (waypointName) {
      searchParams.set(`v${waypointIndex}name`, waypointName);
    }
  });

  searchParams.set("appname", appname.trim() || "biker-map");

  return `nmap://route/car?${searchParams.toString()}`;
}
