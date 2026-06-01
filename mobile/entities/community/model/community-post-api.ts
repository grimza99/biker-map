import { apiFetch } from "@/shared";
import { API_PATHS } from "@package-shared/constants";
import { PostsListResponseData } from "@package-shared/index";

export async function getCommunityPostList() {
  let postListData;
  try {
    const response = await apiFetch.get<PostsListResponseData>(
      API_PATHS.community.posts
    );
    postListData = response;
  } catch {
    //todo 토스트 메시지
  }
  //todo 토스트 등 성공 메시지

  return postListData ?? { data: { items: [] }, meta: null };
}
