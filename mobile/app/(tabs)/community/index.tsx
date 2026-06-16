import { Alert, StyleSheet, View } from "react-native";
import { useCallback, useEffect, useState } from "react";

import { CommunityPost, categoryLabelMap } from "@package-shared/index";

import { AppText, Button, Input, Pagination } from "@/components/common";
import { getCommunityPostList } from "@/entities/community/model/community-post-api";
import { PostCard } from "@/entities/community/ui/PostCard";
import { AppScreen } from "@/components/shell";

export default function CommunityScreen() {
  const [isLoading, setIsLoading] = useState(true);

  const [postList, setPostList] = useState<CommunityPost[]>([]);
  const loadPostList = useCallback(async () => {
    try {
      const communityPostListData = await getCommunityPostList();

      setPostList(communityPostListData.data.items);
    } catch (error) {
      Alert.alert(
        "루틴 조회 실패",
        error instanceof Error ? error.message : "오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPostList();
  }, [loadPostList]);

  if (isLoading) {
    return null;
    //todo isLoading
  }

  return (
    <AppScreen title="커뮤니티">
      <View style={styles.communityPostList}>
        {postList.length > 0 &&
          postList.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              categoryLabel={categoryLabelMap[post.category]}
            />
           ))
         ) : (
           <View className="items-center gap-2 rounded-3xl border border-border bg-panel px-4 py-6">
             <AppText className="text-base font-semibold">
              조건에 맞는 글이 없습니다.
            </AppText>
            <AppText tone="muted" className="text-sm">
              카테고리나 검색어를 조정해 다시 확인해보세요.
             </AppText>
           </View>
         )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  communityPostList: {
    flexDirection: "column",
    borderRadius: 24,
    borderColor: "#1c334d",
    backgroundColor: "#0e1d31",
    padding: 20,
    gap: 10,
  },
});
