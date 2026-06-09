import { PlacesQuery, PlaceViewport } from "src/types/place";

function serializeViewport(viewport?: PlaceViewport) {
  if (!viewport) {
    return null;
  }

  return [
    viewport.minLng,
    viewport.minLat,
    viewport.maxLng,
    viewport.maxLat,
  ].join(",");
}

export function buildPlaceQuery(query: PlacesQuery) {
  const searchParams = new URLSearchParams();

  if (query.search?.trim()) {
    searchParams.set("search", query.search.trim());
  }

  if (query.category) {
    searchParams.set("category", query.category);
  }

  const serializedViewport = serializeViewport(query.viewport);
  if (serializedViewport) {
    searchParams.set("viewport", serializedViewport);
  }

  if (query.cursor) {
    searchParams.set("cursor", String(query.cursor));
  }

  if (query.limit) {
    searchParams.set("limit", String(query.limit));
  }

  return searchParams.toString();
}
