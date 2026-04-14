export const queryKeys = {
  session: ["session"] as const,
  users: ["users"] as const,
  places: (params?: Record<string, unknown>) =>
    ["places", params ?? {}] as const,
  place: (placeId: string) => ["places", placeId] as const,
  routes: (params?: Record<string, string | number | undefined>) =>
    ["routes", params ?? {}] as const,
  route: (routeId: string) => ["routes", routeId] as const,
  favorites: ["favorites"] as const,
  posts: (params?: Record<string, string | number | undefined>) =>
    ["posts", params ?? {}] as const,
  post: (postId: string) => ["posts", postId] as const,
  comments: (postId: string) => ["comments", postId],
  reactions: ["reactions"] as const,
  notifications: (params?: Record<string, string | number | undefined>) =>
    ["notifications", params ?? {}] as const,
};
