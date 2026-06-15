import { FavoritesQuery } from "src/types/favorite";

export function buildFavoritesQuery(querys: FavoritesQuery) {
  const searchParams = new URLSearchParams();

  if (querys.page) {
    searchParams.set("page", String(querys.page));
  }

  if (querys.pageSize) {
    searchParams.set("pageSize", String(querys.pageSize));
  }

  return searchParams.toString();
}
