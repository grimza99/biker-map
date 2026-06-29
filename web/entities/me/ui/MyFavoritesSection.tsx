"use client";
import { useState } from "react";

import { FavoriteTargetType, categoryLabelMap } from "@package-shared/index";

import { RouteCard } from "@/entities/route/ui/RouteCard";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Pagination,
  Tabs,
  TabsContent,
  TabsList,
} from "@shared/ui";

import { PostCard } from "@/entities/community";
import { useMyFavorites } from "../model";

const FAVORITE_PAGE_SIZE = 4;

export function MyFavoritesSection() {
  const [page, setPage] = useState(1);
  const [favoriteType, setFavoriteType] = useState<FavoriteTargetType>("post");
  const currentPage = Math.max(page, 1);

  const favoritePostsQuery = useMyFavorites(
    { page: currentPage, pageSize: FAVORITE_PAGE_SIZE },
    "post",
    favoriteType === "post"
  );
  const favoriteRoutesQuery = useMyFavorites(
    { page: currentPage, pageSize: FAVORITE_PAGE_SIZE },
    "route",
    favoriteType === "route"
  );
  const posts = favoritePostsQuery.data?.data.items ?? [];
  const routes = favoriteRoutesQuery.data?.data.items ?? [];
  const activeTotal =
    favoriteType === "post"
      ? favoritePostsQuery.data?.meta?.total ?? 0
      : favoriteRoutesQuery.data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(activeTotal / FAVORITE_PAGE_SIZE));

  return (
    <div className="grid gap-4">
      <Tabs
        defaultValue="post"
        className="gap-5"
        onValueChange={(type) => {
          setFavoriteType(type as FavoriteTargetType);
          setPage(1);
        }}
      >
        <TabsList
          items={[
            { value: "post", label: "게시글" },
            { value: "route", label: "라이딩 경로" },
          ]}
        />
        <TabsContent value="post" className="grid gap-4">
          {favoritePostsQuery.isLoading ? (
            <LoadingState label={"좋아요 한 글을 불러오는 중"} />
          ) : favoritePostsQuery.isError ? (
            <ErrorState
              title={"좋아요 한 글을 불러오지 못했습니다"}
              message={
                favoritePostsQuery.error instanceof Error
                  ? favoritePostsQuery.error.message
                  : undefined
              }
            />
          ) : posts.length ? (
            <div className="grid gap-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  categoryLabel={categoryLabelMap[post.category]}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="좋아요 한 글이 없습니다"
              message="마음에 드는 커뮤니티 글에 하트를 눌러 저장해 보세요."
            />
          )}
        </TabsContent>

        <TabsContent value="route" className="text-sm leading-7 text-muted">
          {favoriteRoutesQuery.isLoading ? (
            <LoadingState label={"좋아요 한 경로를 불러오는 중"} />
          ) : favoriteRoutesQuery.isError ? (
            <ErrorState
              title={"좋아요 한 경로를 불러오지 못했습니다"}
              message={
                favoriteRoutesQuery.error instanceof Error
                  ? favoriteRoutesQuery.error.message
                  : undefined
              }
            />
          ) : routes.length ? (
            <div className="grid gap-4">
              {routes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="좋아요 한 경로가 없습니다"
              message="나중에 다시 보고 싶은 경로를 저장해 보세요."
            />
          )}
        </TabsContent>
      </Tabs>
      <Pagination
        page={currentPage}
        onPageChange={(nextPage) => setPage(nextPage)}
        totalPages={totalPages}
      />
    </div>
  );
}
