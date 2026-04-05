"use client";

import { useCommunityPosts } from "@features/community/model/use-community-posts";
import type { CommunityCategorySlug } from "@package-shared/types/community";
import { Search } from "lucide-react";
import { startTransition, useDeferredValue, useState } from "react";

import {
  Button,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  PageWrapper,
  Pagination,
  SelectInput,
  Tabs,
  TabsList,
} from "@shared/ui";

import { PostList } from "@/entities/community";
import { communityCategories } from "@/entities/community/community-categories";
import { communityPosts } from "./community-content";

const categoryTabs = [
  { value: "all", label: "전체" },
  ...communityCategories.map((category) => ({
    value: category.slug,
    label: category.label,
  })),
];

const sortOptions = [
  { value: "latest", label: "최신순" },
  { value: "views", label: "조회수순" },
];

const pageSize = 12;

export default function CommunityPage() {
  const [category, setCategory] = useState<CommunityCategorySlug | undefined>();
  const [sort, setSort] = useState<"latest" | "views">("latest");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const deferredSearch = useDeferredValue(searchInput);

  const {
    data: postData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useCommunityPosts({
    category,
    page,
    pageSize,
    search: deferredSearch,
    sort,
  });

  // const posts = postData?.data.items ?? [];
  const posts = communityPosts;
  const total = postData?.meta?.total ?? 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <PageWrapper innerClassName="gap-4 md:gap-6">
      <div className="flex flex-col">
        <h1 className="m-0 text-[clamp(30px,5vw,44px)] font-semibold tracking-[var(--tracking-heading-xl)] text-text">
          게시글
        </h1>
        <div className="flex justify-end">
          <Button variant="primary" size="md">
            <a href="/posts/new">글 작성하기</a>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-3 w-full flex-col items-start md:flex-row md:items-end">
        <Input
          type="search"
          placeholder="제목, 본문, 작성자명으로 검색"
          value={searchInput}
          onChange={(event) => {
            const nextValue = event.target.value;
            startTransition(() => {
              setSearchInput(nextValue);
              setPage(1);
            });
          }}
          className="flex-1"
          leftIcon={<Search className="h-4 w-4" aria-hidden="true" />}
        />
        <SelectInput
          value={sort}
          onValueChange={(value) => {
            startTransition(() => {
              setSort(value as "latest" | "views");
              setPage(1);
            });
          }}
          className="min-w-30 max-w-100"
          options={sortOptions}
        />
      </div>

      <Tabs
        value={category ?? "all"}
        onValueChange={(value) => {
          startTransition(() => {
            setCategory(
              value === "all" ? undefined : (value as CommunityCategorySlug)
            );
            setPage(1);
          });
        }}
      >
        <TabsList
          className="w-full max-w-full flex-wrap rounded-[18px] border-none bg-transparent p-0"
          items={categoryTabs}
        />
      </Tabs>

      {isLoading && <LoadingState label="게시글을 불러오는 중" />}

      {isError && (
        <ErrorState
          title="커뮤니티 글 목록을 불러오지 못했습니다"
          message={error instanceof Error ? error.message : undefined}
        />
      )}

      {!isLoading && !isError && posts.length === 0 && (
        <EmptyState title="카테고리에 글이 아직 없습니다." />
      )}

      {!isLoading && !isError && posts.length > 0 && <PostList posts={posts} />}
      <div className="w-full flex justify-center items-center mt-5 ">
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(nextPage) => startTransition(() => setPage(nextPage))}
        />
      </div>
    </PageWrapper>
  );
}
