import { Eye, MessageSquare } from "lucide-react";

export function MetaCounts({
  commentCount,
  viewCount,
}: {
  commentCount?: number;
  viewCount?: number;
}) {
  const hasCommentCount = typeof commentCount === "number";
  const hasViewCount = typeof viewCount === "number";

  if (!hasCommentCount && !hasViewCount) {
    return null;
  }
  return (
    <div className="flex items-center gap-4">
      {hasCommentCount && (
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-4 w-4" />
          {commentCount}
        </span>
      )}
      {hasViewCount && (
        <span className="inline-flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {viewCount}
        </span>
      )}
    </div>
  );
}
