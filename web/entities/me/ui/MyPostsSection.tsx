"use client";

import { CommunityPostCard } from "@/entities/community";
import { useMyPosts } from "@features/me/model/use-my-posts";
import { categoryLabelMap } from "@package-shared/model";
import { EmptyState, ErrorState, LoadingState } from "@shared/ui";

export function MyPostsSection() {
  const myPostsQuery = useMyPosts();
  const posts = myPostsQuery.data?.data.items ?? [];

  if (myPostsQuery.isLoading) {
    return <LoadingState label="내가 쓴 글을 불러오는 중" />;
  }

  if (myPostsQuery.isError) {
    return (
      <ErrorState
        title="내가 쓴 글을 불러오지 못했습니다"
        message={
          myPostsQuery.error instanceof Error
            ? myPostsQuery.error.message
            : undefined
        }
      />
    );
  }

  if (!posts.length) {
    return (
      <EmptyState
        title="아직 작성한 글이 없습니다"
        message="커뮤니티에서 첫 게시글을 작성해 보세요."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <CommunityPostCard
          post={post}
          categoryLabel={categoryLabelMap[post.category]}
        />
      ))}
    </div>
  );
}
