import { getCommunityCategory } from "@/app/community/community-content";
import { CommunityPost } from "@package-shared/types/community";
import { CommunityPostCard } from "./post-card";

export default function PostList({ posts }: { posts: CommunityPost[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {posts.map((post) => {
        const categoryMeta = getCommunityCategory(post.category);

        return (
          <CommunityPostCard
            key={post.id}
            post={post}
            categoryLabel={categoryMeta?.label ?? post.category}
          />
        );
      })}
    </div>
  );
}
