"use client";

import { CommunityPostCard } from "@/entities/community";
import { useMyPosts } from "@features/me/model/use-my-posts";
import { categoryLabelMap } from "@package-shared/model";
import { EmptyState, ErrorState, LoadingState, Pagination } from "@shared/ui";
import { startTransition, useEffect, useState } from "react";

export function MyPostsSection() {
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const myPostsQuery = useMyPosts({ page, pageSize });
  const posts = myPostsQuery.data?.data.items ?? [];
  const total = myPostsQuery.data?.meta?.total ?? 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

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
          key={post.id}
          post={post}
          categoryLabel={categoryLabelMap[post.category]}
        />
      ))}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(nextPage) => {
          startTransition(() => setPage(nextPage));
        }}
      />
    </div>
  );
}
