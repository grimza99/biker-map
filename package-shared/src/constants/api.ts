const BASE_URL = "/api";
export const API_PATHS = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    signup: `${BASE_URL}/auth/signup`,
    logout: `${BASE_URL}/auth/logout`,
    refresh: `${BASE_URL}/auth/refresh`,
  },
  me: {
    profile: `${BASE_URL}/me`,
    posts: `${BASE_URL}/me/posts`,
    routes: `${BASE_URL}/me/routes`,
    favorites: `${BASE_URL}/me/favorites`,
  },
  community: {
    posts: `${BASE_URL}/posts`,
    post: (postId: string) => `${BASE_URL}/posts/${postId}`,
    comments: (postId: string) => `${BASE_URL}/posts/${postId}/comments`,
    reply: (commentId: string) => `${BASE_URL}/comments/${commentId}/replies`,
  },
  uploads: {
    image: `${BASE_URL}/uploads/image`,
  },
  places: {
    list: `${BASE_URL}/places`,
    geocode: `${BASE_URL}/places/geocode`,
    detail: (placeId: string) => `${BASE_URL}/places/${placeId}`,
  },

  routes: {
    list: `${BASE_URL}/routes`,
    detail: (routeId: string) => `${BASE_URL}/routes/${routeId}`,
    mapPaths: `${BASE_URL}/map/routes`,
  },
  notifications: {
    list: `${BASE_URL}/notifications`,
    readAll: `${BASE_URL}/notifications/read-all`,
    read: (notificationId: string) =>
      `${BASE_URL}/notifications/${notificationId}/read`,
  },
  reactions: {
    create: `${BASE_URL}/reactions`,
  },
  favorites: {
    list: `${BASE_URL}/favorites`,
    detail: (favoriteId: string) => `${BASE_URL}/favorites/${favoriteId}`,
  },
};
