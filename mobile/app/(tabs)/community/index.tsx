import { Feather, Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { useCallback, useEffect, useState } from "react";

import {
  categoryLabelMap,
  communityCategoryOptions,
  type CommunityCategorySlug,
  type CommunityPost,
  bikerMapTheme,
} from "@package-shared/index";

import { AppText, Button, Input, Pagination } from "@/components/common";
import { getCommunityPostList } from "@/entities/community/model/community-post-api";
import { PostCard } from "@/entities/community/ui/PostCard";
import { AppScreen } from "@/components/shell";
import { MOBILE_PATHS } from "@/shared";

const COMMUNITY_PAGE_SIZE = 5;
const COMMUNITY_CATEGORY_FILTERS: {
  label: string;
  value: CommunityCategorySlug | "all";
}[] = [{ label: "전체", value: "all" }, ...communityCategoryOptions];

export default function CommunityScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const handleSearch = () => {
    setSearchQuery(search);
    setCurrentPage(1);
  };
  return (
    <AppScreen
      title="커뮤니티"
      overlay={
        <Button
          size="icon"
          onPress={() =>
            router.push(MOBILE_PATHS.community.new as unknown as Href)
          }
        >
          <Ionicons name="pencil" size={24} color="white" />
        </Button>
      }
    >
      <View className="gap-3.5 rounded-3xl border border-border bg-panel p-4">
        <View className="flex-row items-start gap-3">
          <Input
            className="flex-1"
            value={search}
            onChangeText={(value) => {
              setSearch(value);
            }}
            placeholder="제목, 본문 검색"
            leftIcon={
              <Feather
                name="search"
                size={18}
                color={bikerMapTheme.colors.muted}
              />
            }
          />
          <Button size="sm" onPress={handleSearch}>
            <Feather name="search" size={20} color="white" />
          </Button>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2.5 pr-2"
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

      <View className="flex-row items-center justify-between">
        <AppText tone="subtle" className="text-sm font-semibold">
          총 {totalPostCount}개의 글
        </AppText>
      </View>

      <View className="flex-col gap-2.5">
        {postList.length > 0 ? (
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </AppScreen>
  );
}
