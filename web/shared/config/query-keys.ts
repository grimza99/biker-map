export const queryKeys = {
  session: ["session"] as const,
  users: ["users"] as const,
  places: ["places"] as const,
  place: (placeId: string) => ["places", placeId] as const,
  routes: ["routes"] as const,
  route: (routeId: string) => ["routes", routeId] as const,
  favorites: ["favorites"] as const,
  posts: ["posts"] as const,
  post: (postId: string) => ["posts", postId] as const,
  comments: ["comments"] as const,
  reactions: ["reactions"] as const,
  notifications: ["notifications"] as const
};
