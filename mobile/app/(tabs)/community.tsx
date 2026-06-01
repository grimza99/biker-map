
import { Feather } from "@expo/vector-icons";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useCallback, useEffect, useState } from "react";

import {
  categoryLabelMap,
  communityCategoryOptions,
  type CommunityCategorySlug,
  type CommunityPost,
  bikerMapTheme,
} from "@package-shared/index";


import { AppText, Button, Input, Pagination } from "@/components/common";
import { AppScreen } from "../../components/shell";
import { getCommunityPostList } from "@/entities/community/model/community-post-api";
import { PostCard } from "@/entities/community/ui/PostCard";

const COMMUNITY_PAGE_SIZE = 5;
const COMMUNITY_CATEGORY_FILTERS: Array<{
  label: string;
  value: CommunityCategorySlug | "all";
}> = [{ label: "전체", value: "all" }, ...communityCategoryOptions];

export default function CommunityScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    CommunityCategorySlug | "all"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPostCount, setTotalPostCount] = useState(0);
  const [postList, setPostList] = useState<CommunityPost[]>([]);

  const loadPostList = useCallback(async () => {
    try {
      const communityPostListData = await getCommunityPostList({
        category: selectedCategory === "all" ? undefined : selectedCategory,
        page: currentPage,
        pageSize: COMMUNITY_PAGE_SIZE,
        search: searchQuery,
        sort: "latest",
      });

      setPostList(communityPostListData.data.items);
      setTotalPostCount(
        communityPostListData.meta?.total ??
          communityPostListData.data.items.length
      );
    } catch (error) {
      Alert.alert(
        "커뮤니티 조회 실패",
        error instanceof Error ? error.message : "오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory]);

  useEffect(() => {
    void loadPostList();
  }, [loadPostList]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalPostCount / COMMUNITY_PAGE_SIZE)
  );

  if (isLoading) {
    return null;
    //todo isLoading
  }

  return (
    <AppScreen title="커뮤니티">
      <View style={styles.controlsPanel}>
        <View style={styles.searchRow}>
          <View style={styles.searchField}>
            <Input
              value={searchQuery}
              onChangeText={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              placeholder="제목, 본문, 작성자 검색"
              leftIcon={
                <Feather
                  name="search"
                  size={18}
                  color={bikerMapTheme.colors.muted}
                />
              }
            />
          </View>
          <Button
            size="sm"
            onPress={() =>
              Alert.alert(
                "준비 중",
                "글 작성 화면 연결은 후속 작업에서 진행합니다."
              )
            }
          >
            글 작성
          </Button>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {COMMUNITY_CATEGORY_FILTERS.map((category) => (
            <Button
              key={category.value}
              size="sm"
              variant="secondary"
              selected={selectedCategory === category.value}
              onPress={() => {
                setSelectedCategory(category.value);
                setCurrentPage(1);
              }}
            >
              {category.label}
            </Button>
          ))}
        </ScrollView>
      </View>

      <View style={styles.summaryRow}>
        <AppText tone="subtle" className="text-sm font-semibold">
          총 {totalPostCount}개의 글
        </AppText>
      </View>

      <View style={styles.communityPostList}>
        {postList.length > 0 ? (
          postList.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              categoryLabel={categoryLabelMap[post.category]}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <AppText className="text-base font-semibold">
              조건에 맞는 글이 없습니다.
            </AppText>
            <AppText tone="muted" className="text-sm">
              카테고리나 검색어를 조정해 다시 확인해보세요.
            </AppText>
          </View>
        )}
      </View>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  controlsPanel: {
    gap: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
    padding: 16,
  },
  searchRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  searchField: {
    flex: 1,
  },
  categoryList: {
    gap: 10,
    paddingRight: 8,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  communityPostList: {
    flexDirection: "column",
    gap: 10,
  },
  emptyState: {
    alignItems: "center",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: bikerMapTheme.colors.border,
    backgroundColor: bikerMapTheme.colors.panel,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
});
