import { apiFetch } from "@/shared";
import { API_PATHS } from "@package-shared/constants";
import {
  PlacesListResponseData,
  type PlacesQuery,
} from "@package-shared/index";

export async function getPlaceList(query: PlacesQuery = {}) {
  const placeQuery = buildPlaceQuery(query);

  const res = await apiFetch.get<PlacesListResponseData>(
    query ? `${API_PATHS.places.list}?${placeQuery}` : API_PATHS.places.list
  );
  return res.data.items;
}

function buildPlaceQuery(query: PlacesQuery) {
  const searchParams = new URLSearchParams();

  if (query.category) {
    searchParams.set("category", query.category);
  }

  if (query.search?.trim()) {
    searchParams.set("search", query.search.trim());
  }

  if (query.cursor) {
    searchParams.set("cursor", String(query.cursor));
  }

  if (query.limit) {
    searchParams.set("limit", String(query.limit));
  }

  return searchParams.toString();
}
