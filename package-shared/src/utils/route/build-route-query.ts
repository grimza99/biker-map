import { RoutesQuery } from "../../types/route";

export function buildRouteQuery(query: RoutesQuery) {
  const searchParams = new URLSearchParams();

  if (query.search?.trim()) {
    searchParams.set("search", query.search.trim());
  }

  if (query.departureRegion) {
    searchParams.set("departureRegion", query.departureRegion);
  }

  if (query.destinationRegion) {
    searchParams.set("destinationRegion", query.destinationRegion);
  }

  if (query.maxDistanceKm !== undefined) {
    searchParams.set("maxDistanceKm", String(query.maxDistanceKm));
  }

  if (query.cursor) {
    searchParams.set("cursor", query.cursor);
  }

  if (query.limit !== undefined) {
    searchParams.set("limit", String(query.limit));
  }

  return searchParams.toString();
}
