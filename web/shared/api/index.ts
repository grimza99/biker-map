export type { ApiError, ApiResponse } from "@package-shared/types/api";
export { getApiSession, requireApiSession } from "./auth";
export {
  apiErrorSchema,
  listResponseSchema,
  paginationSchema,
} from "./contracts";
export { ApiClientError, apiFetch } from "./http";
export {
  buildCursor,
  getBooleanParam,
  getCursorOffset,
  getNumberParam,
  getStringParam,
  getViewportParam,
} from "./request";
export {
  badRequest,
  created,
  forbidden,
  internalServerError,
  notFound,
  notImplemented,
  ok,
  unauthorized,
} from "./response";
export * from "./supabase";
export { mapNotificationItem } from "./supabase-mappers";
export { loadProfileNameMap } from "./supabase-profiles";
export {
  getRecordBoolean,
  getRecordNumber,
  getRecordRelativeLabel,
  getRecordString,
  getRecordStringArray,
  paginateByCursor,
} from "./supabase-record";
export { parseBody, parseRequestBody } from "./validation";

/**------------------------------mappers------------------------ */
export {
  mapPlaceDetail,
  mapPlaceListItem,
  placeCategories,
} from "./supabase-mappers/place-mepper";
export {
  communityCategories,
  mapCommunityPostDetail,
  mapCommunityPostItem,
} from "./supabase-mappers/post-mapper";

export {
  mapRouteDetail,
  mapRouteListItem,
} from "./supabase-mappers/route-mapper";
