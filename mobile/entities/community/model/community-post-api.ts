import { apiFetch } from "@/shared";
import { API_PATHS } from "@package-shared/constants";
import { PostsListResponseData } from "@package-shared/index";

export async function getCommunityPostList() {
  return apiFetch.get<PostsListResponseData>(API_PATHS.community.posts);
}
