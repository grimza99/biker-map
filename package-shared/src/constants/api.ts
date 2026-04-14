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
    detail: (placeId: string) => `${BASE_URL}/places/${placeId}`,
  },

  routes: {
    list: `${BASE_URL}/routes`,
    detail: (routeId: string) => `${BASE_URL}/routes/${routeId}`,
  },
};
