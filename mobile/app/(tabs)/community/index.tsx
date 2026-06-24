import { Feather, Ionicons } from "@expo/vector-icons";
import { type Href, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { useState } from "react";

import {
  categoryLabelMap,
  communityCategoryOptions,
  type CommunityCategorySlug,
  bikerMapTheme,
} from "@package-shared/index";

import { AppText, Button, Input, Pagination } from "@/components/common";
import { AppScreen } from "@/components/shell";
import { MOBILE_PATHS, ScreenState } from "@/shared";
import { usePostList, PostCard } from "@/entities/community";
import { ListSkeleton } from "@/widgets/ui";

const COMMUNITY_PAGE_SIZE = 5;
type CommunityCategoryFilter = CommunityCategorySlug | "all";

const COMMUNITY_CATEGORY_FILTERS: {
  label: string;
  value: CommunityCategoryFilter;
}[] = [{ label: "전체", value: "all" }, ...communityCategoryOptions];

export default function CommunityScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CommunityCategoryFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: postListData,
    isLoading,
    isError,
    error,
    refetch,
  } = usePostList({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    search: searchQuery,
    page: currentPage,
    pageSize: COMMUNITY_PAGE_SIZE,
    sort: "latest",
  });

  if (isLoading && !postListData) {
    return (
      <AppScreen title="커뮤니티">
        <ListSkeleton />
      </AppScreen>
    );
  }

  if (isError || !postListData) {
    return (
      <ScreenState
        title="데이터를 불러오는데 실패 했습니다."
        description={
          error instanceof Error ? error.message : "잠시 후 다시 시도해주세요."
        }
        variant="error"
        refetch={() => {
          void refetch();
        }}
      />
    );
  }

  const postList = postListData.data.items;
  const totalPost = postListData?.meta?.total ?? postListData.data.items.length;
  const totalPages = Math.max(1, Math.ceil(totalPost / COMMUNITY_PAGE_SIZE));

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
          총 {totalPost}개의 글
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
          <ScreenState
            title=""
            description="조건에 맞는 글이 없습니다."
            variant="not-found"
            canGoBack={false}
            className="min-h-100"
          />
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
