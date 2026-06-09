import { useQuery } from "@tanstack/react-query";

import {
  API_PATHS,
  buildPlaceQuery,
  type PlaceListItem,
  type PlacesListResponseData,
  type PlacesQuery,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

/**------------------------------------- place list --------------------------------*/
export function usePlaceList(query: PlacesQuery) {
  return useQuery<PlaceListItem[], Error>({
    queryFn: async () => {
      const placeQuery = buildPlaceQuery(query);

      const res = await apiFetch.get<PlacesListResponseData>(
        query ? `${API_PATHS.places.list}?${placeQuery}` : API_PATHS.places.list
      );
      return res.data.items;
    },
    queryKey: [
      "places",
      "list",
      {
        category: query.category,
        cursor: query.cursor,
        limit: query.limit,
        search: query.search,
      },
    ],
  });
}
