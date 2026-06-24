import { View } from "react-native";

import { AppText } from "@/components/common";
import { cn } from "@/shared";
import { useMyFavorites, useMyPosts } from "../model";
import { Profile } from "@/shared/ui";
import { SummaryProfileSkeleton } from "./SummaryProfileSkeleton";

export function SummaryProfile() {
  const { data: favoritePosts, isLoading: favoritePostLoading } =
    useMyFavorites({ page: 0, pageSize: 0 }, "post");
  const { data: favoriteRoutes, isLoading: favoriteRouteLoading } =
    useMyFavorites({ page: 0, pageSize: 0 }, "route");
  const { data: myPosts, isLoading: myPostLoading } = useMyPosts({
    page: 1,
    pageSize: 1,
  });

  const totalFavoriteCount =
    (favoritePosts?.meta?.total || 0) + (favoriteRoutes?.meta?.total || 0);
  const myPostsCount = myPosts?.meta?.total;

  const isLoading =
    favoritePostLoading || favoriteRouteLoading || myPostLoading;
  return (
    <>
      {isLoading ? (
        <SummaryProfileSkeleton />
      ) : (
        <View className="flex-col gap-5">
          <Profile />
          <View className="border-2 border-border flex-row rounded-[18px] py-3 px-3 justify-around bg-panel-solid ">
            <SummaryItem label="작성글" value={myPostsCount} />
            <SummaryItem label="즐겨찾기" value={totalFavoriteCount} />
            <SummaryItem label="받은 좋아요" value={null} />
            {/* todo: 받은 좋아요 조회하는 기능 구현 */}
          </View>
        </View>
      )}
    </>
  );
}

function SummaryItem({
  value,
  label,
  className,
}: {
  value: number | string | null | undefined;
  label: string;
  className?: string;
}) {
  return (
    <View className={cn("flex flex-col items-center w-30", className)}>
      <AppText className="font-extrabold text-3xl text-accent">
        {value || 0}
      </AppText>
      <AppText className="font-semibold text-lg">{label}</AppText>
    </View>
  );
}
