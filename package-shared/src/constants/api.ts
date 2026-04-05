const BASE_URL = "/api";
export const API_PATHS = {
  auth: {
    login: `${BASE_URL}/auth/login`,
    signup: `${BASE_URL}/auth/signup`,
    logout: `${BASE_URL}/auth/logout`,
    refresh: `${BASE_URL}/auth/refresh`,
    me: `${BASE_URL}/me`,
  },
  community: {
    posts: `${BASE_URL}/posts`,
  },
};
