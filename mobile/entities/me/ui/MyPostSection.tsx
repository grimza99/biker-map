import { View } from "react-native";
import { useState } from "react";

import { useMyPosts } from "../model";
import { Pagination } from "@/components/common";
import { PostCard } from "@/entities/community";

const MY_POST_SECTION_PAGE_SIZE = 5;
export function MyPostSection() {
  const [page, setPage] = useState(1);
  const { data } = useMyPosts({
    page: page,
    pageSize: MY_POST_SECTION_PAGE_SIZE,
  });
  const totalPages = Math.max(
    1,
    Math.ceil((data?.meta?.total || 0) / MY_POST_SECTION_PAGE_SIZE)
  );
  return (
    <>
      <View className="flex flex-col gap-2.5">
        {data?.data.items.map((post) => (
          <PostCard key={post.id} post={post} categoryLabel={post.category} />
        ))}
      </View>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </>
  );
}
