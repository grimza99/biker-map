import { PATHS } from "@package-shared/constants";
/**
 * @description PATHS는 이미 접두어로 / 가 붙어있습니다
 * @example PATHS.auth = /auth
 */

const AUTH = "/(auth)";
const TABS = "/(tabs)";

export const MOBILE_PATHS = {
  auth: `${AUTH}${PATHS.auth}` as const,
  map: `${TABS}${PATHS.map.entry}` as const,
  bikers: {
    entry: `${TABS}/bikers` as const,
    chat: `${TABS}/bikers/chats/[chatId]` as const,
  },
};
