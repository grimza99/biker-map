export type FavoriteTargetType = "post" | "route";

export type FavoritesQuery = {
  type?: FavoriteTargetType;
  cursor?: string;
  limit?: number;
};

export type FavoriteItem = {
  id: string;
  targetType: FavoriteTargetType;
  targetId: string;
  title: string;
  subtitle?: string;
};

export type FavoritesListResponseData = {
  items: FavoriteItem[];
};

export type CreateFavoriteBody = {
  targetType: FavoriteTargetType;
  targetId: string;
};

export type CreateFavoriteResponseData = {
  id: string;
  targetType: FavoriteTargetType;
  targetId: string;
};

export type DeleteFavoriteResponseData = {
  deleted: true;
  favoriteId: string;
};
