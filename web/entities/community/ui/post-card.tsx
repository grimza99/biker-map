import Link from "next/link";

import { formatDateByType } from "@/shared";
import type { CommunityPost } from "@package-shared/types/community";
import { DefaultCardContainer, StatusChip } from "@shared/ui";
import PostMetaCount from "./postMetaCount";

type CommunityPostCardProps = {
  post: CommunityPost;
  categoryLabel: string;
  className?: string;
};
export function CommunityPostCard({
  post,
  categoryLabel,
  className,
}: CommunityPostCardProps) {
  const chipColor =
    post.category === "notice"
      ? "bg-yellow-100/10 text-yellow-600 border-yellow-300/25"
      : post.category === "question"
      ? "bg-blue-100/10 text-blue-400 border-blue-300/25"
      : post.category === "info"
      ? "bg-green-100/10 text-green-600 border-green-300/25"
      : "";

  return (
    <Link href={`/posts/${post.id}`} className="block">
      <DefaultCardContainer className={className}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <StatusChip statusLabel={categoryLabel} className={chipColor} />
            {post.pinned && (
              <StatusChip
                statusLabel={"고정"}
                className="text-muted border-border bg-panel"
              />
            )}
            <h2 className="m-0 max-w-20 text-xl font-semibold tracking-(--tracking-heading-md) text-text truncate">
              {post.title}
            </h2>
          </div>
          <span className="text-xs text-muted">
            {formatDateByType(post.timeLabel, "dateTime")}
          </span>
        </div>

        <p className="ml-2 line-clamp-2 text-sm leading-7 text-muted">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between gap-3 text-sm text-muted">
          <span className="truncate font-medium text-text/88">
            {post.author}
          </span>
          <PostMetaCount
            commentCount={post.commentCount}
            viewCount={post.viewCount}
          />
        </div>
      </DefaultCardContainer>
    </Link>
  );
}
