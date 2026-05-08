export const queryKeys = {
  postsRoot: ["posts"] as const,
  session: ["session"] as const,
  myPosts: (params?: Record<string, string | number | undefined>) =>
    ["me", "posts", params ?? {}] as const,
  myRoutes: (params?: Record<string, string | number | undefined>) =>
    ["me", "routes", params ?? {}] as const,
  users: ["users"] as const,
  places: (params?: Record<string, unknown>) =>
    ["places", params ?? {}] as const,
  place: (placeId: string) => ["places", placeId] as const,
  routes: (params?: Record<string, string | number | undefined>) =>
    ["routes", params ?? {}] as const,
  route: (routeId: string) => ["routes", routeId] as const,
  routeMapPaths: ["routes", "map-paths"] as const,
  favorites: ["favorites"] as const,
  posts: (params?: Record<string, string | number | undefined>) =>
    ["posts", params ?? {}] as const,
  post: (postId: string) => ["posts", postId] as const,
  comments: (postId: string) => ["comments", postId],
  reactions: ["reactions"] as const,
  notificationsRoot: ["notifications"] as const,
  notifications: (params?: Record<string, string | number | undefined>) =>
    ["notifications", params ?? {}] as const,
};
