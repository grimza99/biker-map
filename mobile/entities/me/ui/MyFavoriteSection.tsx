import { View } from "react-native";
import { useState } from "react";

import { useMyFavorites } from "../model";
import { Button, Pagination } from "@/components/common";
import { PostCard } from "@/entities/community";
import { RouteCard } from "@/entities/route";

type TFavoriteTab = "post" | "route";
const MY_FAVORITE_SECTION_PAGE_SIZE = 5;

export function MyFavoriteSection() {
  const [tab, setTab] = useState<TFavoriteTab>("post");
  const [page, setPage] = useState(1);
  const currentPage = Math.max(page, 1);

  const { data: favoritePostData } = useMyFavorites(
    { page: currentPage, pageSize: MY_FAVORITE_SECTION_PAGE_SIZE },
    "post",
    tab === "post"
  );
  const { data: favoriteRouteData } = useMyFavorites(
    { page: currentPage, pageSize: MY_FAVORITE_SECTION_PAGE_SIZE },
    "route",
    tab === "route"
  );
  const isSubmitting = false;

  const favoritedPostList = favoritePostData?.data.items;
  const favoritedRouteList = favoriteRouteData?.data.items;

  const activeTotal =
    tab === "post"
      ? favoritePostData?.meta?.total ?? 0
      : favoriteRouteData?.meta?.total ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(activeTotal / MY_FAVORITE_SECTION_PAGE_SIZE)
  );

  return (
    <>
      {/* 게시글, 경로 탭 */}
      <View className="w-full flex-row items-center justify-evenly gap-2 rounded-[20px]">
        <Button
          onPress={() => {
            setTab("post");
          }}
          disabled={isSubmitting}
          selected={tab === "post"}
          variant={tab === "post" ? "primary" : "secondary"}
          style={{ flex: 1 }}
        >
          게시글
        </Button>
        <Button
          onPress={() => {
            setTab("route");
          }}
          disabled={isSubmitting}
          selected={tab === "route"}
          variant={tab === "route" ? "primary" : "secondary"}
          style={{ flex: 1 }}
        >
          라이딩 경로
        </Button>
      </View>
      {/* 즐겨찾기 게시글 list */}
      {tab === "post" && (
        <View className="flex flex-col gap-2.5">
          {favoritedPostList?.map((post) => (
            <PostCard key={post.id} post={post} categoryLabel={post.category} />
          ))}
        </View>
      )}
      {/* 즐겨찾기 경로 list */}
      {tab === "route" && (
        <View className="flex flex-col gap-2.5">
          {favoritedRouteList?.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </View>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </>
  );
}
