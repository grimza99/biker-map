import { Alert, ScrollView, StyleSheet, Text } from "react-native";
import { useCallback, useEffect, useState } from "react";

import { CommunityPost } from "@package-shared/index";

import { AppScreen } from "../../components/shell";
import { getCommunityPostList } from "@/features/community/model/community-post-api";

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
      <ScrollView style={[styles.communityPostList]}>
        {postList.length > 0 && postList.map((post) => <Text>{post.id}</Text>)}
      </ScrollView>
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
