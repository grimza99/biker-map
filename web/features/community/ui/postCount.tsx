import { Eye, MessageSquare } from "lucide-react";

export default function PostCount({
  commentCount,
  viewCount,
}: {
  commentCount: number;
  viewCount: number;
}) {
  return (
    <>
      <span className="inline-flex items-center gap-1">
        <MessageSquare className="h-4 w-4" />
        {commentCount}
      </span>
      <span className="inline-flex items-center gap-1">
        <Eye className="h-4 w-4" />
        {viewCount}
      </span>
    </>
  );
}
