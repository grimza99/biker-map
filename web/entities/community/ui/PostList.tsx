import { CommunityPost } from "@package-shared/types/community";
import { communityCategories } from "../community-categories";
import { CommunityPostCard } from "./post-card";

export function getCommunityCategory(slug: string) {
  return communityCategories.find((category) => category.slug === slug);
}

export default function PostList({ posts }: { posts: CommunityPost[] }) {
  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => {
        const categoryMeta = getCommunityCategory(post.category);

        return (
          <CommunityPostCard
            key={post.id}
            post={post}
            categoryLabel={categoryMeta?.label ?? post.category}
            className="p-3 rounded-2xl"
          />
        );
      })}
    </div>
  );
}
