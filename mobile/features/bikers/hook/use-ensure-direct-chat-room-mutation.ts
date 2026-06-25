import { useMutation } from "@tanstack/react-query";

import {
  API_PATHS,
  type TEnsureDirectChatRoomBody,
  type TEnsureDirectChatRoomResponseData,
} from "@package-shared/index";

import { apiFetch } from "@/shared";

export function useEnsureDirectChatRoomMutation() {
  return useMutation({
    mutationFn: (payload: TEnsureDirectChatRoomBody) =>
      apiFetch.post<TEnsureDirectChatRoomResponseData>(
        API_PATHS.bikers.ensureDirectChatRoom,
        payload
      ),
  });
}
