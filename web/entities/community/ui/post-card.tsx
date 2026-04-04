import { Eye, MessageSquare } from "lucide-react";
import Link from "next/link";

import type { CommunityPost } from "@package-shared/types/community";
import { DefaultCardContainer, StatusChip } from "@shared/ui";

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
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusChip statusLabel={categoryLabel} className={chipColor} />
            {post.pinned && (
              <StatusChip
                statusLabel={"고정"}
                className="text-muted border-border bg-panel"
              />
            )}
          </div>
          <span className="text-xs text-muted">{post.timeLabel}</span>
        </div>

        <div className="grid gap-2">
          <h2 className="m-0 text-xl font-semibold tracking-(--tracking-heading-md) text-text">
            {post.title}
          </h2>
          <p className="m-0 line-clamp-2 text-sm leading-7 text-muted">
            {post.excerpt}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-muted">
          <span className="truncate font-medium text-text/88">
            {post.author}
          </span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              {post.commentCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-4 w-4" aria-hidden="true" />
              {post.viewCount}
            </span>
          </div>
        </div>
      </DefaultCardContainer>
    </Link>
  );
}
