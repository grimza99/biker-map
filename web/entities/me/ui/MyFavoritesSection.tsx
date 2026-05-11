"use client";

import { CommunityPostCard } from "@/entities/community";
import { RouteCard } from "@/entities/route/ui/RouteCard";
import { useMyFavoritePosts } from "@features/me/model/use-my-favorite-posts";
import { useMyFavoriteRoutes } from "@features/me/model/use-my-favorite-routes";
import { categoryLabelMap } from "@package-shared/model";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Tabs,
  TabsContent,
  TabsList,
} from "@shared/ui";

export function MyFavoritesSection() {
  const favoritePostsQuery = useMyFavoritePosts(true);
  const favoriteRoutesQuery = useMyFavoriteRoutes(true);
  const posts = favoritePostsQuery.data?.data.items ?? [];
  const routes = favoriteRoutesQuery.data?.data.items ?? [];

  return (
    <div className="grid gap-4">
      <Tabs defaultValue="post" className="gap-5">
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
                <CommunityPostCard
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
    </div>
  );
}
